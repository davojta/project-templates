## 1. Dependencies
- [ ] 1.1 Add `srai` to pyproject.toml dependencies

## 2. File Structure
- [ ] 2.1 Create `src/geo_cli/viz/indexer.py` for H3 index generation
- [ ] 2.2 Create `src/geo_cli/viz/basemaps.py` for basemap configurations
- [ ] 2.3 Create `src/geo_cli/viz/renderer.py` for KeplerGL config + HTML output
- [ ] 2.4 Update `src/geo_cli/viz/__init__.py` to export `create_map()`

## 3. Data Loading (renderer.py)
- [ ] 3.1 Implement `load_data()` supporting GeoJSON file path and GeoDataFrame
- [ ] 3.2 Add CRS transformation to EPSG:4326
- [ ] 3.3 Add geometry type auto-detection (Point/Line/Polygon)

## 4. H3 Indexing (indexer.py)
- [ ] 4.1 Implement `create_h3_index()` using SRAI H3Regionalizer (resolution=9)
- [ ] 4.2 Implement feature count aggregation per H3 cell
- [ ] 4.3 Implement count normalization (0-1 scale)
- [ ] 4.4 Return index GeoDataFrame with `feature_count` and `normalized_count` columns

## 5. Basemap Config (basemaps.py)
- [ ] 5.1 Define BASEMAPS dict with "streets" and "outdoor" options
- [ ] 5.2 Implement `get_basemap_style()` helper

## 6. Map Rendering (renderer.py)
- [ ] 6.1 Implement target layer config (red, opacity=0.9)
- [ ] 6.2 Implement index layer config (blue, opacity=0.5)
- [ ] 6.3 Implement map position calculation (center on max-count H3 cell)
- [ ] 6.4 Implement `create_map()` combining all layers into KeplerGL config
- [ ] 6.5 Implement HTML export using existing kepler_maps.py

## 7. Testing
- [ ] 7.1 Add unit test for GeoJSON loading
- [ ] 7.2 Add unit test for H3 index generation
- [ ] 7.3 Add integration test using `data/example/export.geojson`

## 8. Documentation
- [ ] 8.1 Add docstrings to public functions
- [ ] 8.2 Update README.md with new visualization API example
