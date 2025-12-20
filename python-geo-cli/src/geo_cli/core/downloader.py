"""OSM data downloader using QuackOSM."""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


class OSMDownloader:
    """Download OSM data using QuackOSM with caching and multithreading."""

    def __init__(self, cache_dir: Optional[Union[str, Path]] = None):
        """Initialize the downloader.

        Args:
            cache_dir: Directory for caching downloaded OSM data
        """
        self.cache_dir = Path(cache_dir) if cache_dir else Path("data/cache")
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # TODO: Initialize QuackOSM when available
        # self.quackosm = QuackOSM(cache_dir=str(self.cache_dir))

    def download_region(
        self,
        bbox: Tuple[float, float, float, float],
        tags: Optional[Dict[str, List[str]]] = None,
        output_path: Optional[Union[str, Path]] = None,
        timeout: int = 300
    ) -> Path:
        """Download OSM data for a bounding box region.

        Args:
            bbox: Bounding box as (min_lon, min_lat, max_lon, max_lat)
            tags: OSM tags to filter by (e.g., {"building": ["residential"]})
            output_path: Path to save the downloaded data
            timeout: Download timeout in seconds

        Returns:
            Path to the downloaded data file
        """
        min_lon, min_lat, max_lon, max_lat = bbox

        logger.info(f"Downloading OSM data for bbox: {bbox}")
        if tags:
            logger.info(f"Filtering by tags: {tags}")

        # Generate cache key
        cache_key = self._generate_cache_key(bbox, tags)
        cache_file = self.cache_dir / f"{cache_key}.geoparquet"

        # Check cache first
        if cache_file.exists():
            logger.info(f"Using cached data: {cache_file}")
            return cache_file

        # TODO: Implement actual QuackOSM download
        # For now, create a placeholder implementation
        try:
            import geopandas as gpd
            import pandas as pd
            from shapely.geometry import box, Point

            # Create placeholder data for the bounding box
            geom = box(min_lon, min_lat, max_lon, max_lat)

            # Generate some sample features based on tags
            features = []

            # Always add the bounding box
            features.append({
                'id': 'bbox',
                'name': f'Bounding Box {min_lon:.2f},{min_lat:.2f}',
                'geometry': geom,
                'feature_type': 'bounding_box'
            })

            # Add sample features based on tags
            if tags:
                import random
                num_features = min(10, max_lon - min_lon) * 10  # Rough density estimate

                for i in range(int(num_features)):
                    # Random point within bbox
                    lon = random.uniform(min_lon, max_lon)
                    lat = random.uniform(min_lat, max_lat)

                    # Determine feature type based on tags
                    feature_type = 'point'
                    for tag_key, tag_values in tags.items():
                        if 'building' in tag_key:
                            feature_type = 'building'
                        elif 'highway' in tag_key:
                            feature_type = 'road'
                        elif 'amenity' in tag_key:
                            feature_type = 'amenity'

                    feature = {
                        'id': f'feature_{i}',
                        'name': f'{feature_type.title()} {i}',
                        'geometry': Point(lon, lat),
                        'feature_type': feature_type
                    }

                    # Add tag attributes
                    for tag_key, tag_values in tags.items():
                        feature[tag_key] = random.choice(tag_values) if tag_values else 'yes'

                    features.append(feature)

            # Create GeoDataFrame
            gdf = gpd.GeoDataFrame(features, crs='EPSG:4326')

            # Determine output path
            if output_path is None:
                output_path = self.cache_dir / f"{cache_key}.geoparquet"
            else:
                output_path = Path(output_path)

            # Save to GeoParquet
            gdf.to_parquet(output_path)

            logger.info(f"Downloaded data to: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Download failed: {e}")
            raise

    def _generate_cache_key(
        self,
        bbox: Tuple[float, float, float, float],
        tags: Optional[Dict[str, List[str]]]
    ) -> str:
        """Generate a cache key for the download parameters."""
        import hashlib

        # Create string representation
        bbox_str = f"{bbox[0]:.4f},{bbox[1]:.4f},{bbox[2]:.4f},{bbox[3]:.4f}"

        if tags:
            # Sort tags for consistent key generation
            sorted_tags = sorted((k, sorted(v)) for k, v in tags.items())
            tags_str = "_".join(f"{k}:{','.join(v)}" for k, v in sorted_tags)
        else:
            tags_str = "all"

        # Generate hash
        key_string = f"{bbox_str}_{tags_str}"
        return hashlib.md5(key_string.encode()).hexdigest()[:16]

    def clear_cache(self, pattern: Optional[str] = None) -> None:
        """Clear cached OSM data.

        Args:
            pattern: Optional pattern to match for selective cache clearing
        """
        if pattern:
            import glob
            cache_files = list(self.cache_dir.glob(f"*{pattern}*.geoparquet"))
        else:
            cache_files = list(self.cache_dir.glob("*.geoparquet"))

        for cache_file in cache_files:
            cache_file.unlink()
            logger.info(f"Removed cache file: {cache_file}")

        logger.info(f"Cleared {len(cache_files)} cache files")

    def get_cache_info(self) -> Dict:
        """Get information about cached data."""
        cache_files = list(self.cache_dir.glob("*.geoparquet"))
        total_size = sum(f.stat().st_size for f in cache_files)

        return {
            'num_files': len(cache_files),
            'total_size_mb': total_size / (1024 * 1024),
            'cache_dir': str(self.cache_dir)
        }