import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import '../index.css';
import { camelCaseKeys } from './transformKeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

type ReactComponent = Parameters<typeof createElement>[0];

declare global {
  interface Window {
    pageProps: Record<string, unknown>;
  }
}

const queryClient = new QueryClient();

export function renderPageComponent(Page: ReactComponent): void {
  const camelizedProps = camelCaseKeys(window.pageProps);
  const page = (
    <QueryClientProvider client={queryClient}>
      <Page {...camelizedProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  const root = createRoot(document.getElementById('react-mount')!);
  root.render(page);
}
