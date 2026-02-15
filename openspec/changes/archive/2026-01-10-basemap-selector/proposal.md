## Why

The map currently uses a hardcoded basemap style (`streets-v12`). Users need the ability to switch between different basemap styles (streets, satellite, light, dark) to better visualize GeoJSON features depending on the context and their preferences.

## What Changes

- Add a floating basemap selector component positioned at the bottom-right of the map
- Display available basemaps from `data/basemaps.json` as a list with radio-style checkboxes
- Allow single basemap selection (only one active at a time)
- Switch the Mapbox map style when user selects a different basemap
- Use MUI Card for the floating container and MUI Checkbox for selection controls

## Capabilities

### New Capabilities

- `basemap-selector`: Floating UI component for selecting map basemap style. Includes fetching basemap options, rendering selection UI, and triggering map style changes.

### Modified Capabilities

None - this is a new standalone component that integrates with the existing MapShell.

## Impact

- **Components**: New `BasemapSelector` component, modifications to `MapShell` to accept and apply basemap style changes
- **Data**: Uses existing `data/basemaps.json` (id, name, styleUrl structure)
- **Dependencies**: Uses existing MUI (Card, Checkbox) - no new dependencies
- **API**: None - basemaps.json imported statically in frontend
