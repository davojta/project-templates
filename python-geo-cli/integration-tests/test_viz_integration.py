"""Integration tests for visualization module using example data."""

from pathlib import Path

import pytest

from geo_cli.viz import create_map

EXAMPLE_GEOJSON = Path(__file__).parent.parent / "data" / "example" / "export.geojson"


@pytest.mark.skipif(not EXAMPLE_GEOJSON.exists(), reason="Example GeoJSON not found")
class TestCreateMapIntegration:
    """Integration tests for create_map with real data."""

    def test_create_map_from_geojson(self, tmp_path: Path):
        output_path = tmp_path / "test_map.html"

        result = create_map(
            source=EXAMPLE_GEOJSON,
            output_path=output_path,
            basemap="streets",
            h3_resolution=9,
            title="Test Map",
        )

        assert result.exists()
        assert result.suffix == ".html"

        content = result.read_text()
        assert "KeplerGL" in content or "kepler" in content.lower()
        assert "Test Map" in content

    def test_create_map_with_outdoor_basemap(self, tmp_path: Path):
        output_path = tmp_path / "outdoor_map.html"

        result = create_map(
            source=EXAMPLE_GEOJSON,
            output_path=output_path,
            basemap="outdoor",
        )

        assert result.exists()
