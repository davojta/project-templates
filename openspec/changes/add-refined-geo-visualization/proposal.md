# Change: Add Refined Geospatial Visualization System

## Why
The current python-geo-cli visualization lacks structured multi-layer support. A refined system with automatic H3 indexing will provide:
- Automatic spatial context via H3 cell aggregation (feature count per cell)
- Clean layer hierarchy: H3 index layer → target layer → configurable basemap
- Simple API for rapid map creation from GeoJSON/GeoDataFrame

## What Changes
- **Input support**: GeoJSON (FeatureCollection), GeoDataFrame
- **Auto H3 indexing**: SRAI library for H3 regionalization with feature count aggregation
- **Layer structure**: Index layer (blue, opacity=0.5) → Target layer (red, opacity=0.9) → Basemap
- **Basemap config**: Mapbox streets-v12, outdoor-v12 with extensible config
- **Auto map position**: Center on H3 cell with most features
- **Geometry auto-detection**: Point/Line/Polygon detected from GeoDataFrame

## Impact
- **Affected specs**: New capability `python-geo-visualization`
- **Affected code**: `python-geo-cli/src/geo_cli/viz/` module additions
- **New dependency**: `srai` library for H3 regionalization
- **Breaking changes**: None - additive only
