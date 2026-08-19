// Display labels for the enums added in
// supabase/migrations/20260819172931_profile_personalization.sql. Shared
// across sign-up, onboarding, and the profile page so the three don't each
// carry their own copy of the same enum -> label mapping.

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'professor', label: 'Professor / educator' },
  { value: 'organiser', label: 'Programme organiser' },
  { value: 'other', label: 'Other' },
];

export const EXPERIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'high_school', label: 'High school' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'professional', label: 'Professional' },
];

export const SAVED_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'goals', label: 'Goals' },
  { value: 'apply', label: 'Apply' },
  { value: 'applied', label: 'Applied' },
  { value: 'archived', label: 'Archived' },
];

function labelFor(options: { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? value ?? '';
}

export const statusLabel = (value: string | null) => labelFor(STATUS_OPTIONS, value);
export const experienceLabel = (value: string | null) => labelFor(EXPERIENCE_OPTIONS, value);
export const savedStatusLabel = (value: string) => labelFor(SAVED_STATUS_OPTIONS, value);
