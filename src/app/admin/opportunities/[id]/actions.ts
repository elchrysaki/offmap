'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import {
  getOpportunityById,
  rejectOpportunity,
  setOpportunitySelections,
  updateOpportunity,
  type MultiselectKey,
} from '@/lib/queries/admin-opportunities';
import { researchOpportunity } from '@/lib/ai/verify-opportunity';
import type { Enums } from '@/lib/supabase/types';

function stringOrNull(value: FormDataEntryValue | null) {
  const str = (value ?? '').toString().trim();
  return str === '' ? null : str;
}

function basePatch(formData: FormData) {
  return {
    title: stringOrNull(formData.get('title')),
    organiser: stringOrNull(formData.get('organiser')),
    type_id: formData.get('type_id') as string,
    format: (stringOrNull(formData.get('format')) as Enums<'format'> | null) ?? null,
    reach: (stringOrNull(formData.get('reach')) as Enums<'reach'> | null) ?? null,
    country: stringOrNull(formData.get('country')),
    host_city: stringOrNull(formData.get('host_city')),
    eligible_countries: stringOrNull(formData.get('eligible_countries')),
    funding: (stringOrNull(formData.get('funding')) as Enums<'funding'> | null) ?? null,
    funding_details: stringOrNull(formData.get('funding_details')),
    eligibility: stringOrNull(formData.get('eligibility')),
    prep_time: (stringOrNull(formData.get('prep_time')) as Enums<'prep_time'> | null) ?? null,
    specific_majors: stringOrNull(formData.get('specific_majors')),
    audience_notes: stringOrNull(formData.get('audience_notes')),
    application_requirements: stringOrNull(formData.get('application_requirements')),
    additional_information: stringOrNull(formData.get('additional_information')),
    deadline_raw: stringOrNull(formData.get('deadline_raw')),
    deadline_at: stringOrNull(formData.get('deadline_at')),
    deadline_precision:
      (stringOrNull(formData.get('deadline_precision')) as Enums<'deadline_precision'>) ??
      'unknown',
    opens_at: stringOrNull(formData.get('opens_at')),
    official_url: formData.get('official_url') as string,
    apply_url: stringOrNull(formData.get('apply_url')),
    expected_application_season: stringOrNull(formData.get('expected_application_season')),
    excluded_claims: stringOrNull(formData.get('excluded_claims')),
    missing_information: stringOrNull(formData.get('missing_information')),
  };
}

const MULTISELECT_KEYS: MultiselectKey[] = [
  'field',
  'academic_level',
  'geo_scope',
  'audience_group',
  'funding_feature',
];

async function saveMultiselects(id: string, formData: FormData) {
  await Promise.all(
    MULTISELECT_KEYS.map((key) =>
      setOpportunitySelections(id, key, formData.getAll(key) as string[]),
    ),
  );
}

// Saves edits without changing review_state — "request info" in effect,
// since the row just sits in the queue until an admin explicitly publishes it.
export async function saveOpportunity(id: string, formData: FormData) {
  await updateOpportunity(id, basePatch(formData));
  await saveMultiselects(id, formData);

  revalidatePath(`/admin/opportunities/${id}`);
}

// Publishing IS the verification act — last_verified_at and verified_by are
// stamped here from the signed-in admin, never typed in by hand.
export async function publishOpportunity(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    await updateOpportunity(id, {
      ...basePatch(formData),
      review_state: 'published',
      last_verified_at: new Date().toISOString(),
      verified_by: user?.email ?? null,
    });
    await saveMultiselects(id, formData);
  } catch (err) {
    // Most likely the publish_gate CHECK constraint — a required field is
    // still missing. Surface it on the edit page instead of crashing.
    const message = err instanceof Error ? err.message : 'Could not publish.';
    redirect(`/admin/opportunities/${id}?error=${encodeURIComponent(message)}`);
  }

  redirect('/admin');
}

export async function rejectOpportunityAction(id: string) {
  await rejectOpportunity(id);
  redirect('/admin');
}

// Research only — never writes to a gate field (official_url, apply_url,
// funding, etc.). Findings sit in ai_research for a human to read and apply
// by hand, same boundary as excluded_claims / missing_information (§6).
export async function runAiResearch(id: string) {
  const opportunity = await getOpportunityById(id);

  let research;
  let errorMessage: string | null = null;
  try {
    research = await researchOpportunity({
      title: opportunity.title,
      organiser: opportunity.organiser,
      officialUrl: opportunity.official_url,
      applyUrl: opportunity.apply_url,
      current: {
        funding: opportunity.funding,
        eligibility: opportunity.eligibility,
        deadlineRaw: opportunity.deadline_raw,
        format: opportunity.format,
        hostCity: opportunity.host_city,
        country: opportunity.country,
      },
    });
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'AI research failed.';
  }

  // apply_url_candidate/apply_url_candidate_note are not gate fields (the
  // publish_gate CHECK constraint never reads them) — same candidate columns
  // the weekly link-checker Edge Function writes to, so a moderator sees one
  // consistent "suggested apply link" slot regardless of which job found it.
  // The real apply_url field is still never touched here (§6).
  const applyUrlCandidate =
    research && research.application_url.value && research.application_url.confidence !== 'not-found'
      ? research.application_url.value
      : null;
  const applyUrlCandidateNote = research
    ? `${research.application_url.confidence}: ${research.application_url.note}`
    : null;

  await updateOpportunity(id, {
    ai_research: errorMessage ? { error: errorMessage } : research,
    ai_research_at: new Date().toISOString(),
    apply_url_candidate: applyUrlCandidate,
    apply_url_candidate_note: applyUrlCandidateNote,
  });

  revalidatePath(`/admin/opportunities/${id}`);
}
