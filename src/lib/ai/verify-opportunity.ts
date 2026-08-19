import 'server-only';

import { GoogleGenAI } from '@google/genai';

// Condensed from offmap-hub's .github/prompts/opportunity-researcher.md —
// same philosophy, adapted for an on-demand tool call instead of a batch
// pipeline. The core rule carries over unchanged: nothing here is fact until
// a human moderator reads it and applies it. See CLAUDE.md §6.
//
// Uses the Interactions API (client.interactions.create), not the older
// models.generateContent — new Gemini API keys are routed onto Interactions
// only; generateContent returns 404 "no longer available to new users" for
// classic model IDs like gemini-2.5-flash. Verified directly against the
// live API, not assumed from docs.
//
// Two server-side tools are given to the model:
// - `url_context` fetches a URL the caller supplies (the opportunity's own
//   official_url / apply_url) so the model can read the actual page instead
//   of relying on background knowledge or search snippets.
// - `google_search` is grounding, used ONLY as a fallback when the given
//   link doesn't resolve, doesn't identify as this opportunity, or is
//   missing — per the product owner's explicit ordering: check the given
//   link first, search by title only if that link turns out wrong.
const SYSTEM_PROMPT = `You research student and early-career opportunities for OffMap.

You do not approve, reject, publish, or decide anything — you produce a research summary for a human moderator to read and act on. Nothing you write is ever shown to a student directly; it only reaches the public site if a moderator manually copies it into the real listing after checking it.

You have two tools: \`url_context\` (fetches a specific URL you give it and lets you read its content) and \`google_search\` (searches Google).

Follow this order strictly:

1. If a "Submitted official URL" and/or "Submitted apply URL" are given below, use \`url_context\` to open EACH of them first. Read the actual page content they return.
2. Cross-check every field this task tracks against what is literally stated on those fetched pages. Do not use outside knowledge, memory, or assumptions — only what the fetched page(s) say.
3. Only if a given URL fails to resolve, redirects somewhere unrelated, is a social-media/LinkedIn post instead of an official page, or clearly does not describe this opportunity, treat that link as broken. Record why in "fallback_reason", then use \`google_search\` with the opportunity title and organiser to find the real official page (the organisation's own site, not a listicle or aggregator), fetch that page with \`url_context\` too, and cross-check from there instead.
4. If both the given link(s) are broken AND search finds nothing reliable, say so plainly — do not invent a replacement.

Rules that apply throughout:
- Every value you report must be traceable to something you actually read on a fetched page. Never invent a deadline, contact email, funding detail, or any other fact that isn't literally supported by a source you fetched.
- If you cannot confirm something from a fetched page, its value is null and its confidence is "not-found" — never guess, never infer, never fill a gap with a plausible-sounding value.
- Some fields (audience/eligibility category tags, effort classification, subject taxonomy) are editorial judgment calls a moderator makes, not facts a page states — do not attempt to answer those; they are not in the schema below for that reason.
- For every field, note whether the source page's value matches, contradicts, or can't be compared against the value already on file (given to you below as "Current value on file").
- List anything you found on the source page that OffMap's current listing does NOT mention, under "additional_findings" — never merge it silently into another field.
- List anything the source page clearly does NOT state (so a moderator shouldn't assume it), under "missing_information".
- List any claim you deliberately did NOT carry into a field because you could not verify it against the fetched page, under "excluded_claims" — with a one-line reason each.
- Cite every URL you actually fetched or that appeared in search results you relied on, in "sources".

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
}`;

export type FieldFinding = {
  value: string | null;
  confidence: 'confirmed' | 'unclear' | 'not-found';
  matches_current: boolean | null;
  note: string;
};

export type OpportunityResearch = {
  research_method:
    'source_page' | 'fallback_search' | 'source_page_and_search' | 'no_source_available';
  checked_urls: {
    url: string;
    role: 'official_url' | 'apply_url' | 'search_result';
    fetched_ok: boolean;
    matches_opportunity: boolean | null;
    note: string;
  }[];
  fallback_reason: string | null;
  identity_confirmed: boolean;
  official_url: FieldFinding;
  application_url: FieldFinding;
  deadline: FieldFinding & { precision: 'exact' | 'month' | 'unknown' | 'rolling' | null };
  opens_at: FieldFinding;
  funding: FieldFinding;
  eligibility: FieldFinding;
  format: FieldFinding;
  host_city: FieldFinding;
  country: FieldFinding;
  contact_email: FieldFinding;
  additional_findings: string[];
  excluded_claims: string[];
  missing_information: string[];
  overall_confidence: number;
  sources: { url: string; finding: string }[];
  moderator_note: string;
};

function stripJsonFences(text: string) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
}

export async function researchOpportunity(input: {
  title: string | null;
  organiser: string | null;
  officialUrl: string;
  applyUrl?: string | null;
  // What's currently on file, so the model can flag matches/contradictions
  // instead of just restating facts with no comparison. Purely informational
  // context for the model — never a value it's allowed to just echo back
  // without having verified it against a fetched page.
  current?: {
    funding: string | null;
    eligibility: string | null;
    deadlineRaw: string | null;
    format: string | null;
    hostCity: string | null;
    country: string | null;
  };
}): Promise<OpportunityResearch> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to .env.local to use AI verification.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const currentLines = input.current
    ? [
        `Current value on file — funding: ${input.current.funding ?? '(none)'}`,
        `Current value on file — eligibility: ${input.current.eligibility ?? '(none)'}`,
        `Current value on file — deadline: ${input.current.deadlineRaw ?? '(none)'}`,
        `Current value on file — format: ${input.current.format ?? '(none)'}`,
        `Current value on file — host city: ${input.current.hostCity ?? '(none)'}`,
        `Current value on file — country: ${input.current.country ?? '(none)'}`,
      ].join('\n')
    : '(no current values on file yet)';

  const response = await ai.interactions.create({
    model: 'gemini-3.6-flash',
    system_instruction: SYSTEM_PROMPT,
    input: `Opportunity name: ${input.title ?? '(not given)'}
Organiser: ${input.organiser ?? '(not given)'}
Submitted official URL: ${input.officialUrl}
Submitted apply URL: ${input.applyUrl ?? '(none submitted)'}

${currentLines}

Research this opportunity following the order in your instructions — fetch the submitted URL(s) with url_context first, and only fall back to google_search by title/organiser if a submitted link turns out broken or unrelated. Return the JSON object described in your instructions.`,
    tools: [{ type: 'url_context' }, { type: 'google_search' }],
  });

  const text = response.output_text;
  if (!text) {
    throw new Error('AI response contained no text output.');
  }

  try {
    return JSON.parse(stripJsonFences(text)) as OpportunityResearch;
  } catch {
    throw new Error('AI response was not valid JSON — see raw output in server logs.');
  }
}
