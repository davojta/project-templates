"""Processing commands for spatial operations."""

import warnings
import click
from pathlib import Path
from typing import Optional
from rich.console import Console

# Filter internal pyproj deprecation warning that we cannot fix
warnings.filterwarnings(
    "ignore",
    message="Conversion of an array with ndim > 0 to a scalar is deprecated",
    category=DeprecationWarning
)

console = Console()
app = click.Group(help="Process spatial data with SedonaDB")


@app.command()
@click.option(
    "--input",
    required=True,
    type=click.Path(exists=True),
    help="Input GeoParquet file"
)
@click.option(
    "--operation",
    required=True,
    type=click.Choice(['buffer', 'intersection', 'union', 'spatial-join']),
    help="Spatial operation to perform"
)
@click.option(
    "--distance",
    type=float,
    help="Distance in meters for buffer operation"
)
@click.option(
    "--other",
    type=click.Path(exists=True),
    help="Other dataset for spatial operations requiring two datasets"
)
@click.option(
    "--output",
    type=click.Path(),
    default="data/processed",
    help="Output directory"
)
@click.option(
    "--name",
    default="processed_data",
    help="Output filename (without extension)"
)
def spatial(
    input: str,
    operation: str,
    distance: Optional[float],
    other: Optional[str],
    output: str,
    name: str
):
    """Perform spatial operations on GeoParquet data."""
    input_path = Path(input)
    output_path = Path(output)
    output_path.mkdir(parents=True, exist_ok=True)
    final_path = output_path / f"{name}.geoparquet"

    console.print(f"[bold blue]🔧 Processing spatial data[/bold blue]")
    console.print(f"  Input: {input_path}")
    console.print(f"  Operation: {operation}")
    console.print(f"  Output: {final_path}")

    # Validate operation requirements
    if operation == 'buffer' and distance is None:
        console.print("[red]❌ Buffer operation requires --distance parameter[/red]")
        raise click.Abort()

    if operation in ['intersection', 'union', 'spatial-join'] and other is None:
        console.print(f"[red]❌ {operation} operation requires --other dataset[/red]")
        raise click.Abort()

    try:
        with console.status(f"[bold green]Performing {operation}...", spinner="dots"):
            # TODO: Implement actual SedonaDB operations here
            # from geo_cli.core.processor import SedonaProcessor
            # from geo_cli.core.spatial_ops import SpatialOperations

            # processor = SedonaProcessor()
            # processor.load_geoparquet(input_path, "input_table")

            # if operation == 'buffer':
            #     result = processor.buffer("input_table", distance)
            # elif operation == 'intersection':
            #     processor.load_geoparquet(other, "other_table")
            #     result = processor.intersection("input_table", "other_table")
            # # ... other operations

            # processor.to_geoparquet("result", final_path)

            # For now, create a placeholder result
            import geopandas as gpd
            import pandas as pd

            # Read input data
            gdf = gpd.read_parquet(input_path)

            # Perform simple operation based on type
            if operation == 'buffer':
                # Buffer operation with proper CRS handling
                result_gdf = gdf.copy()

                # Check if we need to reproject for accurate buffering
                if gdf.crs and gdf.crs.is_geographic:
                    # Project to UTM for accurate distance calculations
                    import pyproj

                    # Calculate UTM zone from centroid
                    centroid = gdf.geometry.union_all().centroid
                    # Extract scalar coordinates to avoid deprecation warning
                    centroid_x = float(centroid.x) if hasattr(centroid.x, 'item') else centroid.x
                    centroid_y = float(centroid.y) if hasattr(centroid.y, 'item') else centroid.y
                    utm_zone = int((centroid_x + 180) // 6) + 1
                    utm_crs = f"EPSG:{32600 + utm_zone}" if centroid_y >= 0 else f"EPSG:{32700 + utm_zone}"

                    # Reproject, buffer, and reproject back
                    gdf_projected = gdf.to_crs(utm_crs)
                    result_gdf.geometry = gdf_projected.geometry.buffer(distance).to_crs(gdf.crs)
                else:
                    # Already in a projected CRS, buffer directly
                    result_gdf.geometry = gdf.geometry.buffer(distance)
            else:
                # For other operations, just copy the input
                result_gdf = gdf.copy()

            # Save result
            result_gdf.to_parquet(final_path)

    except Exception as e:
        console.print(f"[red]❌ Processing failed: {e}[/red]")
        raise click.Abort()

    console.print(f"[green]✅ Processing completed: {final_path}[/green]")


@app.command()
@click.option(
    "--input",
    required=True,
    type=click.Path(exists=True),
    help="Input GeoParquet file"
)
@click.option(
    "--crs",
    required=True,
    help="Target CRS (e.g., EPSG:3857)"
)
@click.option(
    "--output",
    type=click.Path(),
    default="data/processed",
    help="Output directory"
)
@click.option(
    "--name",
    default="reprojected_data",
    help="Output filename (without extension)"
)
def reproject(input: str, crs: str, output: str, name: str):
    """Reproject spatial data to a different coordinate reference system."""
    input_path = Path(input)
    output_path = Path(output)
    output_path.mkdir(parents=True, exist_ok=True)
    final_path = output_path / f"{name}.geoparquet"

    console.print(f"[bold blue]🔄 Reprojecting data[/bold blue]")
    console.print(f"  Input: {input_path}")
    console.print(f"  Target CRS: {crs}")
    console.print(f"  Output: {final_path}")

    try:
        with console.status("[bold green]Reprojecting...", spinner="dots"):
            import geopandas as gpd

            # Read and reproject
            gdf = gpd.read_parquet(input_path)
            console.print(f"  Source CRS: {gdf.crs}")

            result_gdf = gdf.to_crs(crs)
            result_gdf.to_parquet(final_path)

    except Exception as e:
        console.print(f"[red]❌ Reprojection failed: {e}[/red]")
        raise click.Abort()

    console.print(f"[green]✅ Reprojection completed: {final_path}[/green]")


@app.command()
@click.option(
    "--input",
    required=True,
    type=click.Path(exists=True),
    help="Input GeoParquet file"
)
def info(input: str):
    """Show information about a spatial dataset."""
    input_path = Path(input)

    try:
        import geopandas as gpd

        gdf = gpd.read_parquet(input_path)

        console.print(f"[bold blue]📊 Dataset Information[/bold blue]")
        console.print(f"  File: {input_path}")
        console.print(f"  Rows: {len(gdf):,}")
        console.print(f"  Columns: {list(gdf.columns)}")
        console.print(f"  CRS: {gdf.crs}")
        console.print(f"  Geometry types: {gdf.geometry.geom_type.value_counts().to_dict()}")

        if not gdf.empty:
            bounds = gdf.total_bounds
            console.print(f"  Bounds: [{bounds[0]:.4f}, {bounds[1]:.4f}, {bounds[2]:.4f}, {bounds[3]:.4f}]")

            # Sample a few rows
            console.print(f"  Sample data:")
            console.print(gdf.head(3).to_string())

    except Exception as e:
        console.print(f"[red]❌ Failed to read file: {e}[/red]")
        raise click.Abort()