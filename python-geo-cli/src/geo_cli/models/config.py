"""Configuration models for the geospatial CLI."""

from typing import Dict, List, Optional, Union, Any
from pathlib import Path
from pydantic import BaseModel, Field, validator


class BoundingBox(BaseModel):
    """Bounding box configuration."""

    min_lon: float = Field(..., ge=-180, le=180, description="Minimum longitude")
    min_lat: float = Field(..., ge=-90, le=90, description="Minimum latitude")
    max_lon: float = Field(..., ge=-180, le=180, description="Maximum longitude")
    max_lat: float = Field(..., ge=-90, le=90, description="Maximum latitude")

    @validator('max_lon')
    def max_lon_greater_than_min_lon(cls, v, values):
        if 'min_lon' in values and v <= values['min_lon']:
            raise ValueError('max_lon must be greater than min_lon')
        return v

    @validator('max_lat')
    def max_lat_greater_than_min_lat(cls, v, values):
        if 'min_lat' in values and v <= values['min_lat']:
            raise ValueError('max_lat must be greater than min_lat')
        return v

    @property
    def as_tuple(self) -> tuple:
        """Return bounding box as tuple."""
        return (self.min_lon, self.min_lat, self.max_lon, self.max_lat)


class OSMTag(BaseModel):
    """OSM tag configuration."""

    key: str = Field(..., description="OSM tag key")
    values: List[str] = Field(default_factory=list, description="OSM tag values")
    include_all_values: bool = Field(default=False, description="Include all values for this key")


class DownloadConfig(BaseModel):
    """Configuration for OSM data download."""

    bbox: BoundingBox
    tags: List[OSMTag] = Field(default_factory=list, description="OSM tags to filter by")
    output_dir: Path = Field(default=Path("data/processed"), description="Output directory")
    filename: str = Field(default="osm_data", description="Output filename (without extension)")
    timeout: int = Field(default=300, ge=1, le=3600, description="Download timeout in seconds")
    use_cache: bool = Field(default=True, description="Use cached data when available")
    cache_dir: Path = Field(default=Path("data/cache"), description="Cache directory")

    def get_tags_dict(self) -> Dict[str, List[str]]:
        """Convert OSM tags to dictionary format."""
        if self.include_all_tags:
            return {}

        tags_dict = {}
        for tag in self.tags:
            if tag.include_all_values:
                tags_dict[tag.key] = []  # Empty list means all values
            else:
                tags_dict[tag.key] = tag.values

        return tags_dict


class ProcessingConfig(BaseModel):
    """Configuration for spatial processing operations."""

    input_file: Path = Field(..., description="Input GeoParquet file")
    operation: str = Field(..., description="Spatial operation to perform")
    output_dir: Path = Field(default=Path("data/processed"), description="Output directory")
    filename: Optional[str] = Field(default=None, description="Output filename")
    operation_params: Dict[str, Any] = Field(default_factory=dict, description="Operation-specific parameters")

    # Buffer operation parameters
    distance: Optional[float] = Field(default=None, description="Buffer distance")
    distance_unit: str = Field(default="meters", description="Distance unit")

    # Spatial join parameters
    other_file: Optional[Path] = Field(default=None, description="Other dataset for spatial operations")
    predicate: str = Field(default="ST_Intersects", description="Spatial predicate")
    join_type: str = Field(default="inner", description="Join type")

    # Reprojection parameters
    target_crs: Optional[str] = Field(default=None, description="Target coordinate reference system")

    @validator('operation')
    def validate_operation(cls, v):
        valid_operations = ['buffer', 'intersection', 'union', 'spatial-join', 'reproject']
        if v not in valid_operations:
            raise ValueError(f'Invalid operation: {v}. Must be one of {valid_operations}')
        return v

    @validator('distance_unit')
    def validate_distance_unit(cls, v):
        valid_units = ['meters', 'kilometers', 'degrees']
        if v not in valid_units:
            raise ValueError(f'Invalid distance unit: {v}. Must be one of {valid_units}')
        return v


class VisualizationConfig(BaseModel):
    """Configuration for map visualization."""

    input_file: Path = Field(..., description="Input GeoParquet file")
    output_file: Path = Field(default=Path("visualization.html"), description="Output HTML file")
    title: str = Field(default="Geospatial Visualization", description="Map title")
    color: str = Field(default="#1f77b4", description="Default color for features")
    radius: float = Field(default=10, ge=1, le=100, description="Point radius in pixels")
    label_field: Optional[str] = Field(default=None, description="Field to use for labeling")
    color_field: Optional[str] = Field(default=None, description="Field to use for color coding")
    size_field: Optional[str] = Field(default=None, description="Field to use for sizing features")
    config_file: Optional[Path] = Field(default=None, description="Custom KeplerGL configuration file")

    # Map style settings
    map_style: str = Field(default="light", description="Base map style")
    auto_zoom: bool = Field(default=True, description="Auto-center and zoom map")
    zoom_level: Optional[int] = Field(default=None, ge=0, le=20, description="Manual zoom level")

    @validator('map_style')
    def validate_map_style(cls, v):
        valid_styles = ['light', 'dark', 'satellite', 'streets', 'outdoors']
        if v not in valid_styles:
            raise ValueError(f'Invalid map style: {v}. Must be one of {valid_styles}')
        return v


class CacheConfig(BaseModel):
    """Configuration for data caching."""

    enabled: bool = Field(default=True, description="Enable caching")
    cache_dir: Path = Field(default=Path("data/cache"), description="Cache directory")
    max_size_mb: int = Field(default=1024, ge=1, description="Maximum cache size in MB")
    ttl_hours: int = Field(default=24, ge=1, description="Time to live in hours")
    cleanup_on_startup: bool = Field(default=False, description="Clean cache on startup")


class LoggingConfig(BaseModel):
    """Configuration for logging."""

    level: str = Field(default="INFO", description="Log level")
    format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format"
    )
    file_path: Optional[Path] = Field(default=None, description="Log file path")
    max_file_size_mb: int = Field(default=10, ge=1, description="Maximum log file size in MB")
    backup_count: int = Field(default=5, ge=1, description="Number of backup log files")

    @validator('level')
    def validate_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Invalid log level: {v}. Must be one of {valid_levels}')
        return v.upper()


class GeoCLIConfig(BaseModel):
    """Main configuration for the geospatial CLI."""

    # Core settings
    cache: CacheConfig = Field(default_factory=CacheConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)

    # Default directories
    data_dir: Path = Field(default=Path("data"), description="Base data directory")
    temp_dir: Path = Field(default=Path("data/temp"), description="Temporary directory")

    # Memory settings
    max_memory_gb: Optional[float] = Field(default=None, ge=0.5, description="Maximum memory usage in GB")
    sedona_memory: Optional[str] = Field(default=None, description="SedonaDB memory setting")

    # Performance settings
    parallel_downloads: bool = Field(default=True, description="Enable parallel downloads")
    max_workers: int = Field(default=4, ge=1, le=16, description="Maximum number of worker threads")

    @validator('max_workers')
    def validate_max_workers(cls, v):
        import os
        cpu_count = os.cpu_count() or 1
        if v > cpu_count * 2:
            raise ValueError(f'max_workers should not exceed {cpu_count * 2} for this system')
        return v

    def get_data_path(self, *parts: str) -> Path:
        """Get a path within the data directory."""
        return self.data_dir.joinpath(*parts)

    def get_cache_path(self, *parts: str) -> Path:
        """Get a path within the cache directory."""
        return self.cache.cache_dir.joinpath(*parts)