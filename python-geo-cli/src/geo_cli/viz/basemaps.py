"""Mapbox basemap configurations for KeplerGL visualization."""

BASEMAPS = {
    "streets": "mapbox://styles/mapbox/streets-v12",
    "outdoor": "mapbox://styles/mapbox/outdoors-v12",
}

DEFAULT_BASEMAP = "streets"


def get_basemap_style(name: str = DEFAULT_BASEMAP) -> str:
    """Get Mapbox basemap style URL by name.

    Args:
        name: Basemap name ('streets' or 'outdoor')

    Returns:
        Mapbox style URL

    Raises:
        ValueError: If basemap name is not recognized
    """
    if name not in BASEMAPS:
        available = ", ".join(BASEMAPS.keys())
        raise ValueError(f"Unknown basemap '{name}'. Available: {available}")
    return BASEMAPS[name]
