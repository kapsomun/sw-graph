import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReactNode } from 'react'

export function AppProviders({ children }: { children: ReactNode }) {
  // Initialize QueryClient only once and keep it stable between renders
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent retries for client-side (4xx) errors
            retry: (failures: number, error: unknown) => {
              const status =
                typeof error === 'object' && error !== null && 'status' in error
                  ? (error as { status?: number }).status ?? 0
                  : 0

              if (status >= 400 && status < 500) return false
              return failures < 2
            },
            // Keep query data fresh for 5 minutes before re-fetching
            staleTime: 5 * 60 * 1000,
            // Avoid unnecessary network calls when tab/window regains focus
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  // Provide React Query context to the app
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
