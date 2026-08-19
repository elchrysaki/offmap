'use server';

import { getTypes } from '@/lib/queries/taxonomy';
import { submitLead } from '@/lib/queries/submit-lead';

export type SubmitState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
};

export const initialSubmitState: SubmitState = { status: 'idle' };

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const officialUrl = ((formData.get('official_url') as string | null) ?? '').trim();
  const typeId = ((formData.get('type_id') as string | null) ?? '').trim();
  const organiser = (formData.get('organiser') as string | null) ?? '';
  const note = (formData.get('note') as string | null) ?? '';
  const submitterName = (formData.get('submitter_name') as string | null) ?? '';
  const submitterEmail = ((formData.get('submitter_email') as string | null) ?? '').trim();

  if (!officialUrl || !isHttpUrl(officialUrl)) {
    return { status: 'error', message: 'Enter a link that starts with https://.' };
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
    await submitLead({
      officialUrl,
      typeId,
      organiser,
      note,
      submitterName,
      submitterEmail,
    });
  } catch {
    return { status: 'error', message: 'Something went wrong on our end. Try again in a minute.' };
  }

  return { status: 'success' };
}
