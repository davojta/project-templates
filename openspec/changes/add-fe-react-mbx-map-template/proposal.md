# Change: Add React + Mapbox GL JS frontend template

## Why
Frontend templates with map integrations are common for geospatial applications. This template provides a production-ready starting point combining React 19, Vite, TypeScript, and Mapbox GL JS with comprehensive testing setup (Vitest for unit/integration, Cypress for E2E).

## What Changes
- New template directory: `fe-react-mbx-map/`
- React 19 + TypeScript + Vite build system
- Mapbox GL JS integration following official Mapbox tutorial patterns
- Single-page map application with controls
- Lodash included as utility dependency
- Testing infrastructure:
  - Vitest for unit and component tests
  - Cypress for E2E testing
- ESLint configuration for code quality
- Development tooling via npm scripts

## Impact
- Affected specs: new `fe-react-mbx-map` capability spec
- Affected code: none (new template)
- No breaking changes to existing templates
