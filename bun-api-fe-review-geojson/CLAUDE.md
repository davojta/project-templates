# Project: bun-api-fe-review-geojson

GeoJSON feature review application with Bun API backend and React frontend.

## Tech Stack

- **Runtime**: Bun
- **API**: Hono
- **Frontend**: React 19, Vite, TanStack Router/Query
- **UI**: MUI (Material UI)
- **Mapping**: mapbox-gl
- **Validation**: Zod
- **Testing**: Vitest (unit), Cypress (component + e2e)

## Commands

```bash
bun run dev          # Start dev server (API + client)
bun run build        # Build for production
bun run test         # Run unit tests (vitest)
bun run test:e2e     # Run e2e tests (cypress)
bun run typecheck    # Type check
bun run lint         # Lint
bun run format       # Format code
bun run seed         # Seed database
```

## Project Structure

```
index.ts              # Hono server entry
src/api/              # API routes and handlers
src/client/           # React frontend (Vite)
src/types/            # Shared TypeScript types
data/                 # Static data files
tests/                # Unit tests
cypress/              # Component and e2e tests
```

## Development

- API runs on port 3000, proxies to Vite dev server on 5173
- Use `bun run dev` to start both servers concurrently

## Validation

**Quick validation (after each non-trivial edit):**
```bash
bun run test && bun run typecheck
```

**Component tests:**
```bash
bun run test:components   # Cypress component tests
```

**Full validation (after big refactoring):**
```bash
bun run test:e2e          # Cypress e2e tests (slow)
```

**Before committing:**
```bash
bun run format            # Format code with Prettier
```
