// Scheduled by pg_cron (see the cron job set up alongside this deploy).
// Finds published listings with no apply_url yet but an expected_application_season,
// and asks Gemini (with Google Search grounding) whether applications have opened.
//
// Never writes directly to apply_url — a moderator reviews apply_url_candidate
// and copies it over by hand. Same "never publish an inference" boundary as
// the rest of the schema (see CLAUDE.md §6).
//
// Uses the Interactions API directly over fetch (v1beta/interactions), not
// the classic generateContent endpoint or the npm SDK — new Gemini API keys
// are routed onto Interactions only, verified directly against the live API.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-3.6-flash';

type Opportunity = {
  id: string;
  title: string | null;
  organiser: string | null;
  official_url: string;
  expected_application_season: string | null;
};

type FindingResult = {
  applications_open: boolean;
  application_url: string | null;
  confidence: string;
  note: string;
};

function stripJsonFences(text: string) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
}

async function findApplicationLink(o: Opportunity): Promise<FindingResult> {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      model: MODEL,
      system_instruction: `You check whether a specific opportunity's applications have opened yet.
Use Google Search. Only report an application URL if you find one that is genuinely live and official —
never guess, never reuse a past edition's link. Return ONLY this JSON, no markdown fences:
{"applications_open": boolean, "application_url": string | null, "confidence": "confirmed" | "unclear" | "not-found", "note": string}`,
      input: `Opportunity: ${o.title ?? '(untitled)'}
Organiser: ${o.organiser ?? '(unknown)'}
Official page: ${o.official_url}
Expected application window: ${o.expected_application_season}

Have applications opened? If so, what is the direct application URL?`,
      tools: [{ type: 'google_search' }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text: string | undefined = data.output_text;
  if (!text) throw new Error('No output_text in AI response');

  return JSON.parse(stripJsonFences(text)) as FindingResult;
}

Deno.serve(async () => {
  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY secret not set for this function' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Hard ceiling independent of any Google Cloud quota — if a data bug ever
  // makes this query match far more rows than expected, this caps the blast
  // radius to one run instead of one unbounded bill.
  const MAX_PER_RUN = 50;

  const { data: pending, error } = await supabase
    .from('opportunity')
    .select('id, title, organiser, official_url, expected_application_season')
    .is('apply_url', null)
    .not('expected_application_season', 'is', null)
    .eq('review_state', 'published')
    .limit(MAX_PER_RUN);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const results = [];
  for (const o of pending ?? []) {
    try {
      const finding = await findApplicationLink(o);

      await supabase
        .from('opportunity')
        .update({
          application_link_last_checked_at: new Date().toISOString(),
          apply_url_candidate: finding.applications_open ? finding.application_url : null,
          apply_url_candidate_note: `${finding.confidence}: ${finding.note}`,
        })
        .eq('id', o.id);

      results.push({ id: o.id, ...finding });
    } catch (err) {
      results.push({ id: o.id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return new Response(JSON.stringify({ checked: results.length, results }), {
    headers: { 'content-type': 'application/json' },
  });
});
