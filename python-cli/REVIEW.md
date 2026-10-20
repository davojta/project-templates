# Review Rules

Rules for code review in this project. Linting and formatting are handled by ruff, and type errors by pyright in strict mode (both run in `make check`). Don't comment on anything those tools already enforce.

## Always flag

- **Logic in `cli.py`.** `cli.py` only parses arguments and prints results. Any branching, string building, or validation beyond Typer options belongs in `main.py` or `models.py`.
- **New CLI command or option without an e2e test.** Every command and every option (including short aliases like `-n`) needs a test in `e2e-tests/` that checks exit code and output.
- **New function in `main.py` / `models.py` without a unit test** in `tests/`.
- **Typer parameters declared the old way** (`name: str = typer.Option(...)`). Use `Annotated[str, typer.Option(...)]`.
- **Integration tests coming back.** This template uses only unit and e2e tests. Tests that run the CLI go in `e2e-tests/`; tests that import functions go in `tests/`. See [docs/adr/001-stack.md](docs/adr/001-stack.md).
- **Logic edge cases in e2e tests.** E2E is a thin smoke layer (one case per command/option). Edge cases belong in unit tests.
- **Missing type hints**, `Any` where a concrete type or Pydantic model would do, or `# type: ignore` / `# pyright: ignore` without a comment explaining why. Pyright runs in strict mode; don't relax it in `pyproject.toml` to get a change through.
- **Raw dicts crossing module boundaries** where a Pydantic model should be used.
- **`print()` instead of `typer.echo()`**, or errors written to stdout instead of stderr (`err=True`).
- **Swallowed exceptions** (bare `except:` or `except Exception: pass`). Users should get a non-zero exit code and a message on stderr.
- **Version drift.** The version lives in `pyproject.toml` and `src/python_cli/__init__.py` (`cli.py` reads `__version__`). Both must change together.
- **Dependency changes without an updated `uv.lock`.**
- **Hardcoded paths, or tests that depend on the caller's working directory** without setting it explicitly.

## Skip

- `uv.lock`: generated; only check that it changed together with `pyproject.toml`.
- Formatting, import order, and line length: ruff owns these.
- Docstring wording, unless it's wrong.
- `__init__.py` files that only hold a docstring or `__version__`.
- Template placeholder content (`hello`/`process` example commands, `Template Author` metadata) unless the change is about that content.
