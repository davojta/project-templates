"""Visualization commands using KeplerGL."""

import json
from pathlib import Path

import click
from rich.console import Console

from ..viz import create_map

console = Console()
app = click.Group(help="Create visualizations with KeplerGL")


@app.command()
@click.option(
    "--input",
    required=True,
    type=click.Path(exists=True),
    help="Input GeoJSON or GeoParquet file"
)
@click.option(
    "--output",
    type=click.Path(),
    default="output-map/visualization.html",
    help="Output HTML file path"
)
@click.option(
    "--basemap",
    type=click.Choice(["streets", "outdoor"]),
    default="streets",
    help="Mapbox basemap style"
)
@click.option(
    "--h3-resolution",
    type=int,
    default=9,
    help="H3 index resolution (0-15, default 9 ~174m)"
)
@click.option(
    "--title",
    default="Geospatial Visualization",
    help="Map title"
)
def map(
    input: str,
    output: str,
    basemap: str,
    h3_resolution: int,
    title: str
):
    """Create an interactive map with H3 index layer."""
    input_path = Path(input)
    output_path = Path(output)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    console.print(f"[bold blue]🗺️  Creating visualization[/bold blue]")
    console.print(f"  Input: {input_path}")
    console.print(f"  Output: {output_path}")
    console.print(f"  Basemap: {basemap}")
    console.print(f"  H3 resolution: {h3_resolution}")

    try:
        with console.status("[bold green]Generating map with H3 index...", spinner="dots"):
            create_map(
                source=input_path,
                output_path=output_path,
                basemap=basemap,
                h3_resolution=h3_resolution,
                title=title
            )

    except Exception as e:
        console.print(f"[red]Visualization failed: {e}[/red]")
        raise click.Abort()

    console.print(f"[green]✅ Visualization created: {output_path}[/green]")


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


