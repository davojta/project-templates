"""Tests for CLI commands."""

import pytest
from click.testing import CliRunner
from pathlib import Path
import tempfile
import json

from geo_cli.cli.main import app
from geo_cli.cli.download import region as download_region
from geo_cli.cli.process import spatial as process_spatial
from geo_cli.cli.visualize import map as viz_map


class TestMainCLI:
    """Test main CLI functionality."""

    def test_cli_help(self):
        """Test CLI help command."""
        runner = CliRunner()
        result = runner.invoke(app, ['--help'])
        assert result.exit_code == 0
        assert 'Geospatial CLI' in result.output

    def test_version_command(self):
        """Test version command."""
        runner = CliRunner()
        result = runner.invoke(app, ['version'])
        assert result.exit_code == 0
        assert '0.1.0' in result.output

    def test_hello_command(self):
        """Test hello command."""
        runner = CliRunner()
        result = runner.invoke(app, ['hello'])
        assert result.exit_code == 0
        assert 'geo-cli' in result.output


class TestDownloadCommands:
    """Test download commands."""

    def test_download_help(self):
        """Test download help command."""
        runner = CliRunner()
        result = runner.invoke(app, ['download', '--help'])
        assert result.exit_code == 0
        assert 'download' in result.output.lower()

    def test_download_region_invalid_bbox(self):
        """Test download region with invalid bounding box."""
        runner = CliRunner()
        result = runner.invoke(download_region, ['--bbox', 'invalid'])
        assert result.exit_code != 0

    def test_download_region_valid_bbox(self):
        """Test download region with valid bounding box."""
        with tempfile.TemporaryDirectory() as temp_dir:
            runner = CliRunner()
            bbox = "-0.1,51.45,-0.05,51.55"
            result = runner.invoke(download_region, [
                '--bbox', bbox,
                '--output', temp_dir
            ])
            # Should succeed (creates placeholder file)
            assert result.exit_code == 0

    def test_download_region_with_tags(self):
        """Test download region with OSM tags."""
        with tempfile.TemporaryDirectory() as temp_dir:
            runner = CliRunner()
            bbox = "-0.1,51.45,-0.05,51.55"
            tags = "building:residential,highway:primary"
            result = runner.invoke(download_region, [
                '--bbox', bbox,
                '--tags', tags,
                '--output', temp_dir
            ])
            assert result.exit_code == 0


class TestProcessCommands:
    """Test processing commands."""

    def test_process_help(self):
        """Test process help command."""
        runner = CliRunner()
        result = runner.invoke(app, ['process', '--help'])
        assert result.exit_code == 0
        assert 'process' in result.output.lower()

    def test_process_spatial_buffer(self):
        """Test spatial buffer operation."""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test data
            test_data = Path(temp_dir) / "test.geoparquet"
            self._create_test_geoparquet(test_data)

            runner = CliRunner()
            result = runner.invoke(process_spatial, [
                '--input', str(test_data),
                '--operation', 'buffer',
                '--distance', '1000',
                '--output', temp_dir
            ])
            assert result.exit_code == 0

    def test_process_spatial_invalid_operation(self):
        """Test spatial operation with invalid operation."""
        runner = CliRunner()
        result = runner.invoke(process_spatial, [
            '--input', 'nonexistent.geoparquet',
            '--operation', 'invalid'
        ])
        assert result.exit_code != 0

    def test_reproject_command(self):
        """Test reproject command."""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test data
            test_data = Path(temp_dir) / "test.geoparquet"
            self._create_test_geoparquet(test_data)

            runner = CliRunner()
            result = runner.invoke(app, ['process', 'reproject',
                '--input', str(test_data),
                '--crs', 'EPSG:3857',
                '--output', temp_dir
            ])
            assert result.exit_code == 0

    def _create_test_geoparquet(self, path: Path):
        """Create test GeoParquet file."""
        import geopandas as gpd
        from shapely.geometry import Point

        gdf = gpd.GeoDataFrame(
            {'name': ['test_point'], 'value': [1]},
            geometry=[Point(0, 0)],
            crs='EPSG:4326'
        )
        gdf.to_parquet(path)


class TestVisualizationCommands:
    """Test visualization commands."""

    def test_viz_help(self):
        """Test visualization help command."""
        runner = CliRunner()
        result = runner.invoke(app, ['viz', '--help'])
        assert result.exit_code == 0
        assert 'visualization' in result.output.lower()

    def test_map_command(self):
        """Test map creation command."""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test data
            test_data = Path(temp_dir) / "test.geoparquet"
            self._create_test_geoparquet(test_data)

            output_file = Path(temp_dir) / "map.html"

            runner = CliRunner()
            result = runner.invoke(viz_map, [
                '--input', str(test_data),
                '--output', str(output_file)
            ])

            # Should succeed
            assert result.exit_code == 0
            assert output_file.exists()

    def test_config_command(self):
        """Test config generation command."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config_file = Path(temp_dir) / "config.json"

            runner = CliRunner()
            result = runner.invoke(app, ['viz', 'config',
                '--output', str(config_file),
                '--style', 'dark'
            ])

            assert result.exit_code == 0
            assert config_file.exists()

            # Validate JSON format
            with open(config_file, 'r') as f:
                config_data = json.load(f)
            assert 'config' in config_data

    def _create_test_geoparquet(self, path: Path):
        """Create test GeoParquet file."""
        import geopandas as gpd
        from shapely.geometry import Point

        gdf = gpd.GeoDataFrame(
            {'name': ['test_point'], 'value': [1]},
            geometry=[Point(0, 0)],
            crs='EPSG:4326'
        )
        gdf.to_parquet(path)


class TestCLIIntegration:
    """Integration tests for CLI commands."""

    def test_complete_workflow(self):
        """Test complete workflow: download -> process -> visualize."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Step 1: Download
            runner = CliRunner()
            bbox = "-0.1,51.45,-0.05,51.55"
            result = runner.invoke(download_region, [
                '--bbox', bbox,
                '--output', str(temp_path / "data"),
                '--name', 'test_data'
            ])
            assert result.exit_code == 0

            data_file = temp_path / "data" / "test_data.geoparquet"
            assert data_file.exists()

            # Step 2: Process (buffer)
            result = runner.invoke(process_spatial, [
                '--input', str(data_file),
                '--operation', 'buffer',
                '--distance', '1000',
                '--output', str(temp_path / "processed"),
                '--name', 'buffered_data'
            ])
            assert result.exit_code == 0

            processed_file = temp_path / "processed" / "buffered_data.geoparquet"
            assert processed_file.exists()

            # Step 3: Visualize
            viz_file = temp_path / "visualization.html"
            result = runner.invoke(viz_map, [
                '--input', str(processed_file),
                '--output', str(viz_file)
            ])
            assert result.exit_code == 0
            assert viz_file.exists()


if __name__ == "__main__":
    pytest.main([__file__])