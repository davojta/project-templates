## Context
This template targets developers building geodata review applications. Single-repo approach simplifies deployment and development workflow. Bun chosen for fast startup and native TypeScript support.

## Goals / Non-Goals
- Goals:
  - Single `bun dev` command starts full stack
  - Type-safe API with Hono and Zod validation
  - File-based routing with TanStack Router
  - SQLite for zero-config persistence
  - Production-ready with `bun build` output
- Non-Goals:
  - Authentication/authorization (can be added later)
  - Real-time updates via WebSockets
  - Multi-database support

## Decisions
- **Runtime**: Bun (fast, native TS, built-in SQLite bindings)
- **API Framework**: Hono (lightweight, Bun-optimized, type-safe)
- **Frontend Build**: Vite ^7.3.0 with @vitejs/plugin-react ^5.1.2
- **Frontend Router**: TanStack Router (file-based, type-safe params)
- **Map Library**: mapbox-gl ^3.17.0 (direct integration, matches fe-react-mbx-map)
- **State Management**: TanStack Query (API cache, async state)
- **Testing**: Vitest ^4.0.16 (unit), Cypress ^15.8.1 (component + E2E)
- **Validation**: Zod schemas for API request/response validation
- **Build**: Bun for server, Vite for client

## Frontend Stack (aligned with fe-react-mbx-map)
```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "mapbox-gl": "^3.17.0",
    "lodash": "^4.17.21",
    "@tanstack/react-router": "^1.50.0",
    "@tanstack/react-query": "^5.0.0",
    "hono": "^4.5.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.2",
    "cypress": "^15.8.1",
    "eslint": "^9.17.0",
    "typescript": "^5.9.3",
    "vite": "^7.3.0",
    "vitest": "^4.0.16",
    "start-server-and-test": "^2.0.8"
  }
}
```

## Architecture

```
[Browser] <--HTTP--> [Bun/Hono Server]
                           |
              +------------+------------+
              |            |            |
         [/api/*]    [/data/*]    [/*]
              |            |            |
         [Routes]    [Static]    [SPA]
              |
         [SQLite]
```

### Data Flow
1. SPA fetches layer configs from `/api/layers`
2. Layers reference GeoJSON files in `/data/layers/`
3. Map component loads GeoJSON via `/data/layers/{filename}`
4. Feature review state stored in SQLite via API

### File Structure
```
bun-api-fe-review-geojson/
├── package.json
├── tsconfig.json
├── index.ts                 # Bun entry, Hono app
├── data/
│   ├── layers/              # GeoJSON files
│   └── basemaps.json        # Basemap configs
├── src/
│   ├── api/
│   │   ├── index.ts         # API router
│   │   ├── layers.ts        # Layer CRUD
│   │   ├── features.ts      # Feature review endpoints
│   │   └── db.ts            # SQLite setup
│   ├── client/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── __root.tsx
│   │       │   ├── index.tsx    # Map page
│   │       │   └── table.tsx    # Table page
│   │       ├── components/
│   │       │   ├── MapShell.tsx
│   │       │   ├── FeatureTable.tsx
│   │       │   └── ReviewControls.tsx
│   │       └── hooks/
│   │           └── useLayers.ts
│   └── types/
│       └── index.ts         # Shared types
└── tests/
    ├── unit/
    └── e2e/
```

## Risks / Trade-offs
- **Bun maturity**: Bun is newer than Node.js, some edge cases may exist
  - Mitigation: Template targets common patterns, document known issues
- **Single process**: API and SPA coupled in one process
  - Mitigation: Acceptable for review tools; production can split if needed
- **SQLite scaling**: Not suitable for high-concurrency writes
  - Mitigation: Review tools are low-write, read-heavy; fits SQLite profile

## Open Questions
- None blocking for initial implementation
