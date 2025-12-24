"""Tests for visualization module."""

import json
import tempfile
from pathlib import Path

import geopandas as gpd
import pytest
from shapely.geometry import Point, Polygon

from geo_cli.viz import (
    BASEMAPS,
    create_h3_index,
    detect_geometry_type,
    get_basemap_style,
    load_data,
)


class TestLoadData:
    """Tests for load_data function."""

    def test_load_geojson_file(self, tmp_path: Path):
        gdf = gpd.GeoDataFrame(
            {"id": [1, 2]},
            geometry=[Point(24.9, 60.1), Point(24.95, 60.15)],
            crs="EPSG:4326",
        )
        geojson_path = tmp_path / "test.geojson"
        gdf.to_file(geojson_path, driver="GeoJSON")

        result = load_data(geojson_path)

        assert len(result) == 2
        assert result.crs == "EPSG:4326"

    def test_load_geodataframe(self):
        gdf = gpd.GeoDataFrame(
            {"id": [1]},
            geometry=[Point(24.9, 60.1)],
            crs="EPSG:4326",
        )

        result = load_data(gdf)

        assert len(result) == 1
        assert result.crs == "EPSG:4326"

    def test_load_with_crs_transform(self, tmp_path: Path):
        gdf = gpd.GeoDataFrame(
            {"id": [1]},
            geometry=[Point(2768831, 8451215)],
            crs="EPSG:3857",
        )
        geojson_path = tmp_path / "test.geojson"
        gdf.to_file(geojson_path, driver="GeoJSON")

        result = load_data(geojson_path)

        assert result.crs == "EPSG:4326"

    def test_load_file_not_found(self):
        with pytest.raises(FileNotFoundError):
            load_data("/nonexistent/file.geojson")

    def test_load_unsupported_type(self):
        with pytest.raises(ValueError, match="Unsupported source type"):
            load_data(123)


class TestDetectGeometryType:
    """Tests for detect_geometry_type function."""

    def test_detect_point(self):
        gdf = gpd.GeoDataFrame(geometry=[Point(0, 0), Point(1, 1)])

        assert detect_geometry_type(gdf) == "Point"

    def test_detect_polygon(self):
        poly = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])
        gdf = gpd.GeoDataFrame(geometry=[poly])

        assert detect_geometry_type(gdf) == "Polygon"


class TestCreateH3Index:
    """Tests for create_h3_index function."""

    def test_creates_index_with_feature_counts(self):
        points = [Point(24.9 + i * 0.001, 60.1 + i * 0.001) for i in range(10)]
        gdf = gpd.GeoDataFrame({"id": range(10)}, geometry=points, crs="EPSG:4326")

        result = create_h3_index(gdf, resolution=9)

        assert "feature_count" in result.columns
        assert "normalized_count" in result.columns
        assert len(result) > 0
        assert result["feature_count"].sum() >= len(gdf)

    def test_normalized_count_range(self):
        points = [Point(24.9 + i * 0.01, 60.1) for i in range(5)]
        gdf = gpd.GeoDataFrame({"id": range(5)}, geometry=points, crs="EPSG:4326")

        result = create_h3_index(gdf, resolution=7)

        assert result["normalized_count"].max() == 1.0
        assert result["normalized_count"].min() >= 0.0


class TestBasemaps:
    """Tests for basemap configuration."""

    def test_get_streets_basemap(self):
        style = get_basemap_style("streets")
        assert "mapbox://styles/mapbox/streets-v12" in style

    def test_get_outdoor_basemap(self):
        style = get_basemap_style("outdoor")
        assert "mapbox://styles/mapbox/outdoors-v12" in style

    def test_unknown_basemap_raises(self):
        with pytest.raises(ValueError, match="Unknown basemap"):
            get_basemap_style("unknown")

    def test_basemaps_dict_has_expected_keys(self):
        assert "streets" in BASEMAPS
        assert "outdoor" in BASEMAPS
