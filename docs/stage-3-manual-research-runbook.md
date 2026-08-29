# Stage 3 — manual research runbook

Part of CLAUDE.md §15's staged AI-scale plan. Stage 1 is the confidence-scored
`/admin` queue and batch-apply screen. Stage 2 is the scheduled GitHub Actions
pipeline (GitHub Models + Tavily). **Stage 3 is this document** — an on-demand
way for Elena to clear a backlog of pending submissions using her own Claude
Code subscription, with nobody else's API key and nobody else's quota,
whenever Stage 1/2 aren't enough or she just wants to do a batch herself.

## Why this is a separate stage, not just "ask Claude"

A Claude Code session run from a **subscription login** (Pro/Max) draws on
that subscription's included usage — genuinely free in that sense, the same
way this session is. That's different from an **API key**, which is metered
and billed per token regardless of any subscription. Stage 3 only works the
"free" way if it's run from a subscription-logged-in Claude Code session,
not a script calling the Anthropic API. It also only runs when Elena
actually starts it — there's no automatic trigger, unlike Stage 2.

## One real tradeoff, stated plainly

Stage 2's GitHub Action connects through the `github_pipeline` Postgres role,
which is _physically_ incapable of writing a gate field (apply_url, funding,
deadline_at, etc.) — the database itself enforces that, not the script's good
behavior. A Claude Code session run through this runbook instead uses this
repo's own Supabase MCP access, which is **not** column-restricted the same
way. The safety here is the instruction below ("never touch a gate field
directly") being followed, not a hard database wall. That's an acceptable
tradeoff for an on-demand, human-supervised session — Elena is present and
watching — but it's a real difference from Stage 2, not a detail to gloss
over.

## How to run it

1. Open a terminal in this repo, make sure Claude Code is logged in with
   your Pro/Max subscription (not `ANTHROPIC_API_KEY` — check with
   `claude auth status` if unsure), and that this repo's Supabase MCP server
   is connected (it already is in Claude Code sessions working on this repo).
2. Start a session and paste the prompt below verbatim.
3. Review what it did before trusting it — read the job's own summary at the
   end, and spot-check a few rows in `/admin` before doing anything with the
   results (this runbook populates `ai_research` for a human to review, same
   as every other pipeline in this project — it does not publish anything).

## The prompt

```
Research every pending opportunity in Supabase that doesn't have AI research
yet, using the Supabase MCP tools already available in this session.

1. Query: select id, title, organiser, official_url, funding, eligibility,
   deadline_raw, format, host_city, country from opportunity where
   review_state in ('lead', 'in_review') and ai_research is null.

2. For each row, fetch its official_url (WebFetch) and research it following
   these rules exactly — they are non-negotiable, not a style preference:
   - Cross-check every field below against what the fetched page literally
     states. Do not use outside knowledge, memory, or assumptions.
   - If you cannot confirm something from the fetched page, its value is
     null and its confidence is "not-found" — never guess, never infer,
     never fill a gap with a plausible-sounding value.
   - If the given link is broken, redirects somewhere unrelated, or clearly
     isn't this opportunity, say so (identity_confirmed: false) rather than
     inventing a replacement — do not search for a substitute unless you
     have real web search available and the given link is confirmed broken.
   - reach and prep_time are never yours to fill in — they're editorial
     judgment calls for a human moderator, not facts a page states. Leave
     them out entirely.

3. Produce, per opportunity, a JSON object in exactly this shape (matching
   src/lib/ai/verify-opportunity.ts's OpportunityResearch type, so it's a
   drop-in for the existing confidence-bucketed admin queue):

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
   }

4. Write it back with Supabase MCP execute_sql:
   update opportunity
   set ai_research = '<the JSON>'::jsonb, ai_research_at = now()
       [, review_state = 'in_review' if it was still 'lead']
   where id = '<the row's id>';

   Do NOT touch apply_url, funding, eligibility, deadline_at, deadline_raw,
   deadline_precision, opens_at, host_city, country, reach, prep_time,
   format, or any other gate/detail field directly. This step only ever
   writes ai_research and ai_research_at (and the lead-to-in_review bump) —
   exactly the same boundary as every other AI call site in this project
   (CLAUDE.md §6). If you are tempted to also fill in a gate field "since
   the research is confident," that's the failure mode this rule exists to
   prevent — don't.

5. Process rows one at a time, not in parallel — this is a supervised
   session, not a batch job racing to finish.

6. When done, report a plain-text summary: how many rows processed, how
   many came back low-confidence or identity-unconfirmed, and anything that
   looked genuinely wrong (a fetch that returned an unrelated page, a site
   that blocked the request, etc.) so I know what still needs a human look
   beyond what /admin already shows.
```
