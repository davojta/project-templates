# Project: python-geo-cli

Python geospatial CLI template using SedonaDB, QuackOSM, KeplerGL, and GeoParquet.

## Tech Stack

- **Runtime**: Python 3.12+
- **Package Manager**: uv
- **CLI Framework**: Click
- **Spatial Processing**: SedonaDB (5-40x faster than GeoPandas)
- **OSM Data**: QuackOSM (cached, multithreaded downloads)
- **Visualization**: KeplerGL + H3 spatial indexing
- **Format**: GeoParquet
- **Validation**: Pydantic

## Setup

```bash
uv sync --group dev --extra viz --extra notebooks

cp example.env .env
# Add MAPBOX_ACCESS_TOKEN to .env
```

## Commands

```bash
make run-main             # Show CLI help
make test                 # Unit tests
make test-coverage        # Unit tests with coverage
make run-integration-tests  # Integration tests
make run-e2e-tests        # E2E tests
make run-lint             # Lint with ruff
make run-format           # Format with ruff
make all-checks           # Lint + format check
make dev-setup            # Full development setup
```

Direct uv commands:

```bash
# Download OSM data
uv run geo-cli download region \
  --bbox "24.925240,60.166280,24.958358,60.178755" \
  --tags "building:residential" \
  --name "helsinki_buildings"

# Spatial processing (buffer, spatial-join, reproject)
uv run geo-cli process spatial \
  --input data/processed/helsinki_buildings.geoparquet \
  --operation buffer --distance 500 --name "buffered"

# Create interactive map (saved to output-map/)
uv run geo-cli viz map \
  --input data/processed/buffered.geoparquet \
  --output map.html

# Dataset info
uv run geo-cli process info --input data/processed/file.geoparquet
```

## Project Structure

```
python-geo-cli/
├── src/geo_cli/
│   ├── cli/               # CLI commands (main, download, process, visualize)
│   ├── core/              # downloader.py, processor.py, spatial_ops.py
│   ├── viz/               # renderer.py, indexer.py (H3), basemaps.py
│   ├── models/            # Pydantic config models
│   └── utils/             # logging.py, validation.py
├── data/
│   ├── raw/               # Raw OSM .pbf files
│   ├── processed/         # GeoParquet output
│   └── cache/             # QuackOSM cache
├── output-map/            # Generated HTML maps
├── tests/                 # Unit tests
├── integration-tests/
├── e2e-tests/
├── notebooks/             # Jupyter notebooks
├── example.env
├── pyproject.toml
└── Makefile
```

## Environment Variables

```bash
MAPBOX_ACCESS_TOKEN=your_token     # Required for enhanced basemaps
GEO_CLI_CACHE_DIR=./data/cache     # OSM download cache directory
GEO_CLI_LOG_LEVEL=INFO             # DEBUG|INFO|WARNING|ERROR
GEO_CLI_MAX_MEMORY_GB=8            # SedonaDB memory limit
```

## Validation

```bash
# After each non-trivial edit
make test && make run-lint

# Full validation
make run-integration-tests && make run-e2e-tests

# Before committing
make all-checks
```

## Performance Notes

- Keep operations in SedonaDB rather than converting to Pandas
- Use GeoParquet (columnar) for better compression and query performance
- For large datasets, set `SEDONA_MEMORY` env var: `export SEDONA_MEMORY="8g"`
- Visualization extras required for H3 indexing: `uv sync --extra viz`
