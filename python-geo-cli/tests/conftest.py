"""Pytest configuration and fixtures."""

import warnings
import pytest
import tempfile
import shutil
from pathlib import Path
import geopandas as gpd
from shapely.geometry import Point

# Filter internal pyproj deprecation warning that we cannot fix
warnings.filterwarnings(
    "ignore",
    message="Conversion of an array with ndim > 0 to a scalar is deprecated",
    category=DeprecationWarning
)


@pytest.fixture
def temp_dir():
    """Create a temporary directory for tests."""
    temp_path = tempfile.mkdtemp()
    yield Path(temp_path)
    shutil.rmtree(temp_path)


@pytest.fixture
def sample_geoparquet_file(temp_dir):
    """Create a sample GeoParquet file for testing."""
    # Create sample GeoDataFrame
    gdf = gpd.GeoDataFrame(
        {
            'id': [1, 2, 3],
            'name': ['Point A', 'Point B', 'Point C'],
            'value': [10, 20, 30],
            'category': ['residential', 'commercial', 'park']
        },
        geometry=[Point(0, 0), Point(0.01, 0.01), Point(0.02, 0.02)],
        crs='EPSG:4326'
    )

    file_path = temp_dir / "sample.geoparquet"
    gdf.to_parquet(file_path)
    return file_path


@pytest.fixture
def sample_bbox():
    """Sample bounding box for testing."""
    return (-0.1, 51.45, -0.05, 51.55)


@pytest.fixture
def sample_osm_tags():
    """Sample OSM tags for testing."""
    return {"building": ["residential"], "highway": ["primary"]}