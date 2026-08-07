import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { SavedProvider } from './saved-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 24 * 60 * 60 * 1_000,
            staleTime: 5 * 60 * 1_000,
            retry: 1,
            refetchOnWindowFocus: false,
            networkMode: 'offlineFirst',
          },
          mutations: { retry: 0, networkMode: 'online' },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SavedProvider>{children}</SavedProvider>
    </QueryClientProvider>
  );
}
