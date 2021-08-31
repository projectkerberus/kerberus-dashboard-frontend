import React from 'react';
import { Navigate, Route } from 'react-router';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { SearchPage } from '@backstage/plugin-search';
import { TechRadarPage } from '@backstage/plugin-tech-radar';
import { TechdocsPage } from '@backstage/plugin-techdocs';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInProviderConfig,
} from '@backstage/core-components';
import { createApp, FlatRoutes } from '@backstage/core-app-api';

import {
  githubAuthApiRef,
  samlAuthApiRef,
  gitlabAuthApiRef,
} from '@backstage/core-plugin-api';

const githubProvider: SignInProviderConfig = {
  id: 'github-auth-provider',
  title: 'GitHub',
  message: 'Sign in using GitHub',
  apiRef: githubAuthApiRef,
};

const gitlabProvider: SignInProviderConfig = {
  id: 'gitlab-auth-provider',
  title: 'GitLab',
  message: 'Sign in using GitLab',
  apiRef: gitlabAuthApiRef,
};

// const microsoftProvider: SignInProviderConfig = {
//   id: 'microsoft-auth-provider',
//   title: 'Microsoft',
//   message: 'Sign in using Microsoft',
//   apiRef: microsoftAuthApiRef,
// };

// const googleProvider: SignInProviderConfig = {
//   id: 'google-auth-provider',
//   title: 'Google',
//   message: 'Sign in using Google',
//   apiRef: googleAuthApiRef,
// };

const samlProvider: SignInProviderConfig = {
  id: 'saml-auth-provider',
  title: 'Saml',
  message: 'Sign in using Saml',
  apiRef: samlAuthApiRef,
};

/* AUTH */
const enabledProviders: any = [];

if (process.env.AUTH_GUEST === 'true') {
  enabledProviders.push('guest');
}
if (process.env.AUTH_GITHUB_CLIENT_ID !== '') {
  enabledProviders.push(githubProvider);
}
if (process.env.AUTH_GITLAB_CLIENT_ID !== '') {
  enabledProviders.push(gitlabProvider);
}
// if (process.env.AUTH_GOOGLE_CLIENT_ID !== '') {
//   enabledProviders.push(googleProvider);
// }
// if (process.env.AUTH_MICROSOFT_CLIENT_ID !== '') {
//   enabledProviders.push(microsoftProvider);
// }
// if (process.env.AUTH_SAML_ENTRY_POINT !== '') {
// enabledProviders.push(samlProvider);
// }

const app = createApp({
  apis,
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
    });
    bind(apiDocsPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
    });
  },
});

const AppProvider = app.getProvider();
const AppRouter = app.getRouter();

const routes = (
  <FlatRoutes>
    <Navigate key="/" to="/catalog" />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechdocsPage />} />
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/tech-radar"
      element={<TechRadarPage width={1500} height={800} />}
    />
    <Route path="/catalog-import" element={<CatalogImportPage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/settings" element={<UserSettingsPage />} />
  </FlatRoutes>
);

const App = () => (
  <AppProvider>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </AppProvider>
);

export default App;
