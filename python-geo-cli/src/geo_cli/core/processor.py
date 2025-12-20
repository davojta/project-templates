"""Spatial data processor using SedonaDB."""

import warnings
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
import logging

# Filter internal pyproj deprecation warning that we cannot fix
warnings.filterwarnings(
    "ignore",
    message="Conversion of an array with ndim > 0 to a scalar is deprecated",
    category=DeprecationWarning
)

logger = logging.getLogger(__name__)


class SedonaProcessor:
    """High-performance spatial operations using SedonaDB."""

    def __init__(self, memory_limit: Optional[str] = None):
        """Initialize SedonaDB processor.

        Args:
            memory_limit: Optional memory limit for SedonaDB
        """
        self.sedona = None
        self.memory_limit = memory_limit

        # TODO: Initialize SedonaDB when available
        # try:
        #     import sedona.db
        #     self.sedona = sedona.db.connect()
        #     if memory_limit:
        #         self.sedona.set_conf("spark.driver.memory", memory_limit)
        #     logger.info("SedonaDB initialized successfully")
        # except ImportError as e:
        #     logger.warning(f"SedonaDB not available: {e}")
        #     logger.warning("Falling back to GeoPandas operations")

    def load_geoparquet(self, parquet_path: Union[str, Path], table_name: str) -> None:
        """Load GeoParquet data into SedonaDB.

        Args:
            parquet_path: Path to the GeoParquet file
            table_name: Name for the table in SedonaDB
        """
        parquet_path = Path(parquet_path)

        if not parquet_path.exists():
            raise FileNotFoundError(f"GeoParquet file not found: {parquet_path}")

        logger.info(f"Loading {parquet_path} as table '{table_name}'")

        # TODO: Implement SedonaDB loading
        # For now, store the data for later use
        if not hasattr(self, '_data'):
            self._data = {}

        try:
            import geopandas as gpd
            gdf = gpd.read_parquet(parquet_path)
            self._data[table_name] = gdf
            logger.info(f"Loaded {len(gdf)} features")

        except Exception as e:
            logger.error(f"Failed to load GeoParquet: {e}")
            raise

    def spatial_join(
        self,
        left_table: str,
        right_table: str,
        predicate: str = "ST_Intersects",
        how: str = "inner"
    ):
        """Perform spatial join between two tables.

        Args:
            left_table: Name of the left table
            right_table: Name of the right table
            predicate: Spatial predicate (ST_Intersects, ST_Contains, etc.)
            how: Join type (inner, left, right)

        Returns:
            Result of the spatial join
        """
        logger.info(f"Performing spatial join: {left_table} {predicate} {right_table}")

        # TODO: Implement SedonaDB spatial join
        # For now, use GeoPandas fallback
        if not hasattr(self, '_data') or left_table not in self._data or right_table not in self._data:
            raise ValueError(f"One or both tables not loaded: {left_table}, {right_table}")

        try:
            left_gdf = self._data[left_table]
            right_gdf = self._data[right_table]

            # Perform spatial join with GeoPandas
            if predicate == "ST_Intersects":
                result = left_gdf.sjoin(right_gdf, how=how, predicate='intersects')
            elif predicate == "ST_Contains":
                result = left_gdf.sjoin(right_gdf, how=how, predicate='contains')
            elif predicate == "ST_Within":
                result = left_gdf.sjoin(right_gdf, how=how, predicate='within')
            elif predicate == "ST_Touches":
                result = left_gdf.sjoin(right_gdf, how=how, predicate='touches')
            else:
                raise ValueError(f"Unsupported spatial predicate: {predicate}")

            logger.info(f"Spatial join completed: {len(result)} result features")
            return result

        except Exception as e:
            logger.error(f"Spatial join failed: {e}")
            raise

    def buffer(
        self,
        table_name: str,
        distance: float,
        distance_unit: str = "meters"
    ):
        """Create buffer geometries.

        Args:
            table_name: Name of the table to buffer
            distance: Buffer distance
            distance_unit: Unit for distance (meters, kilometers, degrees)

        Returns:
            Buffered geometries
        """
        logger.info(f"Creating buffer: {table_name} with {distance} {distance_unit}")

        if not hasattr(self, '_data') or table_name not in self._data:
            raise ValueError(f"Table not loaded: {table_name}")

        try:
            gdf = self._data[table_name]

            # Convert distance to appropriate units
            if distance_unit == "meters":
                # Rough conversion to degrees (varies by latitude)
                distance_degrees = distance / 111000
            elif distance_unit == "kilometers":
                distance_degrees = distance / 111
            elif distance_unit == "degrees":
                distance_degrees = distance
            else:
                raise ValueError(f"Unsupported distance unit: {distance_unit}")

            # Create buffer with proper CRS handling
            buffered_gdf = gdf.copy()

            # Check if we need to reproject for accurate buffering
            if gdf.crs and gdf.crs.is_geographic and distance_unit != "degrees":
                # Project to UTM for accurate distance calculations
                import pyproj

                # Calculate UTM zone from centroid
                centroid = gdf.geometry.union_all().centroid
                # Extract scalar coordinates to avoid deprecation warning
                centroid_x = float(centroid.x) if hasattr(centroid.x, 'item') else centroid.x
                centroid_y = float(centroid.y) if hasattr(centroid.y, 'item') else centroid.y
                utm_zone = int((centroid_x + 180) // 6) + 1
                utm_crs = f"EPSG:{32600 + utm_zone}" if centroid_y >= 0 else f"EPSG:{32700 + utm_zone}"

                # Convert distance to meters for UTM projection
                if distance_unit == "meters":
                    distance_meters = distance
                elif distance_unit == "kilometers":
                    distance_meters = distance * 1000
                else:
                    raise ValueError(f"Unsupported distance unit for projected CRS: {distance_unit}")

                # Reproject, buffer, and reproject back
                gdf_projected = gdf.to_crs(utm_crs)
                buffered_gdf['geometry'] = gdf_projected.geometry.buffer(distance_meters).to_crs(gdf.crs)
            else:
                # Use degrees directly or already in projected CRS
                if distance_unit == "degrees":
                    buffered_gdf['geometry'] = gdf.geometry.buffer(distance_degrees)
                else:
                    # Buffer in the current CRS (assuming it's projected)
                    buffered_gdf['geometry'] = gdf.geometry.buffer(distance_degrees)

            logger.info(f"Buffer completed: {len(buffered_gdf)} features")
            return buffered_gdf

        except Exception as e:
            logger.error(f"Buffer operation failed: {e}")
            raise

    def to_geoparquet(self, table_name: str, output_path: Union[str, Path]) -> None:
        """Export table to GeoParquet format.

        Args:
            table_name: Name of the table to export
            output_path: Output file path
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if not hasattr(self, '_data') or table_name not in self._data:
            raise ValueError(f"Table not found: {table_name}")

        try:
            gdf = self._data[table_name]
            gdf.to_parquet(output_path)
            logger.info(f"Exported {table_name} to {output_path}")

        except Exception as e:
            logger.error(f"Export failed: {e}")
            raise

    def execute_spatial_sql(self, sql_query: str) -> Any:
        """Execute a spatial SQL query.

        Args:
            sql_query: SQL query with spatial functions

        Returns:
            Query result
        """
        logger.info(f"Executing spatial SQL: {sql_query[:100]}...")

        # TODO: Implement SedonaDB SQL execution
        # For now, return a simple result
        logger.warning("SedonaDB SQL not yet implemented, returning placeholder")
        return None

    def get_table_info(self, table_name: str) -> Dict:
        """Get information about a loaded table.

        Args:
            table_name: Name of the table

        Returns:
            Dictionary with table information
        """
        if not hasattr(self, '_data') or table_name not in self._data:
            return {"error": f"Table not found: {table_name}"}

        gdf = self._data[table_name]

        return {
            "table_name": table_name,
            "num_features": len(gdf),
            "columns": list(gdf.columns),
            "crs": str(gdf.crs),
            "geometry_types": gdf.geometry.geom_type.value_counts().to_dict(),
            "bounds": gdf.total_bounds.tolist() if not gdf.empty else None
        }