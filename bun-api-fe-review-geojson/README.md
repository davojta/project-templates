# Bun + React + Hono GeoJSON Review Template

A full-stack template for building geodata review applications with Bun runtime, Hono REST API, React frontend, and Mapbox GL JS integration.

## Features

- **Single-repo full-stack**: One repository with both API and SPA
- **Bun runtime**: Fast startup, native TypeScript support, built-in SQLite
- **Hono API**: Lightweight REST API with type-safe routes
- **React + TanStack Router**: File-based routing with type-safe navigation
- **Mapbox GL JS**: Direct integration for GeoJSON visualization
- **SQLite persistence**: Zero-config database for layer and review data
- **Zod validation**: Request/response validation with Zod schemas
- **Testing**: Vitest for unit tests, Cypress for component and E2E tests

## Project Structure

```
bun-api-fe-review-geojson/
├── index.ts                    # Bun entry point, Hono server
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── cypress.config.ts
├── data/
│   ├── layers/                 # GeoJSON files
│   │   └── sample.geojson
│   └── basemaps.json           # Basemap configurations
├── src/
│   ├── api/
│   │   ├── index.ts            # API router
│   │   ├── layers.ts           # Layer CRUD endpoints
│   │   ├── features.ts         # Feature review endpoints
│   │   ├── db.ts               # SQLite setup and queries
│   │   └── schemas.ts          # Zod validation schemas
│   ├── client/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── routes/
│   │       │   ├── __root.tsx
│   │       │   ├── index.tsx   # Map page
│   │       │   └── table.tsx   # Table page
│   │       ├── components/
│   │       │   ├── MapShell.tsx
│   │       │   ├── ReviewControls.tsx
│   │       │   ├── FeatureTable.tsx
│   │       │   └── LayerToggle.tsx
│   │       └── hooks/
│   │           ├── useLayers.ts
│   │           └── useFeatures.ts
│   └── types/
│       └── index.ts            # Shared TypeScript types
└── tests/
    ├── unit/
    │   └── api.test.ts
    └── cypress/
        ├── component/
        │   ├── MapShell.cy.tsx
        │   └── FeatureTable.cy.tsx
        └── e2e/
            └── review-flow.cy.ts
```

## Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- [Mapbox account](https://account.mapbox.com/) for access token

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy the example environment file and add your Mapbox access token:

```bash
cp .env.example .env
```

Edit `.env` and set your Mapbox token (same token for both server and client):

```
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
PORT=3000
```

**Note**: Both server and client use the same root `.env` file. Vite is configured to read from the project root via `envDir: '../../'` in `vite.config.ts`.

### 3. Add GeoJSON Data

Place your GeoJSON files in the `data/layers/` directory. The template includes a sample file at `data/layers/sample.geojson`.

### 4. Seed Sample Data (Optional)

```bash
bun seed
```

This creates a sample layer in the database pointing to `data/layers/sample.geojson`.

### 5. Start Development Server

```bash
bun dev
```

This concurrently starts:
- **Hono API server** on `http://localhost:3000`
- **Vite dev server** on `http://localhost:5173`

The Hono server proxies frontend requests to Vite in development mode.

Open `http://localhost:3000` in your browser.

**Alternative**: Run servers separately in different terminals:
```bash
# Terminal 1
bun run dev:server

# Terminal 2
bun run dev:client
```

## Development

### Adding New Layers

Layers can be added programmatically via the API or by seeding the database. To add a layer via API:

```bash
curl -X POST http://localhost:3000/api/layers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Layer",
    "url": "/data/layers/my-data.geojson",
    "visible": true,
    "color": "#007cbf"
  }'
```

### API Endpoints

#### Layers

- `GET /api/layers` - Get all layers
- `GET /api/layers/:id` - Get layer by ID
- `POST /api/layers` - Create new layer
- `PUT /api/layers/:id` - Update layer
- `DELETE /api/layers/:id` - Delete layer

#### Feature Reviews

- `GET /api/features/:layerId/:featureId` - Get feature review status
- `GET /api/features/layer/:layerId` - Get all reviews for a layer
- `PUT /api/features/:layerId/:featureId` - Update feature review status

### Data Format

#### Layer Object

```typescript
{
  id: string;
  name: string;
  url: string;
  visible: boolean;
  color?: string;
}
```

#### Feature Review Object

```typescript
{
  featureId: string;
  layerId: string;
  status: 'pending' | 'flagged' | 'approved';
  reviewedAt: string;
}
```

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
bun test
```

### Component Tests

Run Cypress component tests:

```bash
bun test:components
```

### E2E Tests

Run Cypress end-to-end tests:

```bash
bun test:e2e
```

### Interactive Testing

Open Cypress Test Runner for interactive testing:

```bash
bun cypress:open
```

## Production Build

### Build for Production

```bash
bun run build
```

This creates:
- Server bundle in `dist/index.js`
- Client bundle in `dist/client/`

### Start Production Server

```bash
bun start
```

## Customization

### Map Styling

Update basemap styles in `data/basemaps.json`:

```json
[
  {
    "id": "custom-style",
    "name": "Custom Style",
    "styleUrl": "mapbox://styles/username/style-id"
  }
]
```

### Review Workflow

The review workflow uses three states:
- `pending`: Initial state for new features
- `flagged`: Marked for further review
- `approved`: Reviewed and approved

You can extend this by modifying:
- `src/types/index.ts` - Add new status types
- `src/api/schemas.ts` - Update Zod validation
- `src/client/src/components/ReviewControls.tsx` - Add new control buttons

### Styling

Components use inline styles for simplicity. For production applications, consider:
- CSS modules
- Tailwind CSS
- Styled-components
- Emotion

## Architecture

### Data Flow

1. SPA fetches layer configs from `/api/layers`
2. Layers reference GeoJSON files in `/data/layers/`
3. Map component loads GeoJSON via `/data/layers/{filename}`
4. Feature review state stored in SQLite via API

### Technology Stack

- **Runtime**: Bun
- **API Framework**: Hono v4.5
- **Frontend**: React v19.2
- **Router**: TanStack Router v1.50
- **State Management**: TanStack Query v5.0
- **Map Library**: Mapbox GL JS v3.17
- **Database**: SQLite (via Bun)
- **Validation**: Zod v3.23
- **Build Tool**: Vite v7.3
- **Testing**: Vitest v4.0, Cypress v15.8

## Troubleshooting

### Mapbox Token Issues

If the map doesn't load, verify:
1. `VITE_MAPBOX_ACCESS_TOKEN` is set in `.env` (project root)
2. Token has public access scope
3. Token is not expired
4. Restart the dev server after changing `.env` file

### Database Issues

If you encounter database errors, delete `db.sqlite` and restart the server to recreate the database schema.

### Port Conflicts

If port 3000 is in use, change it in `.env`:

```
PORT=4000
```

## License

MIT
