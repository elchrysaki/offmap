import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/types';

type Candidate = Pick<
  Tables<'opportunity'>,
  'id' | 'title' | 'organiser' | 'official_url' | 'review_state'
>;

export function normalizeUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const path = url.pathname.replace(/\/+$/, '').toLowerCase();
    return `${host}${path}`;
  } catch {
    return raw.trim().toLowerCase();
  }
}

function normalizeText(value: string | null): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Pulled out separately so two titles that are near-identical apart from a
// year ("... Summer School 2026" vs "... Summer School 2027") never get
// silently treated as the same event — different editions of an annual
// programme are different opportunities with different deadlines. Any
// title-year mismatch caps the result at "possible", never "certain",
// regardless of how high the text similarity otherwise scores.
function extractYear(value: string | null): string | null {
  const match = (value ?? '').match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

function bigrams(value: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < value.length - 1; i++) set.add(value.slice(i, i + 2));
  return set;
}

// Dice coefficient over character bigrams — robust to small wording
// differences ("Summer School" vs "Summer Academy") without needing an
// external library or a Postgres extension for what's still a small table.
function textSimilarity(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  const ba = bigrams(na);
  const bb = bigrams(nb);
  if (ba.size === 0 || bb.size === 0) return 0;

  let shared = 0;
  for (const gram of ba) if (bb.has(gram)) shared += 1;
  return (2 * shared) / (ba.size + bb.size);
}

export type DuplicateMatch = {
  candidate: Candidate;
  confidence: 'certain' | 'possible';
  reason: string;
};

// Certain: the same official link, normalized (protocol/www/trailing-slash/
// query-string differences ignored) — about as close to unambiguous as a
// duplicate check gets without a human looking.
// Possible: title + organiser are a strong textual match. Never promoted to
// "certain" on text alone, and explicitly downgraded (or dropped) when the
// two titles carry different year tokens, since that's exactly the
// different-edition-of-an-annual-programme case that must never auto-merge.
export function findDuplicateAmong(
  target: { title: string | null; organiser: string | null; official_url: string | null },
  candidates: Candidate[],
  excludeId?: string,
): DuplicateMatch[] {
  const targetUrl = normalizeUrl(target.official_url);
  const targetYear = extractYear(target.title);

  const matches: DuplicateMatch[] = [];

  for (const candidate of candidates) {
    if (excludeId && candidate.id === excludeId) continue;

    if (targetUrl && normalizeUrl(candidate.official_url) === targetUrl) {
      matches.push({ candidate, confidence: 'certain', reason: 'Same official link' });
      continue;
    }

    const titleSim = textSimilarity(target.title ?? '', candidate.title ?? '');
    const organiserSim = textSimilarity(target.organiser ?? '', candidate.organiser ?? '');
    if (titleSim < 0.6) continue;

    const candidateYear = extractYear(candidate.title);
    const yearMismatch = Boolean(targetYear && candidateYear && targetYear !== candidateYear);

    // Title alone can be enough if it's a near-exact match; otherwise
    // require the organiser to agree too, so "Hackathon" at two different
    // universities doesn't get flagged just because both are hackathons.
    const strongMatch = titleSim >= 0.85 || (titleSim >= 0.6 && organiserSim >= 0.6);
    if (!strongMatch) continue;

    matches.push({
      candidate,
      confidence: 'possible',
      reason: yearMismatch
        ? `Similar title, but mentions a different year (${targetYear} vs ${candidateYear}) — check it's not a different edition`
        : 'Similar title and organiser',
    });
  }

  return matches;
}

// Goes through the find_submission_duplicate_candidates() RPC (see the
// matching migration) rather than a direct table read, since a plain
// signed-in submitter's own RLS can't see pending lead/in_review rows —
// only ambassadors/moderators can read those directly. The RPC is a narrow
// SECURITY DEFINER function that exposes only title/organiser/official_url/
// review_state, nothing sensitive. Works the same way for admin callers too,
// so there's one code path instead of two.
export async function getLiveCandidates(): Promise<Candidate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('find_submission_duplicate_candidates');

  if (error) throw error;
  return data;
}
