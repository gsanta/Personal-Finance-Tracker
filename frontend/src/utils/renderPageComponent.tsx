import { createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '../index.css';
import { camelCaseKeys } from './transformKeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalPropsContext } from '@/hooks/useGlobalProps';
import User from '@/types/User';
import { ResponsiveProvider } from './useResponsive';

type ReactComponent = Parameters<typeof createElement>[0];

declare global {
  interface Window {
    pageProps: Record<string, unknown>;
  }
}

const queryClient = new QueryClient();

function AppWrapper({
  Page,
  camelizedProps,
  user: initialUser,
}: {
  Page: ReactComponent;
  camelizedProps: Record<string, unknown>;
  user: User;
}) {
  const [isPageScrolled, setIsPageScrolled] = useState(false);
  const [user, setUser] = useState(initialUser);

  return (
    <ResponsiveProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalPropsContext.Provider value={{ isPageScrolled, setIsPageScrolled, setUser, user }}>
          <Page {...camelizedProps} />
          <ReactQueryDevtools initialIsOpen={false} />
        </GlobalPropsContext.Provider>
      </QueryClientProvider>
    </ResponsiveProvider>
  );
}

export function renderPageComponent(Page: ReactComponent): void {
  const { user } = window.pageProps as { user: User };
  const camelizedProps = camelCaseKeys(window.pageProps);

  const page = <AppWrapper Page={Page} camelizedProps={camelizedProps} user={user} />;

  const root = createRoot(document.getElementById('react-mount')!);
  root.render(page);
}
