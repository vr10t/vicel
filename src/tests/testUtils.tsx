// tests/testUtils.tsx
import { createTRPCClient } from '@trpc/react';
import { render } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppRouter } from '../server/router';
import { trpc } from '../utils/trpc';


interface TRPCWrapperProps {
  children: ReactNode;
}

function TRPCWrapper({ children }: TRPCWrapperProps) {
  const client = createTRPCClient<AppRouter>({
    url: '',
    fetch: async () => new Response(JSON.stringify({})),
  });
  const queryClient = new QueryClient();
  return (
  <trpc.Provider queryClient={queryClient} client={client} >
    <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
    </trpc.Provider>);
}

export function renderWithTRPC(ui: React.ReactElement) {
  return render(ui, { wrapper: TRPCWrapper });
}
