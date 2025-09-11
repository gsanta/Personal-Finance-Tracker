import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import '../index.css';
import camelCaseKeys from './camelCaseKeys';

// import { Layout } from '../components/page/Layout';
// import { camelCaseKeys } from './changeCase';

type ReactComponent = Parameters<typeof createElement>[0];

declare global {
  interface Window {
    pageProps: Record<string, any>;
  }
}

export function renderPageComponent(Page: ReactComponent): void {
  const page = (
    <div data-theme="finance-tracker-dark">
      <Page {...camelCaseKeys(window.pageProps)} />
    </div>
  );

  const root = createRoot(document.getElementById('react-mount')!);
  root.render(page);
}
