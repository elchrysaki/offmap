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
const SYSTEM_PROMPT = `You research student and early-career opportunities for OffMap.

You do not approve, reject, publish, or decide anything — you produce a research summary for a human moderator to read and act on.

Rules:
- Use Google Search to verify the opportunity is real and find its current official page.
- If the given official URL doesn't resolve, is a LinkedIn/social post, or looks unofficial, search by the opportunity title and organiser to find the real official page (organisation's own website, not a listicle or aggregator).
- If an application link isn't in the evidence yet, say so — do not guess one.
- Every value you report must be traceable to something you actually found. Never invent a deadline, contact email, or fact that isn't supported by a source.
- If you cannot confirm something, say "not found" rather than guessing.
- Prefer the official organiser's own site over third-party listings.
- Cite the URLs you actually used in the "sources" field.

Return ONLY a single valid JSON object, no markdown fences, no commentary, matching this shape:

{
  "identity_confirmed": boolean,
  "official_url": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "note": string },
  "application_url": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "note": string },
  "deadline": { "value": string | null, "confidence": "confirmed" | "unclear" | "not-found", "note": string },
  "contact": { "email": string | null, "note": string },
  "funding_summary": string | null,
  "eligibility_summary": string | null,
  "overall_confidence": number,
  "sources": [{ "url": string, "finding": string }],
  "moderator_note": string
}`;

export type OpportunityResearch = {
  identity_confirmed: boolean;
  official_url: { value: string | null; confidence: string; note: string };
  application_url: { value: string | null; confidence: string; note: string };
  deadline: { value: string | null; confidence: string; note: string };
  contact: { email: string | null; note: string };
  funding_summary: string | null;
  eligibility_summary: string | null;
  overall_confidence: number;
  sources: { url: string; finding: string }[];
  moderator_note: string;
};

function stripJsonFences(text: string) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
}

export async function researchOpportunity(input: {
  title: string | null;
  organiser: string | null;
  officialUrl: string;
}): Promise<OpportunityResearch> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to .env.local to use AI verification.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.interactions.create({
    model: 'gemini-3.6-flash',
    system_instruction: SYSTEM_PROMPT,
    input: `Opportunity name: ${input.title ?? '(not given)'}
Organiser: ${input.organiser ?? '(not given)'}
Submitted URL: ${input.officialUrl}

Research this opportunity and return the JSON object described in your instructions.`,
    tools: [{ type: 'google_search' }],
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
