# fe-react-mbx-map

React + Mapbox GL JS frontend template with TypeScript, Vite, and comprehensive testing.

## Prerequisites

- Node.js 18+
- Mapbox account with access token

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your Mapbox token:
```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

Get your token at [account.mapbox.com](https://account.mapbox.com)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |
| `npm run test` | Run all Vitest tests |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run test:components:cy` | Run component tests (Cypress) |
| `npm run test:e2e` | Run E2E tests (Cypress) |
| `npm run cypress:open` | Open Cypress Test Runner |

## Project Structure

```
fe-react-mbx-map/
├── src/
│   ├── components/        # React components
│   │   └── Map.tsx        # Main map component
│   ├── hooks/             # Custom React hooks
│   │   └── useMap.ts      # Map state management hook
│   ├── styles/            # CSS styles
│   │   └── map.css        # Map-specific styles
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── tests/
│   └── unit/              # Unit tests (Vitest)
├── cypress/
│   ├── component/         # Component tests (Cypress)
│   ├── e2e/               # E2E tests (Cypress)
│   └── support/           # Cypress support files
└── public/                # Static assets
```

## Testing

### Unit Tests (Vitest)
```bash
npm run test:unit
```
Tests utility functions and hooks in `tests/unit/`.

### Component Tests (Cypress)
```bash
npm run test:components:cy
```
Tests React components with Cypress Component Testing in `cypress/component/`.

### E2E Tests (Cypress)
```bash
npm run test:e2e
```
Runs full browser E2E tests in `cypress/e2e/`.

### Interactive Mode
```bash
npm run cypress:open
```
Opens Cypress Test Runner for interactive test development.

## Features

- React 19 with TypeScript
- Vite for fast development and builds
- Mapbox GL JS integration
- Interactive map controls (pan, zoom, reset)
- Coordinate sidebar display
- Unit testing with Vitest
- Component testing with Cypress
- E2E testing with Cypress
- ESLint for code quality

## Dependencies

- **React 19** - UI framework
- **Mapbox GL JS** - Map rendering
- **Lodash** - Utility functions
- **Vitest** - Unit testing
- **Cypress** - Component and E2E testing
