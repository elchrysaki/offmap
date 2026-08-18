'use client';

// Guest saved-opportunity IDs, device-local only (ADR 0003/0005). Cleared once
// merged into a student's account on sign-in — see AuthSaveSync.
const STORAGE_KEY = 'offmap:saved';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function getLocalSavedIds(): string[] {
  return read();
}

export function isLocallySaved(opportunityId: string): boolean {
  return read().includes(opportunityId);
}

export function toggleLocalSaved(opportunityId: string): string[] {
  const ids = read();
  const next = ids.includes(opportunityId)
    ? ids.filter((id) => id !== opportunityId)
    : [...ids, opportunityId];
  write(next);
  return next;
}

export function clearLocalSaved() {
  window.localStorage.removeItem(STORAGE_KEY);
}
