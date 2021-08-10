# Kerberus Dashboard Frontend

List of customizations

```
- Placeholder in search input (node_modules/@backstage/plugin-search/dist/index.esm.js)
- Logo Full (packages/app/src/components/Root/LogoFull.tsx)
- Logo Icon (packages/app/src/components/Root/LogoIcon.tsx)
- Public favicon and index.htm (packages/app/public)
```

Preinstalled plugins

```
- Kubernetes
```

Sample docker-compose.yaml

```
version: '3.7'

services:
  kerberus.fe:
    build: .
    container_name: kerberus.fe
    image: prokjectkerberus/kerberus-dashboard-frontend
    restart: always
    ports:
      - 3000:8080
```
