"""Common spatial analysis operations."""

import warnings
from typing import Union, Optional, Dict, Any, List
import logging
from pathlib import Path

# Filter internal pyproj deprecation warning that we cannot fix
warnings.filterwarnings(
    "ignore",
    message="Conversion of an array with ndim > 0 to a scalar is deprecated",
    category=DeprecationWarning
)

logger = logging.getLogger(__name__)


class SpatialOperations:
    """Collection of common spatial analysis operations."""

    @staticmethod
    def calculate_area(
        geometry,
        unit: str = "square_meters"
    ) -> float:
        """Calculate the area of a geometry.

        Args:
            geometry: Shapely geometry object
            unit: Unit for area calculation

        Returns:
            Area in the specified unit
        """
        try:
            import pyproj
            from shapely.ops import transform

            if unit == "square_meters":
                # Project to an appropriate UTM zone for accurate area calculation
                if hasattr(geometry, 'centroid'):
                    centroid = geometry.centroid
                    # Extract scalar coordinates to avoid deprecation warning
                    centroid_x = float(centroid.x) if hasattr(centroid.x, 'item') else centroid.x
                    centroid_y = float(centroid.y) if hasattr(centroid.y, 'item') else centroid.y
                    utm_zone = int((centroid_x + 180) // 6) + 1
                    utm_crs = f"EPSG:{32600 + utm_zone}" if centroid_y >= 0 else f"EPSG:{32700 + utm_zone}"

                    wgs84 = pyproj.CRS("EPSG:4326")
                    utm = pyproj.CRS(utm_crs)

                    project = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True).transform
                    utm_geometry = transform(project, geometry)
                    return utm_geometry.area
                else:
                    return geometry.area

            elif unit == "square_kilometers":
                return SpatialOperations.calculate_area(geometry, "square_meters") / 1000000

            elif unit == "square_degrees":
                return geometry.area

            else:
                raise ValueError(f"Unsupported area unit: {unit}")

        except Exception as e:
            logger.error(f"Area calculation failed: {e}")
            raise

    @staticmethod
    def calculate_length(
        geometry,
        unit: str = "meters"
    ) -> float:
        """Calculate the length of a line geometry.

        Args:
            geometry: Shapely geometry object (LineString or MultiLineString)
            unit: Unit for length calculation

        Returns:
            Length in the specified unit
        """
        try:
            import pyproj
            from shapely.ops import transform

            if not hasattr(geometry, 'length'):
                raise ValueError("Geometry does not have length")

            if unit == "meters":
                # Project to an appropriate UTM zone for accurate length calculation
                if hasattr(geometry, 'centroid'):
                    centroid = geometry.centroid
                    # Extract scalar coordinates to avoid deprecation warning
                    centroid_x = float(centroid.x) if hasattr(centroid.x, 'item') else centroid.x
                    centroid_y = float(centroid.y) if hasattr(centroid.y, 'item') else centroid.y
                    utm_zone = int((centroid_x + 180) // 6) + 1
                    utm_crs = f"EPSG:{32600 + utm_zone}" if centroid_y >= 0 else f"EPSG:{32700 + utm_zone}"

                    wgs84 = pyproj.CRS("EPSG:4326")
                    utm = pyproj.CRS(utm_crs)

                    project = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True).transform
                    utm_geometry = transform(project, geometry)
                    return utm_geometry.length
                else:
                    return geometry.length

            elif unit == "kilometers":
                return SpatialOperations.calculate_length(geometry, "meters") / 1000

            elif unit == "degrees":
                return geometry.length

            else:
                raise ValueError(f"Unsupported length unit: {unit}")

        except Exception as e:
            logger.error(f"Length calculation failed: {e}")
            raise

    @staticmethod
    def point_in_polygon(point, polygon) -> bool:
        """Check if a point is within a polygon.

        Args:
            point: Point geometry or (x, y) tuple
            polygon: Polygon geometry

        Returns:
            True if point is within polygon
        """
        try:
            from shapely.geometry import Point

            if isinstance(point, tuple):
                point = Point(point)

            return point.within(polygon)

        except Exception as e:
            logger.error(f"Point in polygon check failed: {e}")
            raise

    @staticmethod
    def find_nearest_features(
        query_points,
        features,
        max_distance: Optional[float] = None,
        max_results: int = 5
    ) -> List[Dict]:
        """Find the nearest features to query points.

        Args:
            query_points: Points to query from
            features: Features to search within
            max_distance: Maximum search distance (in degrees)
            max_results: Maximum number of results per query point

        Returns:
            List of nearest feature dictionaries
        """
        try:
            from shapely.geometry import Point
            results = []

            for i, query_point in enumerate(query_points):
                if isinstance(query_point, tuple):
                    query_point = Point(query_point)

                nearest_features = []

                for j, feature in enumerate(features):
                    distance = query_point.distance(feature.geometry)

                    if max_distance is None or distance <= max_distance:
                        nearest_features.append({
                            'feature_index': j,
                            'distance': distance,
                            'feature': feature
                        })

                # Sort by distance and take top results
                nearest_features.sort(key=lambda x: x['distance'])
                nearest_features = nearest_features[:max_results]

                results.append({
                    'query_point_index': i,
                    'nearest_features': nearest_features
                })

            return results

        except Exception as e:
            logger.error(f"Nearest features search failed: {e}")
            raise

    @staticmethod
    def cluster_points(
        points,
        eps: float = 0.001,
        min_samples: int = 2
    ) -> Dict[str, Any]:
        """Cluster points using DBSCAN algorithm.

        Args:
            points: Points to cluster
            eps: Maximum distance between points in a cluster (in degrees)
            min_samples: Minimum number of points to form a cluster

        Returns:
            Dictionary with clustering results
        """
        try:
            import numpy as np
            from sklearn.cluster import DBSCAN
            from shapely.geometry import Point

            # Convert points to numpy array
            coords = np.array([(p.x if hasattr(p, 'x') else p[0],
                               p.y if hasattr(p, 'y') else p[1]) for p in points])

            # Perform clustering
            clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(coords)
            labels = clustering.labels_

            # Organize results
            clusters = {}
            noise_points = []

            for i, label in enumerate(labels):
                if label == -1:
                    noise_points.append(i)
                else:
                    if label not in clusters:
                        clusters[label] = []
                    clusters[label].append(i)

            return {
                'clusters': clusters,
                'noise_points': noise_points,
                'num_clusters': len(clusters),
                'num_noise_points': len(noise_points)
            }

        except ImportError:
            logger.warning("scikit-learn not available for clustering")
            return {
                'clusters': {},
                'noise_points': list(range(len(points))),
                'num_clusters': 0,
                'num_noise_points': len(points)
            }

        except Exception as e:
            logger.error(f"Clustering failed: {e}")
            raise

    @staticmethod
    def calculate_density(
        features,
        area: Optional[float] = None,
        unit: str = "features_per_sq_km"
    ) -> Dict[str, float]:
        """Calculate feature density.

        Args:
            features: Features to analyze
            area: Area of analysis region (in square units)
            unit: Unit for density calculation

        Returns:
            Dictionary with density metrics
        """
        try:
            from shapely.geometry import Point, Polygon, LineString

            num_features = len(features)

            if area is None:
                # Calculate area based on feature extent
                all_geometries = [f.geometry if hasattr(f, 'geometry') else f for f in features]

                if all_geometries:
                    import geopandas as gpd

                    # Create a GeoDataFrame to get bounds
                    gdf = gpd.GeoDataFrame(geometry=all_geometries, crs='EPSG:4326')

                    # Calculate bounding box area for point datasets
                    union_geom = gdf.geometry.union_all()

                    # If the union has no area (e.g., all points), use bounding box
                    if union_geom.area == 0:
                        bounds = gdf.total_bounds  # [minx, miny, maxx, maxy]
                        # Create a polygon from bounds
                        from shapely.geometry import Polygon
                        bbox_polygon = Polygon([
                            (bounds[0], bounds[1]),
                            (bounds[2], bounds[1]),
                            (bounds[2], bounds[3]),
                            (bounds[0], bounds[3]),
                            (bounds[0], bounds[1])
                        ])
                        area_geom = bbox_polygon
                    else:
                        area_geom = union_geom

                    # Calculate area in appropriate units
                    if unit == "features_per_sq_km":
                        area = SpatialOperations.calculate_area(area_geom, "square_kilometers")
                    elif unit == "features_per_sq_m":
                        area = SpatialOperations.calculate_area(area_geom, "square_meters")
                    elif unit == "features_per_sq_degree":
                        area = area_geom.area
                    else:
                        raise ValueError(f"Unsupported density unit: {unit}")
                else:
                    area = 0

            # Calculate density
            if area > 0:
                if unit == "features_per_sq_km":
                    density = num_features / area
                elif unit == "features_per_sq_m":
                    density = num_features / (area * 1000000)
                elif unit == "features_per_sq_degree":
                    density = num_features / area
                else:
                    raise ValueError(f"Unsupported density unit: {unit}")
            else:
                density = 0

            return {
                'num_features': num_features,
                'area': area,
                'density': density,
                'unit': unit
            }

        except Exception as e:
            logger.error(f"Density calculation failed: {e}")
            raise