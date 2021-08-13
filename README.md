# Kerberus Dashboard Frontend

### List of customizations

```
- Placeholder in search input (node_modules/@backstage/plugin-search/dist/index.esm.js)
- Logo Full (packages/app/src/components/Root/LogoFull.tsx)
- Logo Icon (packages/app/src/components/Root/LogoIcon.tsx)
- Public favicon and index.html (packages/app/public)
```

### Preinstalled plugins

```
- Kubernetes
```

### Sample docker-compose.yaml

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

### CI - Build/Deploy

Automatic build and deploy start only when you push new tag.

> Version in package.json **must** follow the tag of the push.
