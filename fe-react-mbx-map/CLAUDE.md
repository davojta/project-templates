# Project: fe-react-mbx-map

React + Mapbox GL JS frontend template with TypeScript, Vite, and comprehensive testing.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: React 19, Vite
- **Mapping**: Mapbox GL JS
- **Testing**: Vitest (unit), Cypress (component + e2e)
- **Lint**: ESLint
- **Language**: TypeScript

## Setup

Create `.env` with your Mapbox token before starting:

```bash
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

Get a token at [account.mapbox.com](https://account.mapbox.com).

## Commands

```bash
npm run dev                 # Start development server
npm run build               # Build for production
npm run preview             # Preview production build
npm run lint                # Run ESLint
npm run typecheck           # Check TypeScript types
npm run test                # Run all Vitest tests
npm run test:unit           # Unit tests only (Vitest)
npm run test:components:cy  # Component tests (Cypress)
npm run test:e2e            # E2E tests (Cypress)
npm run cypress:open        # Open Cypress Test Runner (interactive)
```

## Project Structure

```
fe-react-mbx-map/
├── src/
│   ├── components/
│   │   └── Map.tsx        # Main map component
│   ├── hooks/
│   │   └── useMap.ts      # Map state management
│   ├── styles/
│   │   └── map.css
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── unit/              # Vitest unit tests
├── cypress/
│   ├── component/         # Cypress component tests
│   ├── e2e/               # Cypress e2e tests
│   └── support/
└── public/
```

## Validation

```bash
# After each non-trivial edit
npm run test:unit && npm run typecheck

# Full validation
npm run test:e2e

# Before committing
npm run lint
```
