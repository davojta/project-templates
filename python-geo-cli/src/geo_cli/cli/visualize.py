"""Visualization commands using KeplerGL."""

import click
from pathlib import Path
from typing import Optional, List
from rich.console import Console
import json
import pandas as pd
import geopandas as gpd

from ..utils.env import load_env, get_mapbox_token

# Load environment variables
load_env()

console = Console()
app = click.Group(help="Create visualizations with KeplerGL")


@app.command()
@click.option(
    "--input",
    required=True,
    type=click.Path(exists=True),
    help="Input GeoParquet file"
)
@click.option(
    "--output",
    type=click.Path(),
    default="output-map/visualization.html",
    help="Output HTML file path"
)
@click.option(
    "--color",
    default="#1f77b4",
    help="Color for visualization (hex code)"
)
@click.option(
    "--radius",
    type=float,
    default=10,
    help="Point radius in pixels"
)
@click.option(
    "--label-field",
    help="Field to use for labeling features"
)
@click.option(
    "--config",
    type=click.Path(exists=True),
    help="Optional KeplerGL configuration JSON file"
)
def map(
    input: str,
    output: str,
    color: str,
    radius: float,
    label_field: Optional[str],
    config: Optional[str]
):
    """Create an interactive map from spatial data."""
    input_path = Path(input)
    output_path = Path(output)

    # Create output directory if it doesn't exist
    output_path.parent.mkdir(parents=True, exist_ok=True)

    console.print(f"[bold blue]🗺️  Creating visualization[/bold blue]")
    console.print(f"  Input: {input_path}")
    console.print(f"  Output: {output_path}")

    try:
        with console.status("[bold green]Processing spatial data...", spinner="dots"):
            # Read the data
            gdf = gpd.read_parquet(input_path)

            # Ensure coordinates are in WGS84 for KeplerGL
            if gdf.crs != 'EPSG:4326':
                console.print("  [yellow]Reprojecting to EPSG:4326 for KeplerGL[/yellow]")
                gdf = gdf.to_crs('EPSG:4326')

        with console.status("[bold green]Generating KeplerGL map...", spinner="dots"):
            # Get Mapbox token
            mapbox_token = get_mapbox_token()
            if mapbox_token:
                console.print(f"  [green]✓ Using Mapbox token for enhanced basemaps[/green]")
            else:
                console.print(f"  [yellow]⚠ No Mapbox token found - using default basemaps[/yellow]")

            # Import KeplerGL
            from keplergl import KeplerGl

            # Create KeplerGL instance with Mapbox token
            kepler_map = KeplerGl(
                height=800,
                width=1200,
                show_header=True,
                show_info_panel=True,
                show_timeline=False
            )

            # Convert GeoDataFrame to DataFrame for KeplerGL
            df = pd.DataFrame(gdf.drop(columns='geometry'))

            # Add coordinates as separate columns using centroid for polygons
            if gdf.geometry.geom_type.iloc[0] == 'Point':
                df['longitude'] = gdf.geometry.x
                df['latitude'] = gdf.geometry.y
            else:
                # For polygons, use representative point which works better with geographic CRS
                df['longitude'] = gdf.geometry.representative_point().x
                df['latitude'] = gdf.geometry.representative_point().y

            # Add data to map
            kepler_map.add_data(
                data=df,
                name="Spatial Data"
            )

            # Load custom config if provided
            if config:
                with open(config, 'r') as f:
                    kepler_config = json.load(f)
                kepler_map.config = kepler_config

            # Calculate center and zoom for initial view
            bounds = gdf.total_bounds
            center_lat = (bounds[1] + bounds[3]) / 2
            center_lon = (bounds[0] + bounds[2]) / 2

            # Estimate appropriate zoom level based on bounds
            lat_diff = bounds[3] - bounds[1]
            lon_diff = bounds[2] - bounds[0]
            zoom = 10
            if lat_diff > 10 or lon_diff > 10:
                zoom = 5
            elif lat_diff > 1 or lon_diff > 1:
                zoom = 8
            elif lat_diff > 0.1 or lon_diff > 0.1:
                zoom = 12
            else:
                zoom = 15

            # Update map view
            current_config = kepler_map.config
            if 'config' in current_config and 'visState' in current_config['config']:
                current_config['config']['visState']['mapState'].update({
                    'latitude': center_lat,
                    'longitude': center_lon,
                    'zoom': zoom
                })

            # Apply color and styling if no custom config
            if not config:
                try:
                    layers = current_config['config']['visState']['layers']
                    if layers:
                        layers[0]['config']['visConfig'].update({
                            'color': [color],
                            'radius': radius,
                            'opacity': 0.8
                        })
                except (KeyError, IndexError, TypeError):
                    # If config structure is different, skip styling
                    pass

            # Save to HTML using KeplerGL's built-in method
            if config:
                kepler_map.save_to_html(
                    file_name=str(output_path),
                    config=kepler_map.config,
                    read_only=False
                )
            else:
                kepler_map.save_to_html(
                    file_name=str(output_path),
                    read_only=False
                )

    except Exception as e:
        console.print(f"[red]❌ Visualization failed: {e}[/red]")
        raise click.Abort()

    console.print(f"[green]✅ Visualization created: {output_path}[/green]")
    console.print(f"  Open the file in your browser to view the interactive map")


@app.command()
@click.option(
    "--output",
    type=click.Path(),
    default="kepler_config.json",
    help="Output configuration file"
)
@click.option(
    "--style",
    type=click.Choice(['light', 'dark', 'satellite']),
    default='light',
    help="Base map style"
)
def config(output: str, style: str):
    """Generate a KeplerGL configuration template."""
    output_path = Path(output)

    console.print(f"[bold blue]⚙️  Generating KeplerGL configuration[/bold blue]")

    # Create a basic configuration template
    config = {
        'version': 'v1',
        'config': {
            'visState': {
                'layers': [],
                'mapState': {
                    'latitude': 0,
                    'longitude': 0,
                    'zoom': 1,
                    'bearing': 0,
                    'pitch': 0
                },
                'mapStyle': {
                    'styleType': 'light' if style == 'light' else 'dark' if style == 'dark' else 'satellite'
                }
            }
        }
    }

    try:
        with open(output_path, 'w') as f:
            json.dump(config, f, indent=2)

        console.print(f"[green]✅ Configuration saved: {output_path}[/green]")
        console.print("  You can customize this file and use it with the 'map' command")

    except Exception as e:
        console.print(f"[red]❌ Configuration generation failed: {e}[/red]")
        raise click.Abort()


