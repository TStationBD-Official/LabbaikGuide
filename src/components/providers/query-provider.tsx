"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { APP_CONFIG } from "@/config/app";
import { ApiError } from "@/services/api-client";
import { idbStateStorage } from "@/services/storage/idb-storage";

/** Bump when cached response shapes change, to discard incompatible caches. */
const CACHE_BUSTER = "v1";

/**
 * Layered cache: memory (TanStack Query) → IndexedDB (persister) → API.
 * Only Quran content is persisted; time-sensitive schedules are never shown
 * from a persisted cache as if live.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            networkMode: "offlineFirst",
            retry: (failureCount, error) => {
              if (error instanceof ApiError && !error.retryable) return false;
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
          },
        },
      }),
  );
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: typeof window === "undefined" ? undefined : idbStateStorage,
      key: "hc-query-cache",
      throttleTime: 2000,
    }),
  );

  // Anything served from the offline copy while disconnected is refreshed on reconnect.
  useEffect(() => {
    const onOnline = () => void client.invalidateQueries({ queryKey: ["quran"] });
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [client]);

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: APP_CONFIG.cache.persistMaxAgeMs,
        buster: CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: (q) => q.state.status === "success" && q.queryKey[0] === "quran",
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
