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
bun run test:ci && bun run typecheck
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

## Browser Automation (surf-cli)

Use `surf read` to understand page structure without screenshots. The accessibility tree shows all interactive elements with stable labels.

```bash
surf go "http://localhost:5173/map"
surf read                              # accessibility tree with aria-labels
surf read --depth 3 --compact          # shorter output
```

### Identifiers convention

All interactive UI elements have two attributes:
- `data-testid="<id>"` -- for Cypress / test automation selectors
- `aria-label="<id>"` -- for surf-cli accessibility tree (shows up in `surf read` output so an AI agent can understand and interact with the page without screenshots)

When adding new interactive elements, always add both attributes with a matching stable identifier.

### Verifier script

```bash
surf run scripts/surf-verify.ts        # full automated walkthrough (requires bun run dev)
```

### Evals

```bash
bun evals/run-evals.ts                  # all evals (deterministic + agentic)
bun evals/run-evals.ts --deterministic  # deterministic only (fast, no LLM)
bun evals/run-evals.ts --agentic        # agentic only (uses claude -p with haiku)
```

Deterministic evals (1-6) test __appInspect and __mapInspect APIs directly via surf js.
Agentic evals (7-9) give Claude a task prompt and assert on structured output.

## App Inspection (window.__appInspect)

High-level programmatic API for navigating and interacting with the app via `surf js`. Available on all pages. Each page registers its own handlers when mounted.

### Navigation

```bash
surf js "return window.__appInspect.getPage()"
# => "map" | "table" | "results"

surf js "window.__appInspect.navigate('table')"
surf js "window.__appInspect.navigate('results')"
surf js "window.__appInspect.navigate('map')"
```

### Map page -- review features

```bash
# Get current feature details (id, index, total, isFlagged, properties, geometry)
surf js "return JSON.stringify(window.__appInspect.map.getFeatureDetails())"

# Navigate between features
surf js "return window.__appInspect.map.next()"     # => true/false
surf js "return window.__appInspect.map.prev()"     # => true/false

# Flag/unflag current feature
surf js "return window.__appInspect.map.flag()"     # => true if was unflagged
surf js "return window.__appInspect.map.unflag()"   # => true if was flagged
```

### Table page -- bulk data access

```bash
# Get all features as JS objects: [{id, isFlagged, properties}, ...]
surf js "return JSON.stringify(window.__appInspect.table.getData())"

# Toggle flag on a specific feature
surf js "return window.__appInspect.table.toggleFlag('point-2')"
```

### Results page -- review summary

```bash
# Get summary: {layerName, total, reviewed, flagged, passed, flaggedFeatures[]}
surf js "return JSON.stringify(window.__appInspect.results.getSummary())"
```

### Typical agent workflow

```bash
# 1. Open app and understand map state
surf navigate "http://localhost:5173/map"
surf js "return JSON.stringify(window.__appInspect.map.getFeatureDetails())"

# 2. Walk through features and flag ones that need attention
surf js "return window.__appInspect.map.flag()"
surf js "return window.__appInspect.map.next()"
surf js "return JSON.stringify(window.__appInspect.map.getFeatureDetails())"

# 3. Switch to table for full overview
surf js "window.__appInspect.navigate('table')"
surf js "return JSON.stringify(window.__appInspect.table.getData())"

# 4. Check results summary
surf js "window.__appInspect.navigate('results')"
surf js "return JSON.stringify(window.__appInspect.results.getSummary())"
```

## Map Inspection (window.__mapInspect)

Low-level Mapbox GL map inspection API. Available only on the map page. Use for camera state, style layers, and viewport feature queries.

### Get camera position

```bash
surf js "return JSON.stringify(window.__mapInspect.getCamera())"
# => {"center":[-122.4194,37.7749],"zoom":14,"bearing":0,"pitch":0}
```

### List all map style layers

```bash
surf js "return JSON.stringify(window.__mapInspect.getLayers().filter(l => l.id.startsWith('geojson')))"
# => [{"id":"geojson-layer","type":"circle","visible":true}, ...]
```

### Query features in current viewport

```bash
surf js "return (async()=>{const r=await window.__mapInspect.verify({queries:[{name:'markers',method:'viewport',options:{layers:['geojson-layer'],limit:5}}]});return JSON.stringify(r,null,2)})()"
```

Returns a single JSON with:
- `status` -- "ok" or "error"
- `camera` -- current center/zoom/bearing/pitch
- `layers` -- all map style layers with visibility
- `queries[].featureCount` -- total features visible in viewport
- `queries[].features` -- array of {id, properties, geometry} up to limit

### Common patterns

```bash
# Check if features are loaded after navigation
surf js "return window.__mapInspect?.getLayers().some(l => l.id === 'geojson-layer')"

# Count visible markers
surf js "return (async()=>{const r=await window.__mapInspect.verify({queries:[{name:'count',method:'viewport',options:{layers:['geojson-layer'],limit:1}}]});return r.queries[0].featureCount})()"

# Query features at specific layer
surf js "return (async()=>{const r=await window.__mapInspect.verify({queries:[{name:'flags',method:'viewport',options:{layers:['geojson-layer-highlight'],limit:10}}]});return JSON.stringify(r.queries[0])})()"
```
