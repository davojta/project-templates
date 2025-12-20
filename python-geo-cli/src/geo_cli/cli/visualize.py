"""Visualization commands using KeplerGL."""

import click
from pathlib import Path
from typing import Optional, List
from rich.console import Console
import json

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
    default="visualization.html",
    help="Output HTML file"
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

    console.print(f"[bold blue]🗺️  Creating visualization[/bold blue]")
    console.print(f"  Input: {input_path}")
    console.print(f"  Output: {output_path}")

    try:
        with console.status("[bold green]Processing spatial data...", spinner="dots"):
            import geopandas as gpd

            # Read the data
            gdf = gpd.read_parquet(input_path)

            # Ensure coordinates are in WGS84 for KeplerGL
            if gdf.crs != 'EPSG:4326':
                console.print("  [yellow]Reprojecting to EPSG:4326 for KeplerGL[/yellow]")
                gdf = gdf.to_crs('EPSG:4326')

            # Convert to GeoJSON
            geojson = json.loads(gdf.to_json())

            # Calculate center
            bounds = gdf.total_bounds
            center_lat = (bounds[1] + bounds[3]) / 2
            center_lon = (bounds[0] + bounds[2]) / 2

        with console.status("[bold green]Generating KeplerGL map...", spinner="dots"):
            # Load custom config if provided
            kepler_config = None
            if config:
                with open(config, 'r') as f:
                    kepler_config = json.load(f)

            # Create visualization
            viz_data = create_kepler_visualization(
                geojson=geojson,
                center_lat=center_lat,
                center_lon=center_lon,
                color=color,
                radius=radius,
                label_field=label_field,
                config=kepler_config
            )

            # Generate HTML
            html_content = generate_kepler_html(viz_data, title="Geospatial Visualization")

            # Write HTML file
            with open(output_path, 'w') as f:
                f.write(html_content)

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


def create_kepler_visualization(
    geojson: dict,
    center_lat: float,
    center_lon: float,
    color: str = "#1f77b4",
    radius: float = 10,
    label_field: Optional[str] = None,
    config: Optional[dict] = None
) -> dict:
    """Create KeplerGL visualization data."""
    # Default configuration
    default_config = {
        'version': 'v1',
        'config': {
            'visState': {
                'layers': [
                    {
                        'id': 'data_layer',
                        'type': 'geojson',
                        'config': {
                            'dataId': 'data',
                            'label': 'Spatial Data',
                            'color': [color],
                            'columns': {},
                            'isVisible': True,
                            'visConfig': {
                                'opacity': 0.8,
                                'strokeOpacity': 0.8,
                                'thickness': 0.5,
                                'strokeColor': [255, 255, 255],
                                'colorRange': {
                                    'name': 'Global Warming',
                                    'type': 'sequential',
                                    'category': 'Uber',
                                    'colors': ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                                },
                                'radius': radius
                            }
                        },
                        'visualChannels': {
                            'colorField': None,
                            'sizeField': None
                        }
                    }
                ],
                'mapState': {
                    'latitude': center_lat,
                    'longitude': center_lon,
                    'zoom': 10,
                    'bearing': 0,
                    'pitch': 0
                },
                'mapStyle': {
                    'styleType': 'light'
                }
            }
        }
    }

    # Merge with custom config if provided
    if config:
        kepler_config = config
        # Update map state to center on our data
        if 'config' in kepler_config and 'visState' in kepler_config['config']:
            kepler_config['config']['visState']['mapState'].update({
                'latitude': center_lat,
                'longitude': center_lon,
                'zoom': 10
            })
    else:
        kepler_config = default_config

    return {
        'datasets': [
            {
                'info': {
                    'id': 'data',
                    'label': 'Spatial Data'
                },
                'data': geojson
            }
        ],
        'config': kepler_config['config']
    }


def generate_kepler_html(viz_data: dict, title: str = "Geospatial Visualization") -> str:
    """Generate HTML file for KeplerGL visualization."""
    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <title>{title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }}
        .container {{
            width: 100vw;
            height: 100vh;
        }}
        .header {{
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }}
    </style>
    <script src="https://unpkg.com/kepler.gl@latest/umd/keplergl.min.js"></script>
</head>
<body>
    <div class="header">
        <h3>{title}</h3>
        <p>Interactive map powered by KeplerGL</p>
    </div>
    <div class="container" id="map-container"></div>

    <script>
        const data = {json.dumps(viz_data)};

        const keplergl = new keplergl.KeplerGl({{
            "mapboxApiAccessToken": null, // Use mapbox style without token
            "id": "map"
        }});

        keplergl.loadMap(data);

        // Add to container
        document.getElementById('map-container').appendChild(keplergl.container);
    </script>
</body>
</html>
"""
    return html_template