import { createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '../index.css';
import { camelCaseKeys } from './transformKeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalPropsContext } from '@/hooks/useGlobalProps';
import User from '@/types/User';

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
  isLoggedIn,
  user,
}: {
  Page: ReactComponent;
  camelizedProps: Record<string, any>;
  isLoggedIn: boolean;
  user: User;
}) {
  const [isPageScrolled, setIsPageScrolled] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPropsContext.Provider value={{ isLoggedIn, user, isPageScrolled, setIsPageScrolled }}>
        <Page {...camelizedProps} />
        <ReactQueryDevtools initialIsOpen={false} />
      </GlobalPropsContext.Provider>
    </QueryClientProvider>
  );
}

export function renderPageComponent(Page: ReactComponent): void {
  const { isLoggedIn, user } = window.pageProps as { isLoggedIn: boolean; user: User };
  const camelizedProps = camelCaseKeys(window.pageProps);

  const page = <AppWrapper Page={Page} camelizedProps={camelizedProps} isLoggedIn={isLoggedIn} user={user} />;

  const root = createRoot(document.getElementById('react-mount')!);
  root.render(page);
}
