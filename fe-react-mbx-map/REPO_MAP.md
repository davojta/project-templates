# Repo Map: fe-react-mbx-map

React + Mapbox GL JS template with Vite, TypeScript, Vitest, and Cypress.

## Structure

```
src/
  components/    React components (map UI)
  hooks/         Custom hooks (map lifecycle)
  styles/        CSS
tests/unit/      Vitest unit tests
cypress/
  component/     Cypress component tests
  e2e/           Cypress E2E tests
```

## Architecture

```
main.tsx -> App -> Map component -> useMap hook -> mapbox-gl
```

- `Map` -- renders map container, coordinate sidebar, reset button
- `useMap` -- manages mapbox-gl instance lifecycle, exposes map state and controls

## Stack

- **Runtime:** React, mapbox-gl, lodash
- **Build:** Vite, TypeScript (strict)
- **Test:** Vitest (unit), Cypress (component + E2E)
- **Lint:** ESLint with react-hooks, react-refresh

## Environment

- Requires `VITE_MAPBOX_ACCESS_TOKEN` in `.env`
