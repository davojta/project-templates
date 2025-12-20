"""Input validation utilities for geospatial operations."""

import re
from typing import Dict, List, Optional, Tuple, Union, Any
from pathlib import Path

import pyproj
from shapely.geometry import Point, Polygon, box
from pydantic import ValidationError


class ValidationError(Exception):
    """Custom validation error for geospatial operations."""
    pass


def validate_bbox(bbox_str: str) -> Tuple[float, float, float, float]:
    """Validate and parse bounding box string.

    Args:
        bbox_str: Bounding box as "min_lon,min_lat,max_lon,max_lat"

    Returns:
        Tuple of (min_lon, min_lat, max_lon, max_lat)

    Raises:
        ValidationError: If bounding box is invalid
    """
    try:
        parts = bbox_str.split(',')
        if len(parts) != 4:
            raise ValidationError("Bounding box must have 4 coordinates")

        min_lon, min_lat, max_lon, max_lat = map(float, parts)

        # Validate coordinate ranges
        if not (-180 <= min_lon <= 180):
            raise ValidationError(f"Minimum longitude {min_lon} out of range [-180, 180]")
        if not (-180 <= max_lon <= 180):
            raise ValidationError(f"Maximum longitude {max_lon} out of range [-180, 180]")
        if not (-90 <= min_lat <= 90):
            raise ValidationError(f"Minimum latitude {min_lat} out of range [-90, 90]")
        if not (-90 <= max_lat <= 90):
            raise ValidationError(f"Maximum latitude {max_lat} out of range [-90, 90]")

        # Validate logical constraints
        if min_lon >= max_lon:
            raise ValidationError(f"Minimum longitude {min_lon} must be less than maximum longitude {max_lon}")
        if min_lat >= max_lat:
            raise ValidationError(f"Minimum latitude {min_lat} must be less than maximum latitude {max_lat}")

        return (min_lon, min_lat, max_lon, max_lat)

    except ValueError as e:
        raise ValidationError(f"Invalid coordinate format: {e}")


def validate_osm_tags(tags_str: str) -> Dict[str, List[str]]:
    """Validate and parse OSM tags string.

    Args:
        tags_str: Tags as "key:value,key:value" format

    Returns:
        Dictionary mapping tag keys to lists of values

    Raises:
        ValidationError: If tags format is invalid
    """
    if not tags_str:
        return {}

    try:
        tags_dict = {}
        tag_pairs = tags_str.split(',')

        for pair in tag_pairs:
            if ':' not in pair:
                raise ValidationError(f"Invalid tag format: {pair}. Expected 'key:value'")

            key, value = pair.split(':', 1)  # Split on first ':' only
            key = key.strip()
            value = value.strip()

            if not key:
                raise ValidationError("Tag key cannot be empty")

            if not value:
                raise ValidationError("Tag value cannot be empty")

            # Validate tag format (OSM tags are typically lowercase with underscores)
            if not re.match(r'^[a-z0-9_:-]+$', key):
                raise ValidationError(f"Invalid tag key format: {key}")

            if key not in tags_dict:
                tags_dict[key] = []
            tags_dict[key].append(value)

        return tags_dict

    except ValueError as e:
        raise ValidationError(f"Error parsing tags: {e}")


def validate_coordinates(coordinates: Union[str, Tuple[float, float], List[float]]) -> Tuple[float, float]:
    """Validate and normalize coordinates.

    Args:
        coordinates: Coordinates as "lon,lat" string or (lon, lat) tuple

    Returns:
        Tuple of (longitude, latitude)

    Raises:
        ValidationError: If coordinates are invalid
    """
    if isinstance(coordinates, str):
        try:
            parts = coordinates.split(',')
            if len(parts) != 2:
                raise ValidationError("Coordinates must be in 'lon,lat' format")
            lon, lat = map(float, parts)
        except ValueError as e:
            raise ValidationError(f"Invalid coordinate format: {e}")
    elif isinstance(coordinates, (list, tuple)):
        if len(coordinates) != 2:
            raise ValidationError("Coordinates must have exactly 2 values")
        lon, lat = coordinates
    else:
        raise ValidationError("Coordinates must be string or tuple/list")

    # Validate ranges
    if not (-180 <= lon <= 180):
        raise ValidationError(f"Longitude {lon} out of range [-180, 180]")
    if not (-90 <= lat <= 90):
        raise ValidationError(f"Latitude {lat} out of range [-90, 90]")

    return (lon, lat)


def validate_crs(crs_string: str) -> str:
    """Validate coordinate reference system.

    Args:
        crs_string: CRS identifier (e.g., "EPSG:4326")

    Returns:
        Validated CRS string

    Raises:
        ValidationError: If CRS is invalid
    """
    try:
        # Try to create a CRS object
        crs = pyproj.CRS.from_user_input(crs_string)
        return crs.to_string()
    except Exception as e:
        raise ValidationError(f"Invalid CRS '{crs_string}': {e}")


def validate_file_path(
    file_path: Union[str, Path],
    must_exist: bool = False,
    allowed_extensions: Optional[List[str]] = None,
    check_writable: bool = False
) -> Path:
    """Validate file path.

    Args:
        file_path: Path to validate
        must_exist: If True, file must exist
        allowed_extensions: List of allowed file extensions
        check_writable: If True, check if file is writable

    Returns:
        Validated Path object

    Raises:
        ValidationError: If path is invalid
    """
    path = Path(file_path)

    # Check if path exists
    if must_exist and not path.exists():
        raise ValidationError(f"File does not exist: {path}")

    # Check file extension
    if allowed_extensions:
        ext = path.suffix.lower()
        if ext not in allowed_extensions:
            raise ValidationError(f"File extension '{ext}' not allowed. Allowed: {allowed_extensions}")

    # Check if parent directory exists or can be created
    if not path.parent.exists():
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise ValidationError(f"Cannot create parent directory: {e}")

    # Check if file is writable
    if check_writable:
        if path.exists():
            if not path.is_file():
                raise ValidationError(f"Path is not a file: {path}")
            if not os.access(path, os.W_OK):
                raise ValidationError(f"File is not writable: {path}")
        else:
            if not os.access(path.parent, os.W_OK):
                raise ValidationError(f"Cannot write to parent directory: {path.parent}")

    return path


def validate_geoparquet_file(file_path: Union[str, Path]) -> Path:
    """Validate that file is a valid GeoParquet file.

    Args:
        file_path: Path to GeoParquet file

    Returns:
        Validated Path object

    Raises:
        ValidationError: If file is not a valid GeoParquet
    """
    import os

    path = validate_file_path(file_path, must_exist=True, allowed_extensions=['.geoparquet', '.parquet'])

    try:
        # Try to read the file with GeoPandas
        import geopandas as gpd
        gdf = gpd.read_parquet(path)

        # Check if it has geometry column
        if 'geometry' not in gdf.columns:
            raise ValidationError("File does not contain geometry column")

        # Check if CRS is defined
        if gdf.crs is None:
            raise ValidationError("File does not have defined CRS")

        return path

    except Exception as e:
        raise ValidationError(f"Invalid GeoParquet file: {e}")


def validate_distance(distance: float, unit: str = "meters") -> float:
    """Validate distance value.

    Args:
        distance: Distance value
        unit: Distance unit (meters, kilometers, degrees)

    Returns:
        Validated distance

    Raises:
        ValidationError: If distance is invalid
    """
    if distance <= 0:
        raise ValidationError(f"Distance must be positive: {distance}")

    if unit == "meters" and distance > 1000000:  # 1000km
        raise ValidationError(f"Distance too large for meters: {distance}")
    elif unit == "kilometers" and distance > 10000:  # 10000km
        raise ValidationError(f"Distance too large for kilometers: {distance}")
    elif unit == "degrees" and distance > 180:
        raise ValidationError(f"Distance too large for degrees: {distance}")

    return distance


def validate_operation_params(operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for spatial operations.

    Args:
        operation: Operation name
        params: Operation parameters

    Returns:
        Validated parameters

    Raises:
        ValidationError: If parameters are invalid
    """
    if operation == "buffer":
        if "distance" not in params:
            raise ValidationError("Buffer operation requires 'distance' parameter")
        validate_distance(params["distance"], params.get("distance_unit", "meters"))

    elif operation == "spatial-join":
        if "other_file" not in params:
            raise ValidationError("Spatial join requires 'other_file' parameter")
        validate_file_path(params["other_file"], must_exist=True)

        # Validate predicate
        predicate = params.get("predicate", "ST_Intersects")
        valid_predicates = ["ST_Intersects", "ST_Contains", "ST_Within", "ST_Touches", "ST_Overlaps"]
        if predicate not in valid_predicates:
            raise ValidationError(f"Invalid spatial predicate: {predicate}. Valid: {valid_predicates}")

    elif operation == "reproject":
        if "target_crs" not in params:
            raise ValidationError("Reprojection requires 'target_crs' parameter")
        validate_crs(params["target_crs"])

    return params


def validate_map_style(style: str) -> str:
    """Validate map style for visualization.

    Args:
        style: Map style name

    Returns:
        Validated style name

    Raises:
        ValidationError: If style is invalid
    """
    valid_styles = ["light", "dark", "satellite", "streets", "outdoors"]
    if style not in valid_styles:
        raise ValidationError(f"Invalid map style: {style}. Valid: {valid_styles}")
    return style


def validate_hex_color(color: str) -> str:
    """Validate hex color code.

    Args:
        color: Color string (e.g., "#FF0000")

    Returns:
        Validated color string

    Raises:
        ValidationError: If color is invalid
    """
    if not re.match(r'^#[0-9A-Fa-f]{6}$', color):
        raise ValidationError(f"Invalid hex color: {color}. Expected format: #RRGGBB")
    return color.upper()