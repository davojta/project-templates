# Repo Map: bun-api-fe-review-geojson

GeoJSON feature review application with a Bun/Hono API backend and React frontend for reviewing and managing geospatial features on a map.

## Structure

```
index.ts              Server entry point (Hono app, proxies to Vite in dev)
src/api/              REST API routes: /api/layers, /api/features; SQLite persistence
src/types/            Shared TypeScript types between API and client
src/client/src/
  routes/             TanStack Router pages: index, map, table
  components/         UI: MapShell, FeatureTable, ReviewControls, BasemapSelector, LayerToggle
  hooks/              TanStack Query data hooks (useFeatures, useLayers)
data/                 Static assets: basemaps config, sample GeoJSON layers
scripts/              Database seed script
tests/unit/           Vitest API tests
cypress/              Component tests (MapShell, FeatureTable, BasemapSelector) + e2e flow
```

## Architecture

```
               +-------------+
               |  Vite (dev) |
               |  :5173      |
               +------^------+
                      |proxy
+--------+    +-------+-------+    +---------+
| Browser| -> | Hono server   | -> | SQLite  |
|        | <- | :3000         | <- | db      |
+--------+    +---+-----------+    +---------+
                  |
                  | serveStatic
                  v
              data/layers/*.geojson
```

**API** exposes layers (GeoJSON sources) and features (review state) via Zod-validated endpoints.
**Client** renders features on a Mapbox GL map with review controls and a tabular view.

## Stack

- **Runtime:** Bun, Hono
- **Frontend:** React, Vite, TanStack Router/Query, MUI, mapbox-gl
- **Validation:** Zod
- **Test:** Vitest (unit), Cypress (component + e2e)
- **Lint/Format:** ESLint, Prettier

## Environment

- `MAPBOX_ACCESS_TOKEN` required for map rendering (client-side)
- Dev mode runs API on :3000 proxying to Vite on :5173
