# k8s-app-ui

Next.js UI for `k8s-app-api`: list, add, edit and delete users and items.

The browser calls the API with the relative path `/api`, so the UI and API share one origin
and no CORS is needed. In the cluster the ingress sends `/api` to `k8s-app-api` and everything
else here (see `k8s-config/config/overlays/*/ingress.yaml`).

## Run locally

Point the dev server at any running API:

```bash
npm install
API_URL=https://api.dev-k8s.auren.rest npm run dev     # the shared dev API on the VPS
# or a local API:  API_URL=http://localhost:3000 npm run dev
```

`API_URL` only drives the dev-server rewrite in `next.config.mjs`; it is not used in the cluster.

## Build

```bash
docker build -t k8s-app-ui .
docker run -p 3000:3000 k8s-app-ui
```

The image runs the Next.js standalone server as a non-root user, about 35MB of RAM at rest
(the pod limit is 192Mi).

## Deploy

Push to `dev` -> image to GHCR -> dev namespace. Push to `main` -> prod (after approval).
URLs: `https://dev-k8s.auren.rest` and `https://k8s.auren.rest`.
