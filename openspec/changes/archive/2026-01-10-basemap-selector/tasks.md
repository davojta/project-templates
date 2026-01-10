# Implementation Tasks

## 1. Types

### Type Definitions
- [x] 1.1 Add `Basemap` interface to `src/types/index.ts` (id, name, styleUrl)

## 2. BasemapSelector Component

### Component Structure
- [x] 2.1 Create `src/client/src/components/BasemapSelector.tsx`
- [x] 2.2 Import basemaps directly from `data/basemaps.json`
- [x] 2.3 Use MUI Card as floating container with absolute positioning (bottom-right)
- [x] 2.4 Use MUI RadioGroup and Radio for single-selection behavior

### Component Props
- [x] 2.5 Accept `currentBasemap: string` (current basemap id)
- [x] 2.6 Accept `onBasemapChange: (styleUrl: string) => void` callback

### Component Behavior
- [x] 2.7 Highlight currently selected basemap
- [x] 2.8 Call `onBasemapChange` when user selects a different basemap

## 3. MapShell Integration

### Style Management
- [x] 3.1 Add `currentStyle` state to MapShell (default: `streets-v12` styleUrl)
- [x] 3.2 Implement `map.setStyle()` when style changes
- [x] 3.3 Re-add GeoJSON source and layers after `style.load` event

### Component Composition
- [x] 3.4 Render BasemapSelector inside MapShell (absolute positioned over map)
- [x] 3.5 Wire up `onBasemapChange` to update map style

## 4. Testing

### Unit Tests
- [x] 4.1 Test BasemapSelector renders basemap options
- [x] 4.2 Test BasemapSelector calls onBasemapChange on selection

### Component Tests
- [x] 4.3 Cypress component test for BasemapSelector

### E2E Tests
- [x] 4.4 E2E test: verify basemap selector appears on map page
- [x] 4.5 E2E test: verify clicking basemap changes map style
