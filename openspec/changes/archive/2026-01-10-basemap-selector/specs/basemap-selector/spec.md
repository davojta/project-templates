# basemap-selector Specification

## Purpose

Floating UI component for selecting map basemap styles. Allows users to switch between different Mapbox basemap styles (streets, satellite, light, dark) to better visualize GeoJSON features.

## ADDED Requirements

### Requirement: Basemap Data Loading
The system MUST load basemap options from a static JSON import.

#### Scenario: Basemaps available at build time
- **WHEN** the BasemapSelector component renders
- **THEN** it uses basemap options imported from `data/basemaps.json`
- **AND** displays the list of available basemaps

### Requirement: Basemap Selection UI
The system MUST display a floating card with radio-style selection for basemap options.

#### Scenario: Basemap selector renders
- **WHEN** the map page loads
- **THEN** a floating MUI Card appears at the bottom-right of the map
- **AND** displays all basemap options with radio checkboxes
- **AND** the current basemap is marked as selected

#### Scenario: User selects a different basemap
- **WHEN** user clicks on a basemap option
- **THEN** that option becomes selected (radio behavior - single selection)
- **AND** the map style updates to the selected basemap

### Requirement: Map Style Change
The system MUST update the Mapbox map style when a basemap is selected.

#### Scenario: Style change preserves data layers
- **WHEN** user selects a new basemap
- **THEN** the map style changes to the selected basemap styleUrl
- **AND** existing GeoJSON layers are re-added after style load
- **AND** feature selection state is preserved

#### Scenario: Default basemap on load
- **WHEN** the map first loads
- **THEN** it uses `streets-v12` as the default basemap
- **AND** the streets option is pre-selected in the selector

### Requirement: Basemap Data Structure
Each basemap option MUST have id, name, and styleUrl properties.

#### Scenario: Basemap object structure
- **WHEN** basemaps are loaded from the API
- **THEN** each basemap has an `id` (string identifier)
- **AND** each basemap has a `name` (display label)
- **AND** each basemap has a `styleUrl` (Mapbox style URL)
