# fe-react-mbx-map Specification

## Purpose
TBD - created by archiving change add-fe-react-mbx-map-template. Update Purpose after archive.
## Requirements
### Requirement: Vite Build System
The template MUST use Vite as the build tool with React and TypeScript plugins configured.

#### Scenario: Developer starts development server
- **WHEN** developer executes `npm run dev`
- **THEN** Vite starts a development server with hot module replacement
- **AND** TypeScript compilation errors are displayed in the console

#### Scenario: Developer builds for production
- **WHEN** developer executes `npm run build`
- **THEN** Vite produces optimized production bundles in `dist/`
- **AND** TypeScript types are checked before build

### Requirement: React Application Framework
The template MUST provide a React 19 single-page application with TypeScript and Lodash utilities available.

#### Scenario: Application renders
- **WHEN** user navigates to the application
- **THEN** React renders the main App component with the map

### Requirement: Mapbox GL JS Integration
The template MUST integrate Mapbox GL JS following the official Mapbox React tutorial patterns.

#### Scenario: Map renders with initial state
- **WHEN** user navigates to the application
- **THEN** a Mapbox map renders with configurable initial center and zoom
- **AND** the map displays using the provided access token

#### Scenario: Map state updates on interaction
- **WHEN** user pans or zooms the map
- **THEN** the sidebar displays current longitude, latitude, and zoom level
- **AND** values update in real-time

#### Scenario: User resets map view
- **WHEN** user clicks the reset button
- **THEN** the map animates back to the initial center and zoom level

### Requirement: Unit Testing with Vitest
The template MUST include Vitest configuration for unit testing utility functions and hooks.

#### Scenario: Developer runs unit tests
- **WHEN** developer executes `npm run test:unit`
- **THEN** Vitest runs all tests in `tests/unit/`
- **AND** test results and coverage are reported

### Requirement: Component Testing with Vitest
The template MUST include component testing setup using Vitest with React Testing Library.

#### Scenario: Developer runs component tests
- **WHEN** developer executes `npm run test:components`
- **THEN** Vitest runs all tests in `tests/components/`
- **AND** React components are tested with DOM assertions

### Requirement: E2E Testing with Cypress
The template MUST include Cypress configuration for end-to-end testing of user flows.

#### Scenario: Developer runs E2E tests
- **WHEN** developer executes `npm run test:e2e`
- **THEN** Cypress runs all tests in `cypress/e2e/`
- **AND** browser interactions are tested against the running application

#### Scenario: Developer opens Cypress UI
- **WHEN** developer executes `npm run cypress:open`
- **THEN** Cypress Test Runner opens with interactive test selection

### Requirement: Code Quality with ESLint
The template MUST include ESLint configuration for React and TypeScript code quality checks.

#### Scenario: Developer runs linting
- **WHEN** developer executes `npm run lint`
- **THEN** ESLint checks for code quality issues
- **AND** React-specific rules are applied

### Requirement: TypeScript Configuration
The template MUST be fully typed with strict TypeScript configuration.

#### Scenario: Developer writes code with type safety
- **WHEN** developer writes TypeScript code
- **THEN** the IDE provides type hints and error detection
- **AND** `npm run typecheck` validates all types

### Requirement: Environment Configuration
The template MUST support environment variables for Mapbox access token configuration.

#### Scenario: Developer configures Mapbox token
- **WHEN** developer sets `MAPBOX_ACCESS_TOKEN` environment variable
- **THEN** the map component uses the token for API access
- **AND** missing token results in a helpful error message

### Requirement: Documentation
The template MUST include comprehensive README documentation.

#### Scenario: New user sets up the project
- **WHEN** a new user reads the README.md
- **THEN** they understand:
  - How to install dependencies
  - How to configure Mapbox access token
  - How to start the development server
  - How to run tests (unit, component, E2E)
  - The project structure and conventions

