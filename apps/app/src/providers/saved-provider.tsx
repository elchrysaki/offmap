import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loadSavedIds, nextSavedIds, storeSavedIds } from '@/storage/saved-opportunities';

type SavedContextValue = {
  ids: string[];
  ready: boolean;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void loadSavedIds().then((saved) => {
      if (active) {
        setIds(saved);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = nextSavedIds(current, id);
      void storeSavedIds(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ ids, ready, toggle, isSaved: (id: string) => ids.includes(id) }),
    [ids, ready, toggle],
  );
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) throw new Error('useSaved must be used within SavedProvider.');
  return context;
}
