# Python Geospatial CLI Template

A modern Python CLI template for geospatial analysis using the 2025 geospatial stack: **SedonaDB**, **QuackOSM**, **KeplerGL**, **Click**, and **GeoParquet**.

## 🚀 Features

- **High Performance**: SedonaDB provides 5-40x faster spatial operations than GeoPandas
- **Modern Stack**: Uses 2025 best practices (UV, Click, GeoParquet)
- **OSM Integration**: QuackOSM for cached, multithreaded OSM data downloads
- **Interactive Visualization**: KeplerGL for beautiful web-based maps
- **Production Ready**: Comprehensive testing, logging, and error handling
- **Developer Friendly**: Rich terminal output, type hints, and comprehensive documentation

## 📋 Requirements

- Python 3.12+
- UV package manager
- 8GB+ RAM recommended for large spatial datasets

## 🛠️ Quick Start

### Installation

```bash
# Clone and set up
git clone <template-url>
cd python-geo-cli

# Install dependencies with UV
uv sync

# Install development dependencies
uv sync --group dev --group notebooks --group viz

# Set up environment variables (optional but recommended)
cp example.env .env
# Edit .env and add your Mapbox access token
```

### Basic Usage

```bash
# Show help
make run-main

# Download OSM data for Helsinki buildings
uv run geo-cli download region \
  --bbox "24.925240,60.166280,24.958358,60.178755" \
  --tags "building:residential" \
  --name "helsinki_buildings"

# Process spatial data (buffer operation)
uv run geo-cli process spatial \
  --input data/processed/helsinki_buildings.geoparquet \
  --operation buffer \
  --distance 500 \
  --name "helsinki_buildings_buffered"

# Create interactive visualization (saved to output-map/)
uv run geo-cli viz map \
  --input data/processed/helsinki_buildings_buffered.geoparquet \
  --output helsinki_buildings_map.html

# Get information about a dataset
uv run geo-cli process info --input data/processed/helsinki_buildings.geoparquet
```

## 📁 Project Structure

```
python-geo-cli/
├── src/geo_cli/                    # Main package
│   ├── cli/                        # CLI commands
│   │   ├── main.py                 # Main CLI entry point
│   │   ├── download.py             # OSM data download commands
│   │   ├── process.py              # Spatial processing commands
│   │   └── visualize.py            # Visualization commands
│   ├── core/                       # Core spatial processing
│   │   ├── downloader.py           # QuackOSM wrapper
│   │   ├── processor.py            # SedonaDB operations
│   │   └── spatial_ops.py          # Spatial analysis functions
│   ├── viz/                        # Visualization components
│   │   ├── renderer.py             # KeplerGL map renderer
│   │   ├── indexer.py              # H3 spatial indexing
│   │   └── basemaps.py             # Mapbox basemap config
│   ├── models/                     # Data models
│   │   └── config.py               # Pydantic configuration models
│   └── utils/                      # Utility functions
│       ├── logging.py              # Spatial-aware logging
│       └── validation.py           # Input validation
├── data/                           # Data directories
│   ├── raw/                        # Raw OSM .pbf files
│   ├── processed/                  # GeoParquet files
│   └── cache/                      # QuackOSM cache
├── output-map/                     # Generated HTML maps
├── example.env                     # Environment variables template
├── .env                            # Your local environment variables
├── tests/                          # Unit tests
├── integration-tests/              # Integration tests
├── e2e-tests/                      # End-to-end tests
└── notebooks/                      # Development notebooks
```

## 🌍 Downloading OSM Data

### Region Downloads

Download data for specific bounding boxes:

```bash
# Download all data in a bounding box
uv run geo-cli download region \
  --bbox "min_lon,min_lat,max_lon,max_lat" \
  --name "region_data"

# Download with OSM tag filtering
uv run geo-cli download region \
  --bbox "24.925240,60.166280,24.958358,60.178755" \
  --tags "building:residential,highway:primary" \
  --name "filtered_data"
```

### Common OSM Tag Examples

- Buildings: `building:residential,building:commercial`
- Roads: `highway:primary,highway:secondary`
- Amenities: `amenity:school,amenity:hospital`
- Land Use: `landuse:residential,landuse:commercial`

## 🔧 Spatial Processing

### Buffer Operations

```bash
# Create 500m buffer around features
uv run geo-cli process spatial \
  --input data/boundaries.geoparquet \
  --operation buffer \
  --distance 500 \
  --distance_unit meters \
  --name "buffered_zones"
```

### Spatial Joins

```bash
# Find points within polygons
uv run geo-cli process spatial \
  --input data/points.geoparquet \
  --operation spatial-join \
  --other data/zones.geoparquet \
  --predicate ST_Intersects \
  --name "points_in_zones"
```

### Reprojection

```bash
# Reproject to Web Mercator
uv run geo-cli process reproject \
  --input data/geographic.geoparquet \
  --crs "EPSG:3857" \
  --name "projected_data"
```

## 🗺️ Visualizations

### Interactive Maps

```bash
# Basic map (saved to output-map/interactive_map.html)
uv run geo-cli viz map \
  --input data/processed/results.geoparquet \
  --output interactive_map.html

# Map with color coding (saved to output-map/styled_map.html)
uv run geo-cli viz map \
  --input data/processed/results.geoparquet \
  --color "#FF6B6B" \
  --label-field "name" \
  --output styled_map.html
```

### Custom Configuration

Generate and customize KeplerGL configurations:

```bash
# Generate dark theme config
uv run geo-cli viz config \
  --output kepler_dark.json \
  --style dark

# Use custom config (saved to output-map/themed_map.html)
uv run geo-cli viz map \
  --input data/results.geoparquet \
  --config kepler_dark.json \
  --output themed_map.html
```

## 🧪 Development

### Running Tests

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run integration tests
make run-integration-tests

# Run end-to-end tests
make run-e2e-tests
```

### Code Quality

```bash
# Lint code
make run-lint

# Format code
make run-format

# Run all checks
make all-checks
```

### Development Setup

```bash
# Complete development setup
make dev-setup

# Start development with hot reload
uv run python -m geo_cli.cli.main --help
```

## 📚 Examples

### Jupyter Notebooks

Example notebooks are available in the `notebooks/` directory:

- `01_data_download.ipynb` - OSM data downloading examples
- `02_spatial_analysis.ipynb` - Spatial operations and analysis
- `03_visualization.ipynb` - Creating custom visualizations

### Complete Workflow Example

```python
from geo_cli.core.downloader import OSMDownloader
from geo_cli.core.processor import SedonaProcessor
from geo_cli.viz import create_map

# Download data
downloader = OSMDownloader()
bbox = (24.925240, 60.166280, 24.958358, 60.178755)
data_path = downloader.download_region(
    bbox=bbox,
    tags={"building": ["residential"]}
)

# Process with spatial operations
processor = SedonaProcessor()
processor.load_geoparquet(data_path, "buildings")

# Create buffer zones
buffered = processor.buffer("buildings", distance=500)
processor.to_geoparquet("buffered", "buildings_buffered.geoparquet")

# Create visualization with H3 index layer
create_map(
    source="buildings_buffered.geoparquet",
    output_path="output-map/buildings_map.html",
    basemap="streets",
    h3_resolution=9
)
```

### Multi-Layer Visualization with H3 Indexing

Create maps with automatic H3 spatial indexing for feature density context:

```python
from geo_cli.viz import create_map

# Create map with H3 index layer (blue) and target features (red)
create_map(
    source="data/example/export.geojson",  # or GeoDataFrame
    output_path="output-map/indexed_map.html",
    basemap="streets",  # or "outdoor"
    h3_resolution=9,    # ~174m cell edge
    title="Buildings with H3 Index"
)
```

This creates a two-layer visualization:
- **Index Layer** (blue, 50% opacity): H3 hexagonal cells colored by feature count
- **Target Layer** (red, 90% opacity): Original features
- **Auto-centering**: Map centers on the H3 cell with most features

### KeplerGL Layer Config Reference

When customizing layer styles, use this config structure:

```python
layer_config = {
    "id": "my_layer",              # Unique layer ID
    "type": "geojson",             # Layer type: geojson, point, arc, hexagon

    "config": {
        # Data Binding
        "dataId": "my_data",       # Must match key in data={...} dict
        "label": "My Layer",       # Display name in layer panel
        "columns": {"geojson": "_geojson"},  # Geometry column mapping

        # Base Colors
        "color": [255, 0, 0],              # Fill color RGB
        "highlightColor": [200, 0, 0, 230], # Hover color RGBA

        # Visibility
        "isVisible": True,         # Layer visible on map
        "hidden": False,           # Hidden from layer panel

        # Visual Properties
        "visConfig": {
            "opacity": 0.8,            # Fill opacity (0-1)
            "strokeOpacity": 0.8,      # Stroke opacity
            "thickness": 0.5,          # Stroke width in pixels
            "strokeColor": [200, 0, 0], # Stroke color RGB
            "stroked": True,           # Enable stroke
            "filled": True,            # Enable fill

            # Color palette for data-driven styling
            "colorRange": {
                "name": "Global Warming",
                "type": "sequential",
                "category": "Uber",
                "colors": ["#5A1846", "#900C3F", "#C70039", "#E3611C", "#F1920E", "#FFC300"],
            },

            # Point-specific
            "radius": 10,
            "radiusRange": [0, 50],

            # 3D options
            "enable3d": False,
            "heightRange": [0, 500],
            "elevationScale": 5,
        },

        # Text Labels
        "textLabel": [{
            "field": None,            # Property to display
            "color": [255, 255, 255],
            "size": 18,
        }],
    },

    # Data-Driven Styling
    "visualChannels": {
        "colorField": {"name": "count", "type": "integer"},  # Property for fill color
        "colorScale": "quantile",     # Scale: quantile, quantize, linear
        "strokeColorField": None,
        "sizeField": None,
    },
}
```

**Key Points:**
| Field | Purpose |
|-------|---------|
| `dataId` | Links layer to dataset - must match data dict key |
| `color` | Base fill color when `colorField` is None |
| `visConfig.filled` | Must be `True` to see fill |
| `visConfig.stroked` | Must be `True` to see borders |
| `visualChannels.colorField` | Set to property name for data-driven colors |

**Important:** Pass data as GeoJSON dict (not GeoDataFrame) for config to apply:
```python
import json
geojson_data = json.loads(gdf.to_json())
KeplerGl(data={"my_data": geojson_data}, config=config)
```

## 🎯 Performance Tips

### Large Dataset Processing

1. **Use SedonaDB**: Keep operations in SedonaDB rather than converting to Pandas
2. **GeoParquet Format**: Use columnar GeoParquet for better compression and query performance
3. **Spatial Indexing**: Let SedonaDB handle spatial indexing automatically
4. **Batch Processing**: Process large datasets in chunks to manage memory

### Memory Management

```bash
# Set memory limit for large operations
export SEDONA_MEMORY="8g"
uv run geo-cli process spatial --input huge_dataset.geoparquet ...
```

### Caching

```bash
# Clear OSM download cache
uv run python -c "
from geo_cli.core.downloader import OSMDownloader
downloader = OSMDownloader()
downloader.clear_cache()
"

# Check cache usage
uv run python -c "
from geo_cli.core.downloader import OSMDownloader
downloader = OSMDownloader()
print(downloader.get_cache_info())
"
```

## 🔧 Configuration

The CLI uses Pydantic models for configuration. You can customize behavior through:

- Environment variables (via .env file)
- Configuration files
- Command-line parameters

### Environment Setup

Copy `example.env` to `.env` and configure your settings:

```bash
cp example.env .env
```

Key environment variables:

```bash
# Mapbox Access Token for enhanced basemaps (recommended)
MAPBOX_ACCESS_TOKEN=your_token_here

# Cache directory for OSM data
GEO_CLI_CACHE_DIR=./data/cache

# Log level (DEBUG, INFO, WARNING, ERROR)
GEO_CLI_LOG_LEVEL=INFO

# Memory limit for SedonaDB in GB
GEO_CLI_MAX_MEMORY_GB=8
```

### Getting a Mapbox Token

1. Sign up at [Mapbox](https://mapbox.com/)
2. Create an account and navigate to your Account page
3. Find your "Default public token" or create a new one
4. Add it to your `.env` file as `MAPBOX_ACCESS_TOKEN`

## 🐛 Troubleshooting

### Common Issues

1. **Memory Errors**: Increase available memory or use smaller datasets
2. **Download Failures**: Check network connection and OSM API availability
3. **Visualization Issues**: Ensure data is in EPSG:4326 projection
4. **Performance**: Use SedonaDB operations instead of GeoPandas when possible

### Debug Mode

```bash
# Enable debug logging
export GEO_CLI_LOG_LEVEL="DEBUG"
uv run geo-cli --help
```

### Getting Help

```bash
# General help
uv run geo-cli --help

# Command-specific help
uv run geo-cli download --help
uv run geo-cli process --help
uv run geo-cli viz --help
```

## 📄 License

This template is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 🔗 Resources

- [SedonaDB Documentation](https://sedona.apache.org/)
- [QuackOSM Documentation](https://kraina-ai.github.io/quackosm/)
- [Click Documentation](https://click.palletsprojects.com/)
- [KeplerGL Documentation](https://kepler.gl/)
- [UV Package Manager](https://github.com/astral-sh/uv)
- [GeoParquet Specification](https://geoparquet.org/)