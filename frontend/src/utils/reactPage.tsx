import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import '../index.css';
import { camelCaseKeys } from './transformKeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ReactComponent = Parameters<typeof createElement>[0];

declare global {
  interface Window {
    pageProps: Record<string, any>;
  }
}

const queryClient = new QueryClient();

export function renderPageComponent(Page: ReactComponent): void {
  const camelizedProps = camelCaseKeys(window.pageProps);
  const page = (
    <QueryClientProvider client={queryClient}>
      <Page {...camelizedProps} />
    </QueryClientProvider>
  );

  const root = createRoot(document.getElementById('react-mount')!);
  root.render(page);
}
