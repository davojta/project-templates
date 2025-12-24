## 1. Dependencies
- [x] 1.1 Add `srai` to pyproject.toml dependencies

## 2. File Structure
- [x] 2.1 Create `src/geo_cli/viz/indexer.py` for H3 index generation
- [x] 2.2 Create `src/geo_cli/viz/basemaps.py` for basemap configurations
- [x] 2.3 Create `src/geo_cli/viz/renderer.py` for KeplerGL config + HTML output
- [x] 2.4 Update `src/geo_cli/viz/__init__.py` to export `create_map()`

## 3. Data Loading (renderer.py)
- [x] 3.1 Implement `load_data()` supporting GeoJSON file path and GeoDataFrame
- [x] 3.2 Add CRS transformation to EPSG:4326
- [x] 3.3 Add geometry type auto-detection (Point/Line/Polygon)

## 4. H3 Indexing (indexer.py)
- [x] 4.1 Implement `create_h3_index()` using SRAI H3Regionalizer (resolution=9)
- [x] 4.2 Implement feature count aggregation per H3 cell
- [x] 4.3 Implement count normalization (0-1 scale)
- [x] 4.4 Return index GeoDataFrame with `feature_count` and `normalized_count` columns

## 5. Basemap Config (basemaps.py)
- [x] 5.1 Define BASEMAPS dict with "streets" and "outdoor" options
- [x] 5.2 Implement `get_basemap_style()` helper

## 6. Map Rendering (renderer.py)
- [x] 6.1 Implement target layer config (red, opacity=0.9)
- [x] 6.2 Implement index layer config (blue, opacity=0.5)
- [x] 6.3 Implement map position calculation (center on max-count H3 cell)
- [x] 6.4 Implement `create_map()` combining all layers into KeplerGL config
- [x] 6.5 Implement HTML export using existing kepler_maps.py

## 7. Testing
- [x] 7.1 Add unit test for GeoJSON loading
- [x] 7.2 Add unit test for H3 index generation
- [x] 7.3 Add integration test using `data/example/export.geojson`

## 8. Documentation
- [x] 8.1 Add docstrings to public functions
- [x] 8.2 Update README.md with new visualization API example
