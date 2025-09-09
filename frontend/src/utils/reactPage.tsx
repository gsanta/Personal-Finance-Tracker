import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

// import { Layout } from '../components/page/Layout';
// import { camelCaseKeys } from './changeCase';

type ReactComponent = Parameters<typeof createElement>[0];
type ReactProps = Parameters<typeof createElement>[1];

declare global {
  interface Window {
    pageProps: ReactProps;
  }
}

export function renderPageComponent(Page: ReactComponent): void {
  const page = (
      // <Page {...(camelizeKeys ? camelCaseKeys(window.pageProps) : window.pageProps)} />
      <Page />
  );

  const root = createRoot(document.getElementById('react-mount')!);
  root.render(page);
}
