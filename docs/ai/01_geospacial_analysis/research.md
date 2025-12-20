# Research: Python CLI Template for Geospatial Analysis

## Problem / Question

How to create a simple, production-ready Python CLI template with built-in geospatial analysis capabilities using the modern 2025 geospatial stack (SedonaDB, QuackOSM, KeplerGL, Click).

## Current Stack Analysis

Based on `osm-geo-stack.md`, the modern geospatial processing stack for 2025:

### Core Technologies
- **CLI Framework**: Click (replaced Typer)
- **Package Manager**: UV (replaced Poetry)
- **Spatial Engine**: SedonaDB (5-40x faster than GeoPandas)
- **OSM Processing**: QuackOSM (caching, multithreaded)
- **Data Format**: GeoParquet (cloud-friendly, columnar)
- **Visualization**: KeplerGL (web-based interactive maps)
- **Storage**: Local storage (no cloud dependencies)

### Project Structure
```
osm-geo-processor/
├── pyproject.toml                 # All configuration, dependencies
├── uv.lock                        # Locked versions (auto-generated)
├── src/osm_geo_processor/         # Main package (src layout)
│   ├── __init__.py
│   ├── cli/
│   │   ├── main.py                # Main CLI app (Click app)
│   │   ├── download.py            # Download commands
│   │   ├── process.py             # Processing commands
│   │   └── visualize.py           # Visualization commands
│   │
│   ├── core/
│   │   ├── downloader.py          # QuackOSM wrapper
│   │   ├── processor.py           # SedonaDB operations
│   │   └── spatial_ops.py         # Spatial analysis functions
│   │
│   ├── viz/
│   │   └── kepler_maps.py         # KeplerGL visualizations
│   │
│   ├── models/
│   │   └── config.py              # Pydantic config models
│   │
│   └── utils/
│       ├── logging.py             # Logging setup
│       └── validation.py          # Input validation
│
├── data/                          # Local data directory
│   ├── raw/                       # Raw OSM .pbf files
│   ├── processed/                 # GeoParquet files
│   └── cache/                     # QuackOSM cache
│
├── tests/
└── notebooks/                     # Development notebooks
```

## Technical Implementation

### 1. Core Dependencies (pyproject.toml)

```toml
[project]
name = "osm-geo-processor"
version = "0.1.0"
description = "Geospatial OSM processing with SedonaDB and QuackOSM"
requires-python = ">=3.11"
dependencies = [
    # Core CLI framework
    "click>=8.1.0",
    "pydantic>=2.0.0",
    "rich>=13.7.0",

    # Primary spatial engine
    "sedonadb>=1.8.0",

    # OSM data fetching
    "quackosm>=0.2.0",

    # Spatial data operations
    "geopandas>=1.0.0",
    "pyogrio>=0.10.0",
    "shapely>=2.0.0",

    # Data format handling
    "pyarrow>=16.0.0",
    "pandas>=2.0.0",
]

[project.optional-dependencies]
viz = [
    "keplergl>=0.3.0",  # Web-based geospatial visualization
    "matplotlib>=3.8.0",
]
notebooks = [
    "jupyter>=1.0.0",
    "jupyterlab>=4.1.0",
    "ipywidgets>=8.1.0",
]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "pytest-cov>=5.0.0",
    "pytest-mock>=3.10.0",
    "ruff>=0.4.0",
    "pyright>=1.1.0",
]

[project.scripts]
osm-geo-cli = "osm_geo_processor.cli:main"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.pyright]
include = ["src"]
typeCheckingMode = "strict"
```

### 2. Main CLI Entry Point

```python
# src/osm_geo_processor/cli/main.py
import click
from rich.console import Console
from . import download, process, visualize

console = Console()
app = click.Group(help="Geospatial OSM processing CLI")

# Add command groups
app.add_command(download.app, name="download")
app.add_command(process.app, name="process")
app.add_command(visualize.app, name="viz")

@app.command()
def version():
    """Show version information."""
    click.echo("osm-geo-processor version 0.1.0")

def main():
    """Main entry point for the CLI application."""
    app()
```

### 3. Download Command Module

```python
# src/osm_geo_processor/cli/download.py
import click
from pathlib import Path
from rich.console import Console
from ..core.downloader import OSMDownloader

console = Console()
app = click.Group(help="Download OSM data")

@app.command()
@click.option("--bbox", required=True, help="Bounding box: min_lon,min_lat,max_lon,max_lat")
@click.option("--tags", help="OSM tags filter: key:value,key:value")
@click.option("--output", type=click.Path(), default="data/processed", help="Output directory")
@click.option("--name", default="osm_data", help="Output filename (without extension)")
def region(bbox: str, tags: str, output: str, name: str):
    """Download OSM data for a region."""
    # Parse bbox
    try:
        bbox_tuple = tuple(map(float, bbox.split(",")))
        if len(bbox_tuple) != 4:
            raise ValueError
    except (ValueError, AttributeError):
        console.print("[red]Invalid bbox format. Use: min_lon,min_lat,max_lon,max_lat[/red]")
        raise click.Abort()

    # Parse tags
    tags_dict = None
    if tags:
        tags_dict = {}
        for pair in tags.split(","):
            key, value = pair.split(":")
            if key not in tags_dict:
                tags_dict[key] = []
            tags_dict[key].append(value)

    output_path = Path(output)
    output_path.mkdir(parents=True, exist_ok=True)
    final_path = output_path / f"{name}.geoparquet"

    # Download
    with console.status("[bold green]Downloading OSM data...", spinner="dots"):
        downloader = OSMDownloader()
        result_path = downloader.download_region(
            bbox=bbox_tuple,
            tags=tags_dict,
            output_path=final_path
        )

    console.print(f"[green]✓[/green] Downloaded to {result_path}")
```

### 4. Core Processing Module

```python
# src/osm_geo_processor/core/processor.py
from pathlib import Path
import sedona.db
import logging

logger = logging.getLogger(__name__)

class SedonaProcessor:
    def __init__(self):
        self.sedona = sedona.db.connect()

    def load_geoparquet(self, parquet_path: Path | str, table_name: str):
        """Load GeoParquet into SedonaDB."""
        df = self.sedona.sql(f"SELECT * FROM '{parquet_path}'")
        df.to_view(table_name)
        logger.info(f"Loaded {parquet_path} as table '{table_name}'")

    def spatial_join(self, left_table: str, right_table: str, predicate: str = "ST_Intersects"):
        """Perform spatial join."""
        query = f"""
        SELECT l.*, r.*
        FROM {left_table} l
        JOIN {right_table} r
        ON {predicate}(l.geometry, r.geometry)
        """
        return self.sedona.sql(query)

    def to_geoparquet(self, table_name: str, output_path: Path | str):
        """Export SedonaDB table to GeoParquet."""
        df = self.sedona.sql(f"SELECT * FROM {table_name}")
        df.to_parquet(str(output_path))
        logger.info(f"Exported {table_name} to {output_path}")
```

### 5. Visualization Module

```python
# src/osm_geo_processor/viz/kepler_maps.py
import geopandas as gpd
from pathlib import Path
import json

class KeplerVisualizer:
    """KeplerGL visualization for geospatial data."""

    def __init__(self):
        self.config = {
            'version': 'v1',
            'config': {
                'visState': {
                    'layers': [],
                    'mapState': {
                        'latitude': 0,
                        'longitude': 0,
                        'zoom': 1
                    },
                    'mapStyle': {
                        'styleType': 'light'
                    }
                }
            }
        }

    def create_visualization(self, data_path: Path, label_field: str = "name"):
        """Create KeplerGL configuration."""
        gdf = gpd.read_file(data_path)

        # Ensure coordinates are in WGS84 for KeplerGL
        if gdf.crs != 'EPSG:4326':
            gdf = gdf.to_crs('EPSG:4326')

        # Convert to GeoJSON
        geojson = json.loads(gdf.to_json())

        # Calculate center
        bounds = gdf.total_bounds
        center_lat = (bounds[1] + bounds[3]) / 2
        center_lon = (bounds[0] + bounds[2]) / 2

        # Update config
        self.config['config']['visState']['mapState'].update({
            'latitude': center_lat,
            'longitude': center_lon,
            'zoom': 10
        })

        return {
            'data': [{
                'id': 'data',
                'allData': geojson['features'],
            }],
            'config': self.config
        }
```

## Usage Examples

### Quick Start
```bash
# Setup with UV
uv init osm-geo-processor
cd osm-geo-processor
uv sync

# Download buildings in London
uv run osm-geo-cli download \
  --bbox "-0.1,51.45,-0.05,51.55" \
  --tags "building:residential" \
  --name "london_buildings"

# Process spatial analysis
uv run osm-geo-cli process \
  --input data/processed/london_buildings.geoparquet \
  --operation spatial-join \
  --other data/processed/roads.geoparquet

# Visualize results
uv run osm-geo-cli viz map \
  --input data/processed/result.geoparquet \
  --output buildings_map.html
```

### Notebook Integration
```python
# notebooks/analysis.ipynb
from osm_geo_processor.core import OSMDownloader, SedonaProcessor
from osm_geo_processor.viz import KeplerVisualizer
import geopandas as gpd

# Download data
downloader = OSMDownloader()
path = downloader.download_region(
    bbox=(-0.05, 51.45, -0.03, 51.47),
    tags={"building": ["residential"]}
)

# Process with SedonaDB
processor = SedonaProcessor()
processor.load_geoparquet(path, "buildings")
result = processor.spatial_join("buildings", "roads")

# Export and visualize
processor.to_geoparquet("result", "data/processed/result.geoparquet")
visualizer = KeplerVisualizer()
viz_data = visualizer.create_visualization("data/processed/result.geoparquet")
```

## Implementation Benefits

### ✅ Advantages of This Approach

1. **Simplicity**: No plugin system complexity - just a well-structured CLI
2. **Performance**: SedonaDB provides 5-40x faster spatial operations
3. **Modern Stack**: Uses 2025 best practices (UV, Click, GeoParquet)
4. **Local First**: No cloud dependencies, works offline
5. **Extensible**: Easy to add new commands by creating new modules in `cli/`
6. **Type Safety**: Pydantic models for configuration, proper type hints
7. **Rich Output**: Beautiful terminal output with Rich
8. **Notebook Ready**: Works seamlessly with Jupyter

### ⚠️ Considerations

1. **Dependencies**: Requires spatial libraries (SedonaDB, QuackOSM)
2. **Learning Curve**: Need to understand modern geospatial stack
3. **File Size**: GeoParquet files can be large
4. **Memory Usage**: SedonaDB requires sufficient RAM for large datasets

## Next Steps for Implementation

- [ ] Set up base CLI structure with Click
- [ ] Integrate QuackOSM for OSM data downloading
- [ ] Add SedonaDB spatial processing capabilities
- [ ] Implement KeplerGL visualization
- [ ] Add comprehensive error handling and validation
- [ ] Create test suite with sample geospatial data
- [ ] Add documentation and usage examples
- [ ] Optimize for performance with large datasets
- [ ] Add Docker support for easy deployment

## Dependencies and Versions

- Python: >=3.11
- Click: >=8.1.0
- SedonaDB: >=1.8.0
- QuackOSM: >=0.2.0
- GeoPandas: >=1.0.0
- KeplerGL: >=0.3.0
- PyArrow: >=16.0.0
- UV: latest

## Performance Tips

1. **Use SedonaDB SQL**: Keep operations in SedonaDB rather than converting to Pandas
2. **GeoParquet Format**: Use columnar GeoParquet for better compression and query performance
3. **Spatial Indexing**: Let SedonaDB handle spatial indexing automatically
4. **Batch Processing**: Process large datasets in chunks to manage memory

## References

- [SedonaDB Documentation](https://sedona.apache.org/sedonadb/)
- [QuackOSM Documentation](https://kraina-ai.github.io/quackosm/)
- [Click Documentation](https://click.palletsprojects.com/)
- [KeplerGL Documentation](https://kepler.gl/)
- [UV Package Manager](https://github.com/astral-sh/uv)
- [GeoParquet Specification](https://geoparquet.org/)