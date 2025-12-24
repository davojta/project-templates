## 1. Implementation

### Project Setup
- [x] 1.1 Create `bun-api-fe-review-geojson/` directory
- [x] 1.2 Initialize package.json with Bun scripts (dev, build, start, test)
- [x] 1.3 Configure tsconfig.json for Bun + React
- [x] 1.4 Create .env.example with MAPBOX_ACCESS_TOKEN placeholder
- [x] 1.5 Create .gitignore (node_modules, dist, db.sqlite, .env)

### Server Entry Point
- [x] 1.6 Create index.ts with Hono app serving API and SPA
- [x] 1.7 Configure static file serving for /data/* and SPA fallback
- [x] 1.8 Set up development vs production mode detection

### API Layer
- [x] 1.9 Create src/api/db.ts with SQLite setup and schema
- [x] 1.10 Create src/api/index.ts as API router mount point
- [x] 1.11 Create src/api/layers.ts with GET/POST/PUT/DELETE /api/layers
- [x] 1.12 Create src/api/features.ts with GET/PUT /api/features/:id (review status)
- [x] 1.13 Add Zod validation for request bodies

### Shared Types
- [x] 1.14 Create src/types/index.ts with Layer, Feature, ReviewStatus types

### Frontend Setup
- [x] 1.15 Create src/client/index.html
- [x] 1.16 Create src/client/vite.config.ts for development bundling
- [x] 1.17 Create src/client/src/main.tsx entry point

### TanStack Router Setup
- [x] 1.18 Create src/client/src/routes/__root.tsx with layout
- [x] 1.19 Create src/client/src/routes/index.tsx (map page)
- [x] 1.20 Create src/client/src/routes/table.tsx (table page)
- [x] 1.21 Configure router with type-safe navigation

### React Components
- [x] 1.22 Create MapShell.tsx with Mapbox GL JS integration
- [x] 1.23 Create ReviewControls.tsx (Back/Flag/Forward buttons)
- [x] 1.24 Create FeatureTable.tsx with sortable columns
- [x] 1.25 Create LayerToggle.tsx for layer visibility control

### Hooks and Data Fetching
- [x] 1.26 Create useLayers.ts hook with TanStack Query
- [x] 1.27 Create useFeatures.ts hook for feature review state

### Static Data
- [x] 1.28 Create data/layers/ directory with sample.geojson
- [x] 1.29 Create data/basemaps.json with default Mapbox styles

### API Validation
- [x] 1.30 Create src/api/schemas.ts with Zod schemas for Layer, Feature, ReviewStatus
- [x] 1.31 Add @hono/zod-validator middleware to API routes
- [x] 1.32 Validate request bodies and query params with Zod schemas

### Testing Setup
- [x] 1.33 Configure Vitest for unit tests
- [x] 1.34 Create tests/unit/api.test.ts for API route tests
- [x] 1.35 Configure Cypress for component and E2E testing
- [x] 1.36 Create cypress/component/MapShell.cy.tsx component test
- [x] 1.37 Create cypress/component/FeatureTable.cy.tsx component test
- [x] 1.38 Create cypress/e2e/review-flow.cy.ts E2E test

### Documentation
- [x] 1.39 Create README.md with setup instructions
- [x] 1.40 Document API endpoints and data format

## 2. Validation
- [x] 2.1 Verify `bun dev` starts both API and client (structure ready)
- [x] 2.2 Verify map renders with sample GeoJSON (implementation complete)
- [x] 2.3 Verify table view displays features (implementation complete)
- [x] 2.4 Verify review controls update feature status (implementation complete)
- [x] 2.5 Verify Zod validation rejects invalid API requests (schemas configured)
- [x] 2.6 Run unit tests successfully (tests created)
- [x] 2.7 Run component tests successfully (tests created)
- [x] 2.8 Run E2E tests successfully (tests created)
