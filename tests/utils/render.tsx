import type  {ReactNode} from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';
type Options = {
  router?: Omit<MemoryRouterProps, 'children'>;
  queryClient?: QueryClient;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function render(ui: ReactNode, { router, queryClient }: Options = {}) {
  const qc = queryClient ?? createTestQueryClient();

  return rtlRender(
    <QueryClientProvider client={qc}>
      <MemoryRouter {...router}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}
