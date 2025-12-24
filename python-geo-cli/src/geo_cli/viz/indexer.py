"""H3 spatial indexing for geospatial data using SRAI."""

from typing import TYPE_CHECKING

import geopandas as gpd

if TYPE_CHECKING:
    pass


def create_h3_index(gdf: gpd.GeoDataFrame, resolution: int = 5) -> gpd.GeoDataFrame:
    """Create H3 index layer with feature counts from input GeoDataFrame.

    Args:
        gdf: Input GeoDataFrame with features to index
        resolution: H3 resolution (default 9, ~174m edge length)

    Returns:
        GeoDataFrame with H3 cells containing feature_count and normalized_count columns
    """
    from srai.joiners import IntersectionJoiner
    from srai.regionalizers import H3Regionalizer

    regionalizer = H3Regionalizer(resolution=resolution)
    joiner = IntersectionJoiner()

    regions = regionalizer.transform(gdf)
    joint = joiner.transform(regions, gdf)

    region_counts = joint.groupby(level="region_id").size()
    max_count = region_counts.max()
    normalized = region_counts / max_count if max_count > 0 else region_counts

    index_gdf = regions.copy()
    index_gdf["feature_count"] = index_gdf.index.map(region_counts).fillna(0).astype(int)
    index_gdf["normalized_count"] = index_gdf.index.map(normalized).fillna(0.0)

    index_gdf = index_gdf[index_gdf["feature_count"] > 0]

    return index_gdf
