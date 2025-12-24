"""KeplerGL renderer for multi-layer geospatial visualization."""

import json
import logging
import re
from pathlib import Path
from typing import Union

import geopandas as gpd

from .basemaps import DEFAULT_BASEMAP, get_basemap_style
from .indexer import create_h3_index

logger = logging.getLogger(__name__)


def load_data(source: Union[str, Path, gpd.GeoDataFrame]) -> gpd.GeoDataFrame:
    """Load geospatial data from GeoJSON, GeoParquet file or GeoDataFrame.

    Args:
        source: GeoJSON/GeoParquet file path or GeoDataFrame

    Returns:
        GeoDataFrame in EPSG:4326

    Raises:
        ValueError: If source type is not supported
    """
    if isinstance(source, gpd.GeoDataFrame):
        gdf = source
    elif isinstance(source, (str, Path)):
        path = Path(source)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {path}")
        suffix = path.suffix.lower()
        if suffix in (".parquet", ".geoparquet"):
            gdf = gpd.read_parquet(path)
        else:
            gdf = gpd.read_file(path)
    else:
        raise ValueError(f"Unsupported source type: {type(source)}")

    if gdf.crs is None:
        logger.warning("No CRS found, assuming EPSG:4326")
        gdf = gdf.set_crs("EPSG:4326")
    elif gdf.crs != "EPSG:4326":
        logger.info(f"Reprojecting from {gdf.crs} to EPSG:4326")
        gdf = gdf.to_crs("EPSG:4326")

    return gdf


def detect_geometry_type(gdf: gpd.GeoDataFrame) -> str:
    """Detect predominant geometry type in GeoDataFrame.

    Args:
        gdf: Input GeoDataFrame

    Returns:
        One of 'Point', 'Line', or 'Polygon'
    """
    geom_types = gdf.geometry.geom_type.unique()

    if any(t in ["Point", "MultiPoint"] for t in geom_types):
        return "Point"
    if any(t in ["LineString", "MultiLineString"] for t in geom_types):
        return "Line"
    return "Polygon"


def _calculate_map_center(index_gdf: gpd.GeoDataFrame) -> tuple[float, float, int]:
    """Calculate map center based on H3 cell with most features.

    Args:
        index_gdf: H3 index GeoDataFrame with feature_count column

    Returns:
        Tuple of (latitude, longitude, zoom)
    """
    max_idx = index_gdf["feature_count"].idxmax()
    max_cell = index_gdf.loc[max_idx]
    centroid = max_cell.geometry.centroid

    bounds = index_gdf.total_bounds
    lat_range = bounds[3] - bounds[1]
    lon_range = bounds[2] - bounds[0]
    max_range = max(lat_range, lon_range)

    if max_range > 10:
        zoom = 2
    elif max_range > 5:
        zoom = 4
    elif max_range > 1:
        zoom = 6
    elif max_range > 0.1:
        zoom = 8
    elif max_range > 0.01:
        zoom = 10
    else:
        zoom = 12

    return centroid.y, centroid.x, zoom


def _create_target_layer_config(gdf: gpd.GeoDataFrame, geom_type: str) -> dict:
    """Create KeplerGL layer config for target data (red, opacity=0.9)."""
    return {
        "id": "target_layer",
        "type": "geojson",
        "config": {
            "dataId": "target_data",
            "label": "Target Features",
            "color": [255, 0, 0],
            "columns": {},
            "isVisible": True,
            "visConfig": {
                "opacity": 0.1,
                "strokeOpacity": 0.3,
                "thickness": 2 if geom_type == "Line" else 0.5,
                "strokeColor": [255, 0, 0],
                "filled": geom_type == "Polygon",
                "radius": 10 if geom_type == "Point" else 0,
            },
        },
        "visualChannels": {"colorField": None, "sizeField": None},
    }


def _create_index_layer_config() -> dict:
    """Create KeplerGL layer config for H3 index (blue, opacity=0.5)."""
    return {
        "id": "index_layer",
        "type": "geojson",
        "config": {
            "dataId": "index_data",
            "label": "H3 Index",
            "color": [0, 0, 255],
            "columns": {},
            "isVisible": True,
            "visConfig": {
                "opacity": 0.9,
                "strokeOpacity": 0.9,
                "thickness": 0.5,
                "strokeColor": [0, 0, 255],
                "filled": False,
            },
        },
        "visualChannels": {
            "colorField": {"name": "feature_count", "type": "integer"},
            "colorScale": "quantile",
        },
    }


def create_map(
    source: Union[str, Path, gpd.GeoDataFrame],
    output_path: Union[str, Path],
    basemap: str = DEFAULT_BASEMAP,
    h3_resolution: int = 9,
    title: str = "Geospatial Visualization",
) -> Path:
    """Create multi-layer map with H3 index and target features.

    Args:
        source: GeoJSON file path or GeoDataFrame
        output_path: Output HTML file path
        basemap: Basemap name ('streets' or 'outdoor')
        h3_resolution: H3 resolution (default 9)
        title: Map title

    Returns:
        Path to generated HTML file
    """
    from keplergl import KeplerGl

    output_path = Path(output_path)

    gdf = load_data(source)
    geom_type = detect_geometry_type(gdf)
    logger.info(f"Loaded {len(gdf)} features, geometry type: {geom_type}")

    index_gdf = create_h3_index(gdf, resolution=h3_resolution)
    logger.info(f"Created H3 index with {len(index_gdf)} cells")

    center_lat, center_lon, zoom = _calculate_map_center(index_gdf)

    h3_layer = {
        "id": "h3_index",
        "type": "geojson",
        "config": {
            "dataId": "h3_index",
            "label": "H3 Index",
            "color": [23, 184, 190],
            "highlightColor": [252, 242, 26, 255],
            "columns": {"geojson": "_geojson"},
            "isVisible": False,
            "visConfig": {
                "opacity": 0.3,
                "strokeOpacity": 0.5,
                "thickness": 0.5,
                "strokeColor": [23, 184, 190],
                "colorRange": {
                    "name": "Global Warming",
                    "type": "sequential",
                    "category": "Uber",
                    "colors": ["#5A1846", "#900C3F", "#C70039", "#E3611C", "#F1920E", "#FFC300"],
                },
                "strokeColorRange": {
                    "name": "Global Warming",
                    "type": "sequential",
                    "category": "Uber",
                    "colors": ["#5A1846", "#900C3F", "#C70039", "#E3611C", "#F1920E", "#FFC300"],
                },
                "radius": 10,
                "sizeRange": [0, 10],
                "radiusRange": [0, 50],
                "heightRange": [0, 500],
                "elevationScale": 5,
                "enableElevationZoomFactor": True,
                "stroked": True,
                "filled": True,
                "enable3d": False,
                "wireframe": False,
            },
            "hidden": False,
            "textLabel": [
                {
                    "field": None,
                    "color": [255, 255, 255],
                    "size": 18,
                    "offset": [0, 0],
                    "anchor": "start",
                    "alignment": "center",
                    "outlineWidth": 0,
                    "outlineColor": [255, 0, 0, 255],
                    "background": False,
                    "backgroundColor": [0, 0, 200, 255],
                }
            ],
        },
        "visualChannels": {
            "colorField": {"name": "feature_count", "type": "integer"},
            "colorScale": "quantile",
            "strokeColorField": None,
            "strokeColorScale": "quantile",
            "sizeField": None,
            "sizeScale": "linear",
        },
    }

    target_layer = {
        "id": "target_features",
        "type": "geojson",
        "config": {
            "dataId": "target_features",
            "label": "Target Features",
            "color": [255, 0, 0],
            "highlightColor": [200, 0, 0, 230],
            "columns": {"geojson": "_geojson"},
            "isVisible": True,
            "visConfig": {
                "opacity": 0.1,
                "strokeOpacity": 0.1,
                "thickness": 0.25,
                "strokeColor": [200, 0, 0],
                "colorRange": {
                    "name": "Global Warming",
                    "type": "sequential",
                    "category": "Uber",
                    "colors": ["#5A1846", "#900C3F", "#C70039", "#E3611C", "#F1920E", "#FFC300"],
                },
                "strokeColorRange": {
                    "name": "Global Warming",
                    "type": "sequential",
                    "category": "Uber",
                    "colors": ["#5A1846", "#900C3F", "#C70039", "#E3611C", "#F1920E", "#FFC300"],
                },
                "radius": 10,
                "sizeRange": [0, 10],
                "radiusRange": [0, 50],
                "heightRange": [0, 500],
                "elevationScale": 5,
                "enableElevationZoomFactor": True,
                "stroked": True,
                "filled": True,
                "enable3d": False,
                "wireframe": False,
            },
            "hidden": False,
            "textLabel": [
                {
                    "field": None,
                    "color": [255, 255, 255],
                    "size": 18,
                    "offset": [0, 0],
                    "anchor": "start",
                    "alignment": "center",
                    "outlineWidth": 0,
                    "outlineColor": [255, 0, 0, 255],
                    "background": False,
                    "backgroundColor": [0, 0, 200, 255],
                }
            ],
        },
        "visualChannels": {
            "colorField": None,
            "colorScale": "quantile",
            "strokeColorField": None,
            "strokeColorScale": "quantile",
            "sizeField": None,
            "sizeScale": "linear",
        },
    }

    basemap_style = get_basemap_style(basemap)
    map_style_id = "custom_basemap"

    config = {
        "version": "v1",
        "config": {
            "visState": {
                "layers": [target_layer, h3_layer],
                "interactionConfig": {
                    "tooltip": {
                        "fieldsToShow": {
                            "target_features": [
                                {"name": "id", "format": None},
                                {"name": "@id", "format": None},
                                {"name": "architect", "format": None},
                                {"name": "name:en", "format": None},
                                {"name": "loc_name", "format": None},
                                {"name": "short_name:en", "format": None},
                                {"name": "short_name", "format": None},
                                {"name": "wikipedia", "format": None},
                                {"name": "wikidata", "format": None},
                            ],
                            "h3_index": [
                                {"name": "feature_count", "format": None},
                            ],
                        },
                        "compareMode": False,
                        "compareType": "absolute",
                        "enabled": True,
                    },
                    "brush": {"size": 0.5, "enabled": False},
                    "geocoder": {"enabled": False},
                    "coordinate": {"enabled": False},
                },
                "layerBlending": "normal",
                "splitMaps": [],
                "animationConfig": {"currentTime": None, "speed": 1},
            },
            "mapState": {
                "latitude": center_lat,
                "longitude": center_lon,
                "zoom": zoom,
                "bearing": 0,
                "pitch": 0,
                "dragRotate": False,
            },
            "mapStyle": {
                "styleType": map_style_id,
                "topLayerGroups": {},
                "visibleLayerGroups": {
                    "label": True,
                    "road": True,
                    "border": True,
                    "building": True,
                    "water": True,
                    "land": True,
                },
                "mapStyles": {
                    map_style_id: {
                        "id": map_style_id,
                        "label": "Custom Basemap",
                        "url": basemap_style,
                        "custom": True,
                    }
                },
            },
        },
    }

    target_geojson = json.loads(gdf.to_json())
    h3_geojson = json.loads(index_gdf.to_json())

    kepler_map = KeplerGl(
        height=800,
        data={
            "h3_index": h3_geojson,
            "target_features": target_geojson,
        },
        config=config,
    )

    kepler_map.save_to_html(file_name=str(output_path), read_only=False)

    html_content = output_path.read_text()

    html_content = html_content.replace(
        "https://www.googletagmanager.com/gtag/js?id=UA-64694404-19",
        ""
    )
    html_content = re.sub(
        r"<script>\s*window\.dataLayer.*?</script>",
        "",
        html_content,
        flags=re.DOTALL
    )
    html_content = re.sub(
        r"<title>.*?</title>",
        f"<title>{title}</title>",
        html_content
    )

    output_path.write_text(html_content)
    logger.info(f"Saved map to {output_path}")

    return output_path
