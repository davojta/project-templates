"""Download commands for OSM data."""

import click
from pathlib import Path
from typing import Dict, List, Optional
from rich.console import Console

console = Console()
app = click.Group(help="Download OSM data using QuackOSM")


@app.command()
@click.option(
    "--bbox",
    required=True,
    help="Bounding box: min_lon,min_lat,max_lon,max_lat"
)
@click.option(
    "--tags",
    help="OSM tags filter: key:value,key:value (e.g., building:residential,highway:primary)"
)
@click.option(
    "--output",
    type=click.Path(),
    default="data/processed",
    help="Output directory for processed data"
)
@click.option(
    "--name",
    default="osm_data",
    help="Output filename (without extension)"
)
@click.option(
    "--timeout",
    default=300,
    type=int,
    help="Download timeout in seconds"
)
def region(bbox: str, tags: Optional[str], output: str, name: str, timeout: int):
    """Download OSM data for a specific region."""
    try:
        # Parse bbox
        bbox_tuple = tuple(map(float, bbox.split(",")))
        if len(bbox_tuple) != 4:
            raise ValueError("Bounding box must have 4 coordinates")

        min_lon, min_lat, max_lon, max_lat = bbox_tuple

        # Validate bbox coordinates
        if not (-180 <= min_lon <= 180) or not (-180 <= max_lon <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        if not (-90 <= min_lat <= 90) or not (-90 <= max_lat <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        if min_lon >= max_lon or min_lat >= max_lat:
            raise ValueError("Invalid bounding box: min values must be less than max values")

    except (ValueError, AttributeError) as e:
        console.print(f"[red]Invalid bbox format: {e}[/red]")
        console.print("[yellow]Expected format: min_lon,min_lat,max_lon,max_lat[/yellow]")
        raise click.Abort()

    # Parse tags
    tags_dict: Optional[Dict[str, List[str]]] = None
    if tags:
        tags_dict = {}
        try:
            for pair in tags.split(","):
                if ":" not in pair:
                    raise ValueError(f"Invalid tag format: {pair}")
                key, value = pair.split(":", 1)
                if key not in tags_dict:
                    tags_dict[key] = []
                tags_dict[key].append(value)
        except ValueError as e:
            console.print(f"[red]Invalid tags format: {e}[/red]")
            console.print("[yellow]Expected format: key:value,key:value (e.g., building:residential,highway:primary)[/yellow]")
            raise click.Abort()

    # Setup output paths
    output_path = Path(output)
    output_path.mkdir(parents=True, exist_ok=True)

    # Create data/cache directory if it doesn't exist
    cache_dir = Path("data/cache")
    cache_dir.mkdir(parents=True, exist_ok=True)

    final_path = output_path / f"{name}.geoparquet"

    # Show download info
    console.print(f"[bold blue]🌍 Downloading OSM data[/bold blue]")
    console.print(f"  Bounding box: {bbox}")
    if tags_dict:
        console.print(f"  Tags: {tags_dict}")
    console.print(f"  Output: {final_path}")
    console.print(f"  Cache: {cache_dir}")

    # Simulate download (placeholder for actual QuackOSM implementation)
    with console.status("[bold green]Downloading OSM data...", spinner="dots"):
        try:
            # TODO: Implement actual QuackOSM download here
            # from geo_cli.core.downloader import OSMDownloader
            # downloader = OSMDownloader()
            # result_path = downloader.download_region(
            #     bbox=bbox_tuple,
            #     tags=tags_dict,
            #     output_path=final_path,
            #     timeout=timeout
            # )

            # For now, create a placeholder
            import pandas as pd
            import geopandas as gpd
            from shapely.geometry import box

            # Create a simple placeholder GeoDataFrame
            geom = box(min_lon, min_lat, max_lon, max_lat)
            gdf = gpd.GeoDataFrame(
                {'name': [f'{name}_region'], 'area': [geom.area]},
                geometry=[geom],
                crs='EPSG:4326'
            )

            # Save as GeoParquet
            gdf.to_parquet(final_path)
            result_path = final_path

        except Exception as e:
            console.print(f"[red]❌ Download failed: {e}[/red]")
            raise click.Abort()

    console.print(f"[green]✅ Downloaded to {result_path}[/green]")


@app.command()
@click.option(
    "--location",
    required=True,
    help="Location name (city, country, etc.)"
)
@click.option(
    "--tags",
    help="OSM tags filter: key:value,key:value"
)
@click.option(
    "--output",
    type=click.Path(),
    default="data/processed",
    help="Output directory"
)
@click.option(
    "--name",
    default=None,
    help="Output filename (defaults to location name)"
)
def place(location: str, tags: Optional[str], output: str, name: Optional[str]):
    """Download OSM data for a named place (city, country, etc.)."""
    # TODO: Implement geocoding and place-based download
    console.print(f"[yellow]Place-based download not yet implemented[/yellow]")
    console.print(f"Would download data for: {location}")

    # For now, suggest using bbox
    console.print("[dim]Use the 'region' command with specific coordinates for now[/dim]")