# Change: Add Bun + React + Hono GeoJSON Review Template

## Why
Need a template for building single-repo geodata SPAs that allow reviewing collections of GeoJSON features. The template combines Bun runtime, Hono API, React frontend with TanStack Router, and SQLite persistence in a unified development experience.

## What Changes
- Add new template directory `bun-api-fe-review-geojson/`
- Single Bun process serves both SPA and API
- React frontend with TanStack Router file-based routing
- Hono REST API for layer/feature CRUD operations
- SQLite for layer metadata persistence
- Mapbox GL JS direct integration (aligned with fe-react-mbx-map)
- Two pages: map view (with navigation buttons) and table view
- Static data folder for GeoJSON files and legends
- Vitest for unit testing, Cypress for component and E2E testing
- Zod schemas for API request/response validation

## Impact
- Affected specs: New capability `bun-api-fe-review-geojson`
- Affected code: New template directory at repository root
- No breaking changes to existing templates
