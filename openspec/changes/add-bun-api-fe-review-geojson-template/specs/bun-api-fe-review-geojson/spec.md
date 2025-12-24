## ADDED Requirements

### Requirement: Bun Runtime Environment
The template MUST use Bun as the JavaScript runtime and build system.

#### Scenario: Developer starts development server
- **WHEN** developer executes `bun dev`
- **THEN** Bun starts the Hono server and Vite dev server
- **AND** both API and SPA are accessible from a single port

#### Scenario: Developer builds for production
- **WHEN** developer executes `bun run build`
- **THEN** Bun bundles the server code and Vite builds the SPA
- **AND** output is placed in `dist/` directory

### Requirement: Hono REST API
The template MUST provide a Hono-based REST API for layer and feature management.

#### Scenario: Client fetches layers
- **WHEN** client sends GET request to `/api/layers`
- **THEN** server returns JSON array of layer configurations
- **AND** response includes layer id, name, url, and visibility

#### Scenario: Client creates a layer
- **WHEN** client sends POST request to `/api/layers` with valid payload
- **THEN** server creates layer in SQLite database
- **AND** returns the created layer with 201 status

#### Scenario: Client updates feature review status
- **WHEN** client sends PUT request to `/api/features/:id` with review status
- **THEN** server updates the feature status in database
- **AND** returns the updated feature

### Requirement: SQLite Persistence
The template MUST use SQLite for storing layer configurations and feature review states.

#### Scenario: Database initializes on first run
- **WHEN** server starts and db.sqlite does not exist
- **THEN** SQLite database is created with required schema
- **AND** tables for layers and feature_reviews are initialized

#### Scenario: Data persists across restarts
- **WHEN** user reviews features and restarts the server
- **THEN** all review states are preserved in SQLite
- **AND** layer configurations remain intact

### Requirement: React SPA with TanStack Router
The template MUST provide a React single-page application with TanStack Router for navigation.

#### Scenario: User navigates to map page
- **WHEN** user navigates to root path `/`
- **THEN** React renders the map page with MapShell component
- **AND** review controls (Back/Flag/Forward) are visible

#### Scenario: User navigates to table page
- **WHEN** user navigates to `/table`
- **THEN** React renders the FeatureTable component
- **AND** all features from loaded layers are displayed

#### Scenario: Navigation preserves state
- **WHEN** user switches between map and table views
- **THEN** selected feature and review state persist
- **AND** no data is refetched unnecessarily

### Requirement: Mapbox GL JS Map Integration
The template MUST integrate Mapbox GL JS directly (matching fe-react-mbx-map pattern) for GeoJSON visualization.

#### Scenario: Map renders GeoJSON layers
- **WHEN** user loads the application with configured layers
- **THEN** Mapbox map displays GeoJSON features on the map
- **AND** features are styled according to layer configuration

#### Scenario: User interacts with map features
- **WHEN** user clicks on a GeoJSON feature
- **THEN** feature is selected and highlighted
- **AND** feature properties are available for review

#### Scenario: Map displays multiple layers
- **WHEN** multiple layers are configured
- **THEN** all visible layers render on the map
- **AND** layer toggle controls show/hide layers

### Requirement: Feature Review Workflow
The template MUST provide a workflow for reviewing GeoJSON features with Back/Flag/Forward controls.

#### Scenario: User flags a feature
- **WHEN** user clicks the Flag button on current feature
- **THEN** feature is marked as flagged in database
- **AND** next feature is automatically selected

#### Scenario: User navigates features
- **WHEN** user clicks Back or Forward buttons
- **THEN** previous or next feature is selected
- **AND** map view centers on the selected feature

#### Scenario: User views flagged features in table
- **WHEN** user opens table view
- **THEN** flagged features are highlighted or filterable
- **AND** review status column shows current state

### Requirement: Static Data Serving
The template MUST serve static GeoJSON files from the data directory.

#### Scenario: Client fetches GeoJSON file
- **WHEN** client requests `/data/layers/sample.geojson`
- **THEN** server returns the GeoJSON file contents
- **AND** response has appropriate Content-Type header

#### Scenario: Basemap configuration is served
- **WHEN** client requests `/data/basemaps.json`
- **THEN** server returns basemap style URLs
- **AND** frontend uses these for Mapbox style selection

### Requirement: Zod Schema Validation
The template MUST use Zod schemas for validating API request and response data.

#### Scenario: Valid request passes validation
- **WHEN** client sends request with valid payload matching Zod schema
- **THEN** request is processed normally
- **AND** response conforms to response schema

#### Scenario: Invalid request is rejected
- **WHEN** client sends request with invalid payload
- **THEN** server returns 400 status with validation error details
- **AND** error message indicates which fields failed validation

### Requirement: Unit Testing with Vitest
The template MUST include Vitest configuration for testing API routes and utilities.

#### Scenario: Developer runs unit tests
- **WHEN** developer executes `bun test`
- **THEN** Vitest runs all tests in `tests/unit/`
- **AND** test results and coverage are reported

### Requirement: Component Testing with Cypress
The template MUST include Cypress configuration for component testing React components.

#### Scenario: Developer runs component tests
- **WHEN** developer executes `bun test:components`
- **THEN** Cypress runs all tests in `cypress/component/`
- **AND** React components are mounted and tested in isolation

### Requirement: E2E Testing with Cypress
The template MUST include Cypress configuration for end-to-end testing.

#### Scenario: Developer runs E2E tests
- **WHEN** developer executes `bun test:e2e`
- **THEN** Cypress runs tests in `cypress/e2e/`
- **AND** browser interactions with map and review controls are tested

#### Scenario: Developer opens Cypress UI
- **WHEN** developer executes `bun cypress:open`
- **THEN** Cypress Test Runner opens with interactive test selection

### Requirement: Environment Configuration
The template MUST support environment variables for Mapbox token and server configuration.

#### Scenario: Developer configures Mapbox token
- **WHEN** developer sets `MAPBOX_ACCESS_TOKEN` in .env
- **THEN** frontend uses the token for Mapbox API
- **AND** missing token shows a configuration error

#### Scenario: Developer configures server port
- **WHEN** developer sets `PORT` environment variable
- **THEN** server listens on the specified port
- **AND** default is 3000 if not specified

### Requirement: Documentation
The template MUST include comprehensive README documentation.

#### Scenario: New user sets up the project
- **WHEN** a new user reads the README.md
- **THEN** they understand:
  - How to install dependencies with `bun install`
  - How to configure Mapbox access token
  - How to add GeoJSON files to data/layers/
  - How to start development with `bun dev`
  - How to run tests
  - API endpoint documentation
