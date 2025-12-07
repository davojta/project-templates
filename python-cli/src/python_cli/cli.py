"""Click-based CLI entry point for the Python CLI application."""

import sys

import click

from python_cli.main import create_greeting, process_input


@click.group()
@click.version_option(version="0.1.0", prog_name="python-cli")
@click.pass_context
def cli(ctx: click.Context) -> None:
    """Python CLI Template - A modern Python CLI using click and pydantic."""
    ctx.ensure_object(dict)


@cli.command()
@click.option(
    "--name",
    "-n",
    type=str,
    help="Name to include in the greeting",
)
def hello(name: str | None) -> None:
    """Say hello to the world or to a specific person."""
    greeting = create_greeting(name)
    click.echo(greeting)


@cli.command()
@click.argument("input_text", type=str, required=False)
@click.option(
    "--uppercase",
    "-u",
    is_flag=True,
    help="Convert output to uppercase",
)
def process(input_text: str | None, uppercase: bool) -> None:
    """Process input text and return a formatted response."""
    if input_text is None:
        input_text = ""

    result = process_input(input_text)
    if uppercase:
        result = result.upper()

    click.echo(result)


@cli.command()
def version() -> None:
    """Show version information."""
    click.echo("python-cli version 0.1.0")


def main() -> None:
    """Main entry point for the CLI application."""
    try:
        cli()
    except click.ClickException as e:
        e.show()
        sys.exit(e.exit_code)
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
