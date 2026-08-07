import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'offmap:public-cache:v1:';

export async function readPublicCache<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(`${PREFIX}${key}`);
  if (!value) return null;
  try {
    return (JSON.parse(value) as { data?: T }).data ?? null;
  } catch {
    await AsyncStorage.removeItem(`${PREFIX}${key}`);
    return null;
  }
}

export async function writePublicCache<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(
    `${PREFIX}${key}`,
    JSON.stringify({ cachedAt: new Date().toISOString(), data }),
  );
}
