import AsyncStorage from '@react-native-async-storage/async-storage';

export const SAVED_STORAGE_KEY = 'offmap:saved-opportunities:v1';

export function normalizeSavedIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0)),
  ];
}

export function nextSavedIds(current: readonly string[], id: string): string[] {
  return current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
}

export async function loadSavedIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SAVED_STORAGE_KEY);
  if (!raw) return [];
  try {
    return normalizeSavedIds(JSON.parse(raw));
  } catch {
    await AsyncStorage.removeItem(SAVED_STORAGE_KEY);
    return [];
  }
}

export async function storeSavedIds(ids: readonly string[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(normalizeSavedIds(ids)));
}
