"""End-to-end tests for geo-cli spatial processing and visualization."""

import os
import subprocess
import sys
import tempfile
import shutil
from pathlib import Path
import time

import geopandas as gpd
import pandas as pd


class TestGeoCliE2E:
    """Test geo-cli functionality in isolated environments."""

    def setup_method(self):
        """Set up a temporary directory for isolated testing."""
        self.test_dir = tempfile.mkdtemp()
        self.original_cwd = os.getcwd()
        self.project_root = Path(__file__).parent.parent

        # Create test directory structure
        self.temp_data_dir = Path(self.test_dir) / "data"
        self.temp_output_dir = Path(self.test_dir) / "output-map"
        self.temp_data_dir.mkdir(parents=True)
        self.temp_output_dir.mkdir(parents=True)

        # Copy sample data to test directory
        sample_data = self.project_root / "data" / "processed" / "helsinki_buildings.geoparquet"
        if sample_data.exists():
            shutil.copy2(sample_data, self.temp_data_dir / "helsinki_buildings.geoparquet")

    def teardown_method(self):
        """Clean up temporary directory."""
        os.chdir(self.original_cwd)
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def run_geo_cli(self, args: list[str]) -> tuple[int, str, str]:
        """Run geo-cli command from the project root."""
        cmd = [sys.executable, "-m", "geo_cli.cli.main"] + args

        # Set up environment
        env = os.environ.copy()
        env["PYTHONPATH"] = str(self.project_root / "src") + ":" + env.get("PYTHONPATH", "")

        # Run from project root
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env=env,
            cwd=self.project_root
        )
        return result.returncode, result.stdout, result.stderr

    def test_spatial_buffer_operation_e2e(self):
        """Test complete spatial buffer operation workflow."""
        input_file = self.temp_data_dir / "helsinki_buildings.geoparquet"

        if not input_file.exists():
            # Skip test if sample data not available
            import pytest
            pytest.skip("Sample data not available")

        # Run buffer operation
        args = [
            "process", "spatial",
            "--input", str(input_file),
            "--operation", "buffer",
            "--distance", "500",
            "--name", "helsinki_buildings_buffered",
            "--output", str(self.temp_data_dir / "processed")
        ]

        exit_code, stdout, stderr = self.run_geo_cli(args)

        assert exit_code == 0, f"Command failed with stderr: {stderr}"
        assert stderr == ""

        # Check expected output messages
        assert "🔧 Processing spatial data" in stdout
        assert "Operation: buffer" in stdout
        assert "✅ Processing completed" in stdout

        # Verify output file was created
        output_file = self.temp_data_dir / "processed" / "helsinki_buildings_buffered.geoparquet"
        assert output_file.exists(), "Output file was not created"

        # Verify the output is valid GeoParquet
        try:
            gdf = gpd.read_parquet(output_file)
            assert len(gdf) > 0, "Output GeoParquet is empty"
            assert 'geometry' in gdf.columns, "Geometry column missing"
            assert gdf.crs is not None, "CRS information missing"
        except Exception as e:
            assert False, f"Failed to read output GeoParquet: {e}"

    def test_map_visualization_e2e(self):
        """Test complete map visualization workflow."""
        # First ensure we have processed data
        input_file = self.temp_data_dir / "helsinki_buildings.geoparquet"
        processed_file = self.temp_data_dir / "processed" / "helsinki_buildings_buffered.geoparquet"

        if not input_file.exists():
            import pytest
            pytest.skip("Sample data not available")

        # If buffered data doesn't exist, create it first
        if not processed_file.exists():
            (self.temp_data_dir / "processed").mkdir(exist_ok=True)
            args = [
                "process", "spatial",
                "--input", str(input_file),
                "--operation", "buffer",
                "--distance", "500",
                "--name", "helsinki_buildings_buffered",
                "--output", str(self.temp_data_dir / "processed")
            ]
            exit_code, _, _ = self.run_geo_cli(args)
            assert exit_code == 0, "Failed to create test data for visualization test"

        # Run map visualization
        output_file = self.temp_output_dir / "helsinki_buildings_map.html"
        args = [
            "viz", "map",
            "--input", str(processed_file),
            "--output", str(output_file)
        ]

        exit_code, stdout, stderr = self.run_geo_cli(args)

        assert exit_code == 0, f"Command failed with stderr: {stderr}"
        # Allow deprecation warnings from dependencies
        if stderr:
            assert "pkg_resources is deprecated" in stderr or "UserWarning" in stderr or "DeprecationWarning" in stderr, f"Unexpected stderr: {stderr}"

        # Check expected output messages
        assert "🗺️  Creating visualization" in stdout
        assert "✅ Visualization created" in stdout

        # Verify output HTML file was created in the correct location
        assert output_file.exists(), "Output HTML file was not created"

        # Verify the HTML file contains expected content
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                content = f.read()
                assert 'keplergl' in content.lower() or 'KeplerGL' in content, "HTML doesn't contain KeplerGL content"
                assert len(content) > 1000, "HTML file seems too small/empty"
        except Exception as e:
            assert False, f"Failed to read output HTML: {e}"

    def test_complete_workflow_e2e(self):
        """Test complete workflow from data processing to visualization."""
        input_file = self.temp_data_dir / "helsinki_buildings.geoparquet"

        if not input_file.exists():
            import pytest
            pytest.skip("Sample data not available")

        # Step 1: Process data with buffer
        buffer_args = [
            "process", "spatial",
            "--input", str(input_file),
            "--operation", "buffer",
            "--distance", "250",  # Use different distance to distinguish
            "--name", "helsinki_buildings_workflow_test",
            "--output", str(self.temp_data_dir / "processed")
        ]

        buffer_exit_code, buffer_stdout, buffer_stderr = self.run_geo_cli(buffer_args)
        assert buffer_exit_code == 0, f"Buffer operation failed: {buffer_stderr}"

        buffer_output = self.temp_data_dir / "processed" / "helsinki_buildings_workflow_test.geoparquet"
        assert buffer_output.exists(), "Buffer operation didn't create output file"

        # Step 2: Create visualization from processed data
        final_output = self.temp_output_dir / "workflow_test_map.html"
        viz_args = [
            "viz", "map",
            "--input", str(buffer_output),
            "--output", str(final_output)
        ]

        viz_exit_code, viz_stdout, viz_stderr = self.run_geo_cli(viz_args)
        assert viz_exit_code == 0, f"Visualization failed: {viz_stderr}"
        # Allow deprecation warnings from dependencies
        if viz_stderr:
            assert "pkg_resources is deprecated" in viz_stderr or "UserWarning" in viz_stderr or "DeprecationWarning" in viz_stderr, f"Unexpected stderr: {viz_stderr}"

        # Verify both steps completed successfully
        assert "🔧 Processing spatial data" in buffer_stdout
        assert "✅ Processing completed" in buffer_stdout
        assert "🗺️  Creating visualization" in viz_stdout
        assert "✅ Visualization created" in viz_stdout

        # Verify final output
        assert final_output.exists(), "Final visualization not created"

    def test_error_handling_e2e(self):
        """Test error handling in spatial operations."""
        # Test buffer without distance parameter
        input_file = self.temp_data_dir / "helsinki_buildings.geoparquet"

        if input_file.exists():
            args = [
                "process", "spatial",
                "--input", str(input_file),
                "--operation", "buffer"
                # Missing --distance parameter
            ]

            exit_code, stdout, stderr = self.run_geo_cli(args)
            assert exit_code != 0, "Command should have failed without distance parameter"
            assert "requires --distance parameter" in stdout or "requires --distance parameter" in stderr

    def test_performance_e2e(self):
        """Test performance of spatial operations."""
        input_file = self.temp_data_dir / "helsinki_buildings.geoparquet"

        if not input_file.exists():
            import pytest
            pytest.skip("Sample data not available")

        # Measure buffer operation time
        start_time = time.time()
        args = [
            "process", "spatial",
            "--input", str(input_file),
            "--operation", "buffer",
            "--distance", "100",
            "--name", "performance_test",
            "--output", str(self.temp_data_dir / "processed")
        ]

        exit_code, stdout, stderr = self.run_geo_cli(args)
        end_time = time.time()

        assert exit_code == 0, f"Performance test failed: {stderr}"

        # Operation should complete within reasonable time (30 seconds for spatial ops)
        assert (end_time - start_time) < 30.0, f"Operation took too long: {end_time - start_time:.2f}s"

        # Verify output was created
        output_file = self.temp_data_dir / "processed" / "performance_test.geoparquet"
        assert output_file.exists(), "Performance test didn't create output"