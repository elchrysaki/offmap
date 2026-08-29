'use server';

import { getTypes } from '@/lib/queries/taxonomy';
import { submitLead, SubmissionRateLimitError } from '@/lib/queries/submit-lead';
import { unsafeSubmissionUrlReason } from '@/lib/submission-guard';
import type { SubmitState } from './submit-state';

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TITLE_LENGTH = 200;
const MAX_ORGANISER_LENGTH = 200;
const MAX_NOTE_LENGTH = 600;
const MAX_SUBMITTER_NAME_LENGTH = 150;

// Server action behind the public /submit form. Validates, then writes a
// `lead` row via submitLead — see that function and the migration it
// depends on for exactly what a public submitter can and can't set.
export async function submitOpportunity(
  _prevState: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // Honeypot: a field real visitors never see (sr-only in the form) or
  // fill in. Any value here means a bot filled every input blindly — bail
  // out quietly with a success-shaped response instead of telling it what
  // tripped it.
  if ((formData.get('website') as string | null)?.trim()) {
    return { status: 'success' };
  }

  const title = ((formData.get('title') as string | null) ?? '').trim();
  const officialUrl = ((formData.get('official_url') as string | null) ?? '').trim();
  const typeId = ((formData.get('type_id') as string | null) ?? '').trim();
  const organiser = (formData.get('organiser') as string | null) ?? '';
  const note = (formData.get('note') as string | null) ?? '';
  const submitterName = (formData.get('submitter_name') as string | null) ?? '';
  const submitterEmail = ((formData.get('submitter_email') as string | null) ?? '').trim();

  if (!officialUrl || !isHttpUrl(officialUrl)) {
    return { status: 'error', message: 'Enter a link that starts with https://.' };
  }

  if (unsafeSubmissionUrlReason(officialUrl)) {
    return {
      status: 'error',
      message: "That link doesn't look like a public website. Double-check it.",
    };
  }

  if (
    title.length > MAX_TITLE_LENGTH ||
    organiser.length > MAX_ORGANISER_LENGTH ||
    note.length > MAX_NOTE_LENGTH ||
    submitterName.length > MAX_SUBMITTER_NAME_LENGTH
  ) {
    return { status: 'error', message: 'One of those fields is too long — trim it and try again.' };
  }

  if (!typeId) {
    return { status: 'error', message: 'Choose a type.' };
  }

  const types = await getTypes();
  if (!types.some((type) => type.id === typeId)) {
    return { status: 'error', message: 'Choose a type from the list.' };
  }

  if (submitterEmail && !EMAIL_PATTERN.test(submitterEmail)) {
    return { status: 'error', message: "That email doesn't look right. Fix it or leave it blank." };
  }

  try {
    const result = await submitLead({
      title,
      officialUrl,
      typeId,
      organiser,
      note,
      submitterName,
      submitterEmail,
    });

    if (result.attachedToExisting) {
      return {
        status: 'success',
        message: "We already had this one — your note's been added to it for the moderator.",
      };
    }
  } catch (error) {
    if (error instanceof SubmissionRateLimitError) {
      return {
        status: 'error',
        message: "You've submitted a few opportunities recently — try again in a bit.",
      };
    }
    return { status: 'error', message: 'Something went wrong on our end. Try again in a minute.' };
  }

  return { status: 'success' };
}
