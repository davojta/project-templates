"""Main CLI entry point for geospatial analysis tool."""

import warnings

# Filter internal pyproj deprecation warning that we cannot fix
warnings.filterwarnings(
    "ignore",
    message="Conversion of an array with ndim > 0 to a scalar is deprecated",
    category=DeprecationWarning
)

import click
from rich.console import Console

from geo_cli.cli import download, process, visualize

console = Console()
app = click.Group(
    help="Geospatial CLI for OSM data processing and analysis",
    context_settings=dict(help_option_names=["-h", "--help"])
)

# Add command groups
app.add_command(download.app, name="download")
app.add_command(process.app, name="process")
app.add_command(visualize.app, name="viz")


@app.command()
def version():
    """Show version information."""
    click.echo("geo-cli version 0.1.0")


@app.command()
def hello():
    """Simple hello world command for testing."""
    console.print("🌍 Hello from [bold blue]geo-cli[/bold blue]!")
    console.print("Modern geospatial analysis with SedonaDB, QuackOSM, and KeplerGL")


def main():
    """Main entry point for the CLI application."""
    try:
        app()
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise click.Abort()


if __name__ == "__main__":
    main()