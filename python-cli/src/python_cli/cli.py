"""Typer-based CLI entry point for the Python CLI application."""

import sys
from typing import Annotated

import typer

from python_cli import __version__
from python_cli.main import create_greeting, process_input

app = typer.Typer(
    help="Python CLI Template - A modern Python CLI using typer and pydantic.",
    no_args_is_help=True,
    pretty_exceptions_enable=False,
)


def _version_callback(value: bool) -> None:
    if value:
        typer.echo(f"python-cli, version {__version__}")
        raise typer.Exit()


@app.callback()
def cli(
    version: Annotated[
        bool,
        typer.Option(
            "--version",
            callback=_version_callback,
            is_eager=True,
            help="Show the version and exit.",
        ),
    ] = False,
) -> None:
    """Python CLI Template - A modern Python CLI using typer and pydantic."""


@app.command()
def hello(
    name: Annotated[
        str | None,
        typer.Option("--name", "-n", help="Name to include in the greeting"),
    ] = None,
) -> None:
    """Say hello to the world or to a specific person."""
    typer.echo(create_greeting(name))


@app.command()
def process(
    input_text: Annotated[str, typer.Argument(help="Text to process")] = "",
    uppercase: Annotated[
        bool,
        typer.Option("--uppercase", "-u", help="Convert output to uppercase"),
    ] = False,
) -> None:
    """Process input text and return a formatted response."""
    result = process_input(input_text)
    if uppercase:
        result = result.upper()
    typer.echo(result)


@app.command()
def version() -> None:
    """Show version information."""
    typer.echo(f"python-cli version {__version__}")


def main() -> None:
    """Main entry point for the CLI application."""
    try:
        app()
    except Exception as e:
        typer.echo(f"Error: {e}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
