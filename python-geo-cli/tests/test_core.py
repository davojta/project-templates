"""Tests for core spatial processing functionality."""

import pytest
import tempfile
import numpy as np
from pathlib import Path

from geo_cli.core.downloader import OSMDownloader
from geo_cli.core.processor import SedonaProcessor
from geo_cli.core.spatial_ops import SpatialOperations


class TestOSMDownloader:
    """Test OSM data downloader."""

    def test_downloader_initialization(self):
        """Test downloader initialization."""
        with tempfile.TemporaryDirectory() as temp_dir:
            downloader = OSMDownloader(cache_dir=temp_dir)
            assert downloader.cache_dir.exists()

    def test_download_region_basic(self):
        """Test basic region download."""
        with tempfile.TemporaryDirectory() as temp_dir:
            downloader = OSMDownloader(cache_dir=temp_dir)
            bbox = (-0.1, 51.45, -0.05, 51.55)

            output_path = downloader.download_region(bbox=bbox)
            assert output_path.exists()
            assert output_path.suffix == '.geoparquet'

    def test_download_region_with_tags(self):
        """Test region download with OSM tags."""
        with tempfile.TemporaryDirectory() as temp_dir:
            downloader = OSMDownloader(cache_dir=temp_dir)
            bbox = (-0.1, 51.45, -0.05, 51.55)
            tags = {"building": ["residential"]}

            output_path = downloader.download_region(bbox=bbox, tags=tags)
            assert output_path.exists()

    def test_cache_key_generation(self):
        """Test cache key generation."""
        downloader = OSMDownloader()
        bbox = (-0.1, 51.45, -0.05, 51.55)
        tags = {"building": ["residential"]}

        key1 = downloader._generate_cache_key(bbox, tags)
        key2 = downloader._generate_cache_key(bbox, tags)
        assert key1 == key2  # Should be consistent

        # Different parameters should generate different keys
        key3 = downloader._generate_cache_key((-0.1, 51.45, -0.05, 51.56), tags)
        assert key1 != key3

    def test_cache_info(self):
        """Test cache info functionality."""
        with tempfile.TemporaryDirectory() as temp_dir:
            downloader = OSMDownloader(cache_dir=temp_dir)
            info = downloader.get_cache_info()
            assert 'num_files' in info
            assert 'total_size_mb' in info
            assert 'cache_dir' in info

    def test_clear_cache(self):
        """Test cache clearing."""
        with tempfile.TemporaryDirectory() as temp_dir:
            downloader = OSMDownloader(cache_dir=temp_dir)
            bbox = (-0.1, 51.45, -0.05, 51.55)

            # Download something to create cache
            downloader.download_region(bbox=bbox)

            # Clear cache
            downloader.clear_cache()
            info = downloader.get_cache_info()
            assert info['num_files'] == 0


class TestSedonaProcessor:
    """Test SedonaDB processor."""

    def test_processor_initialization(self):
        """Test processor initialization."""
        processor = SedonaProcessor()
        # Processor should initialize without errors
        assert processor is not None

    def test_load_geoparquet(self):
        """Test loading GeoParquet data."""
        processor = SedonaProcessor()

        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test data
            test_file = Path(temp_dir) / "test.geoparquet"
            self._create_test_data(test_file)

            # Load the data
            processor.load_geoparquet(test_file, "test_table")

            # Check table info
            info = processor.get_table_info("test_table")
            assert info['num_features'] > 0
            assert 'columns' in info

    def test_spatial_join(self):
        """Test spatial join operation."""
        processor = SedonaProcessor()

        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test data
            file1 = Path(temp_dir) / "data1.geoparquet"
            file2 = Path(temp_dir) / "data2.geoparquet"
            self._create_test_data(file1)
            self._create_test_data(file2, offset=0.01)

            # Load data
            processor.load_geoparquet(file1, "table1")
            processor.load_geoparquet(file2, "table2")

            # Perform spatial join
            result = processor.spatial_join("table1", "table2", "ST_Intersects")
            assert result is not None

    def test_buffer_operation(self):
        """Test buffer operation."""
        processor = SedonaProcessor()

        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test data
            test_file = Path(temp_dir) / "test.geoparquet"
            self._create_test_data(test_file)

            # Load data
            processor.load_geoparquet(test_file, "test_table")

            # Create buffer
            result = processor.buffer("test_table", distance=1000)
            assert result is not None
            assert len(result) > 0

    def test_export_geoparquet(self):
        """Test exporting to GeoParquet."""
        processor = SedonaProcessor()

        with tempfile.TemporaryDirectory() as temp_dir:
            # Create and load test data
            test_file = Path(temp_dir) / "input.geoparquet"
            output_file = Path(temp_dir) / "output.geoparquet"
            self._create_test_data(test_file)
            processor.load_geoparquet(test_file, "test_table")

            # Export data
            processor.to_geoparquet("test_table", output_file)
            assert output_file.exists()

    def _create_test_data(self, file_path: Path, offset: float = 0.0):
        """Create test GeoParquet data."""
        import geopandas as gpd
        from shapely.geometry import Point

        gdf = gpd.GeoDataFrame(
            {'id': [1, 2, 3], 'value': [10, 20, 30]},
            geometry=[Point(0 + offset, 0 + offset), Point(0.01 + offset, 0.01 + offset), Point(0.02 + offset, 0.02 + offset)],
            crs='EPSG:4326'
        )
        gdf.to_parquet(file_path)


class TestSpatialOperations:
    """Test spatial operations."""

    def test_calculate_area(self):
        """Test area calculation."""
        from shapely.geometry import Polygon

        # Create a simple square (approximately 1 degree)
        polygon = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])

        # Calculate area in square meters
        area_meters = SpatialOperations.calculate_area(polygon, "square_meters")
        assert area_meters > 0
        assert isinstance(area_meters, float)

        # Calculate area in square degrees
        area_degrees = SpatialOperations.calculate_area(polygon, "square_degrees")
        assert area_degrees == 1.0  # Exactly 1 square degree

    def test_calculate_length(self):
        """Test length calculation."""
        from shapely.geometry import LineString

        # Create a simple line
        line = LineString([(0, 0), (1, 1)])

        # Calculate length in meters
        length_meters = SpatialOperations.calculate_length(line, "meters")
        assert length_meters > 0
        assert isinstance(length_meters, float)

        # Calculate length in degrees
        length_degrees = SpatialOperations.calculate_length(line, "degrees")
        assert length_degrees == np.sqrt(2)  # Diagonal of unit square

    def test_point_in_polygon(self):
        """Test point in polygon check."""
        from shapely.geometry import Point, Polygon

        polygon = Polygon([(0, 0), (2, 0), (2, 2), (0, 2)])

        # Point inside polygon
        point_inside = Point(1, 1)
        assert SpatialOperations.point_in_polygon(point_inside, polygon) is True

        # Point outside polygon
        point_outside = Point(3, 3)
        assert SpatialOperations.point_in_polygon(point_outside, polygon) is False

        # Point on boundary
        point_boundary = Point(0, 1)
        assert SpatialOperations.point_in_polygon(point_boundary, polygon) is False  # Not within

    def test_find_nearest_features(self):
        """Test finding nearest features."""
        from shapely.geometry import Point

        # Query points
        query_points = [Point(0, 0)]

        # Features
        features = []
        for i in range(10):
            # Create a simple object with geometry
            class Feature:
                def __init__(self, geom, id):
                    self.geometry = geom
                    self.id = id

            features.append(Feature(Point(i * 0.1, i * 0.1), i))

        # Find nearest features
        results = SpatialOperations.find_nearest_features(query_points, features, max_results=3)

        assert len(results) == 1  # One query point
        assert len(results[0]['nearest_features']) <= 3  # Max 3 results
        assert results[0]['nearest_features'][0]['distance'] == 0  # First result should be distance 0

    def test_cluster_points(self):
        """Test point clustering."""
        from shapely.geometry import Point

        # Create clustered points
        points = []
        # Cluster 1 around (0, 0)
        for i in range(5):
            points.append(Point(i * 0.01, i * 0.01))

        # Cluster 2 around (1, 1)
        for i in range(5):
            points.append(Point(1 + i * 0.01, 1 + i * 0.01))

        # Perform clustering
        results = SpatialOperations.cluster_points(points, eps=0.1, min_samples=2)

        assert 'clusters' in results
        assert 'num_clusters' in results
        assert 'noise_points' in results

    def test_calculate_density(self):
        """Test density calculation."""
        from shapely.geometry import Point

        # Create features
        features = []
        for i in range(100):
            class Feature:
                def __init__(self, geom):
                    self.geometry = geom

            features.append(Feature(Point(i * 0.1, i * 0.1)))

        # Calculate density
        results = SpatialOperations.calculate_density(features)

        assert results['num_features'] == 100
        assert results['density'] > 0
        assert 'unit' in results


if __name__ == "__main__":
    pytest.main([__file__])