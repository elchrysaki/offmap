"""Stage 2 research pipeline (CLAUDE.md §15's staged AI-scale plan).

Runs as a scheduled GitHub Action against pending `opportunity` rows,
through a dedicated least-privilege Postgres role (`github_pipeline`, see
supabase/migrations/20260829182855_github_pipeline_role.sql) instead of the
Gemini API this project's live `/admin` dashboard uses -- a second,
independently-metered pool for when submission volume outgrows what's
comfortable on the Gemini key. GitHub Models (via the workflow's own
GITHUB_TOKEN, no separate key) does the research; Tavily is a fallback
search only, used exactly like offmap-hub's old pipeline and the current
Gemini prompt: fetch the submitted link directly first, search only if that
link turns out broken or unrelated.

Writes the *same* JSON shape src/lib/ai/verify-opportunity.ts already
produces into `ai_research`, so the confidence-bucketed admin queue and
batch-apply screen (src/lib/admin/opportunity-buckets.ts) work unchanged
regardless of which pipeline populated the field. Never touches a gate
field (apply_url, funding, deadline_at, etc.) -- CLAUDE.md §6's rule is
enforced twice here: this script doesn't attempt it, and the database role
it runs as is physically incapable of it (column-scoped GRANT).
"""

from __future__ import annotations

import ipaddress
import json
import os
import re
import socket
import sys
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urlparse

import psycopg2
import psycopg2.extras
import requests

GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference/chat/completions"
TAVILY_SEARCH_ENDPOINT = "https://api.tavily.com/search"
AI_MODEL = os.environ.get("AI_MODEL", "openai/gpt-4.1")

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
DATABASE_URL = os.environ["DATABASE_URL"]
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "").strip()

MAX_PER_RUN = int(os.environ.get("MAX_PER_RUN", "20"))
REQUEST_DELAY_SECONDS = 2

# ============================================================
# SSRF / fetch safety -- same rules as src/lib/submission-guard.ts and
# offmap-hub's old classify_submission_risk.py, reimplemented here since
# this script runs outside the Next.js app entirely.
# ============================================================

MAX_REDIRECTS = 5
MAX_PAGE_BYTES = 1_500_000
MAX_PAGE_TEXT_CHARS = 6_000
CONNECT_TIMEOUT_SECONDS = 8
READ_TIMEOUT_SECONDS = 20
ALLOWED_SCHEMES = {"http", "https"}
BLOCKED_HOST_SUFFIXES = (".localhost", ".local", ".internal", ".home", ".lan")


def is_unsafe_url(url: str) -> str | None:
    try:
        parsed = urlparse(url)
    except ValueError:
        return "malformed-url"

    if parsed.scheme not in ALLOWED_SCHEMES:
        return "disallowed-scheme"
    if parsed.username or parsed.password:
        return "embedded-credentials"

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return "malformed-url"
    if hostname == "localhost" or hostname.endswith(BLOCKED_HOST_SUFFIXES):
        return "private-network-target"

    try:
        address = ipaddress.ip_address(hostname)
        if not address.is_global:
            return "private-network-target"
    except ValueError:
        # Not a literal IP -- resolve it and check the actual address,
        # since "example.com" can still point at a private/internal IP.
        try:
            resolved = socket.gethostbyname(hostname)
            if not ipaddress.ip_address(resolved).is_global:
                return "private-network-target"
        except socket.gaierror:
            return "unresolvable-host"

    return None


class _TextExtractor(HTMLParser):
    """Minimal tag-stripping text extractor -- stdlib only, no new
    dependency, same approach offmap-hub's research_opportunity.py used."""

    def __init__(self) -> None:
        super().__init__()
        self._skip_depth = 0
        self.chunks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in ("script", "style", "noscript"):
            self._skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style", "noscript") and self._skip_depth > 0:
            self._skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._skip_depth == 0 and data.strip():
            self.chunks.append(data.strip())

    def text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.chunks)).strip()


def fetch_page_text(url: str) -> tuple[str | None, str | None]:
    """Returns (text, error_reason). error_reason is None on success."""
    reason = is_unsafe_url(url)
    if reason:
        return None, reason

    try:
        response = requests.get(
            url,
            headers={"User-Agent": "OffMapResearchBot/1.0 (+https://offmap.gr)"},
            timeout=(CONNECT_TIMEOUT_SECONDS, READ_TIMEOUT_SECONDS),
            allow_redirects=True,
            stream=True,
        )
    except requests.RequestException as exc:
        return None, f"fetch-failed: {exc}"

    if len(response.history) > MAX_REDIRECTS:
        return None, "too-many-redirects"

    content_type = response.headers.get("content-type", "")
    if "text/html" not in content_type and "text/plain" not in content_type:
        return None, f"unsupported-content-type: {content_type}"

    raw = response.raw.read(MAX_PAGE_BYTES + 1, decode_content=True)
    if len(raw) > MAX_PAGE_BYTES:
        raw = raw[:MAX_PAGE_BYTES]

    try:
        html = raw.decode(response.encoding or "utf-8", errors="ignore")
    except (LookupError, UnicodeDecodeError):
        html = raw.decode("utf-8", errors="ignore")

    extractor = _TextExtractor()
    extractor.feed(html)
    text = extractor.text()[:MAX_PAGE_TEXT_CHARS]

    if len(text) < 200:
        return None, "page-content-too-thin"

    return text, None


def tavily_search(query: str) -> str | None:
    if not TAVILY_API_KEY:
        return None
    try:
        response = requests.post(
            TAVILY_SEARCH_ENDPOINT,
            json={"api_key": TAVILY_API_KEY, "query": query, "max_results": 3},
            timeout=(CONNECT_TIMEOUT_SECONDS, READ_TIMEOUT_SECONDS),
        )
        response.raise_for_status()
        results = response.json().get("results", [])
    except (requests.RequestException, ValueError):
        return None

    if not results:
        return None

    return "\n\n".join(
        f"Source: {item.get('url')}\n{item.get('content', '')[:1500]}" for item in results[:3]
    )


# ============================================================
# The research call -- same JSON contract as
# src/lib/ai/verify-opportunity.ts's OpportunityResearch type, so the
# confidence-bucketed queue and batch-apply screen work unchanged no
# matter which pipeline populated ai_research.
# ============================================================

SYSTEM_PROMPT = """You research student and early-career opportunities for OffMap.

You do not approve, reject, publish, or decide anything -- you produce a research summary for a human moderator to read and act on. Nothing you write is ever shown to a student directly; it only reaches the public site if a moderator manually copies it into the real listing after checking it.

You are given the text already fetched from a source page (or, if that page could not be fetched, search-result snippets instead -- this is marked clearly below). Cross-check every field this task tracks against what is literally stated in that text. Do not use outside knowledge, memory, or assumptions -- only what the provided text says.

Rules that apply throughout:
- Every value you report must be traceable to the text you were given. Never invent a deadline, contact email, funding detail, or any other fact that isn't literally supported by it.
- If you cannot confirm something from the given text, its value is null and its confidence is "not-found" -- never guess, never infer, never fill a gap with a plausible-sounding value.
- Some fields (audience/eligibility category tags, effort classification, subject taxonomy) are editorial judgment calls a moderator makes, not facts a page states -- do not attempt to answer those; they are not in the schema below for that reason.
- For every field, note whether the source's value matches, contradicts, or can't be compared against the value already on file (given to you below as "Current value on file").
- List anything you found in the source that OffMap's current listing does NOT mention, under "additional_findings" -- never merge it silently into another field.
- List anything the source clearly does NOT state (so a moderator shouldn't assume it), under "missing_information".
- List any claim you deliberately did NOT carry into a field because you could not verify it against the given text, under "excluded_claims" -- with a one-line reason each.

Return ONLY a single valid JSON object, no markdown fences, no commentary, matching this shape exactly:

{
  "research_method": "source_page" | "fallback_search" | "source_page_and_search" | "no_source_available",
  "checked_urls": [{ "url": string, "role": "official_url" | "apply_url" | "search_result", "fetched_ok": boolean, "matches_opportunity": boolean | null, "note": string }],
  "fallback_reason": string | null,
  "identity_confirmed": boolean,
  "official_url": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "application_url": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "deadline": { "value": string | null, "precision": "exact" | "month" | "unknown" | "rolling" | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "opens_at": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "funding": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "eligibility": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "format": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "host_city": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "country": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "contact_email": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "matches_current": boolean | null, "note": string },
  "additional_findings": [string],
  "excluded_claims": [string],
  "missing_information": [string],
  "overall_confidence": number,
  "sources": [{ "url": string, "finding": string }],
  "moderator_note": string
}"""


def strip_json_fences(text: str) -> str:
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"```\s*$", "", text)
    return text.strip()


def run_research(opportunity: dict) -> dict:
    official_url = opportunity["official_url"]
    page_text, fetch_error = fetch_page_text(official_url)

    search_text = None
    fallback_reason = None
    if page_text is None:
        fallback_reason = fetch_error
        query = " ".join(filter(None, [opportunity.get("title"), opportunity.get("organiser")]))
        search_text = tavily_search(query or official_url)

    current_lines = "\n".join(
        f"Current value on file -- {label}: {opportunity.get(field) or '(none)'}"
        for label, field in [
            ("funding", "funding"),
            ("eligibility", "eligibility"),
            ("deadline", "deadline_raw"),
            ("format", "format"),
            ("host city", "host_city"),
            ("country", "country"),
        ]
    )

    if page_text:
        source_block = f"Fetched page text (from {official_url}):\n{page_text}"
    elif search_text:
        source_block = (
            f"The submitted link could not be used ({fallback_reason}). "
            f"Falling back to search results instead:\n{search_text}"
        )
    else:
        source_block = (
            f"The submitted link could not be used ({fallback_reason}), "
            "and no search fallback is available. Report no_source_available."
        )

    user_message = f"""Opportunity name: {opportunity.get('title') or '(not given)'}
Organiser: {opportunity.get('organiser') or '(not given)'}
Submitted official URL: {official_url}

{current_lines}

{source_block}

Return the JSON object described in your instructions."""

    response = requests.post(
        GITHUB_MODELS_ENDPOINT,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
        },
        json={
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.1,
        },
        timeout=(CONNECT_TIMEOUT_SECONDS, 60),
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    return json.loads(strip_json_fences(content))


# ============================================================
# Database
# ============================================================


def fetch_pending(conn) -> list[dict]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """
            select id, title, organiser, official_url, funding, eligibility,
                   deadline_raw, format, host_city, country, review_state
            from opportunity
            where review_state in ('lead', 'in_review')
              and ai_research is null
            order by created_at asc
            limit %s
            """,
            (MAX_PER_RUN,),
        )
        return cur.fetchall()


def write_research(conn, opportunity_id: str, research: dict, was_lead: bool) -> None:
    review_state_clause = ", review_state = 'in_review'" if was_lead else ""
    with conn.cursor() as cur:
        cur.execute(
            f"""
            update opportunity
            set ai_research = %s, ai_research_at = %s {review_state_clause}
            where id = %s
            """,
            (psycopg2.extras.Json(research), datetime.now(timezone.utc), opportunity_id),
        )
    conn.commit()


def main() -> None:
    conn = psycopg2.connect(DATABASE_URL)
    processed = 0
    failed = 0

    try:
        pending = fetch_pending(conn)
        print(f"Found {len(pending)} pending opportunity(ies) with no ai_research yet.")

        for opportunity in pending:
            label = opportunity.get("title") or opportunity["official_url"]
            print(f"::group::Researching {label}")
            try:
                research = run_research(opportunity)
                write_research(
                    conn,
                    opportunity["id"],
                    research,
                    was_lead=opportunity["review_state"] == "lead",
                )
                processed += 1
                print(f"OK -- overall_confidence={research.get('overall_confidence')}")
            except Exception as exc:  # noqa: BLE001 -- one bad row must not stop the batch
                failed += 1
                print(f"::warning::Failed to research {label}: {exc}", file=sys.stderr)
            print("::endgroup::")
            time.sleep(REQUEST_DELAY_SECONDS)
    finally:
        conn.close()

    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    summary = f"Researched {processed} opportunity(ies), {failed} failed, via {AI_MODEL}.\n"
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as handle:
            handle.write(summary)
    print(summary)


if __name__ == "__main__":
    main()
