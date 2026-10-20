# Architecture

> Stub: replace the example commands with your own as the project grows. Keep the layering rules.

## Overview

A small three-layer CLI. Dependencies go one way only:

```
cli.py  ──►  main.py  ──►  models.py
(I/O)        (logic)       (data)
```

Lower layers never import upper ones. `main.py` and `models.py` know nothing about Typer, so they can be unit-tested and reused without the CLI.

## Modules

### `src/python_cli/cli.py`: CLI layer

- Defines the Typer app `app` (with a `--version` callback) and the commands `hello`, `process`, `version`.
- Parses arguments and options, calls a function in `main.py`, and prints the result with `typer.echo`. Parameters are declared with `Annotated[...]` so the type hints drive parsing.
- `main()` is the entry point (registered as the `python-cli` script in `pyproject.toml`). It turns uncaught exceptions into a message on stderr and exit code 1.
- Contains no business logic.

### `src/python_cli/main.py`: business logic

- Pure functions that take plain values and return results (`create_greeting`, `process_input`).
- No I/O, no Typer, no `sys.exit`.
- New features usually start here.

### `src/python_cli/models.py`: data models

- Pydantic models (`Message`) that hold validated data and small behaviour tied to that data (`Message.greet`).
- Add a model when data has a shape worth validating or passing between functions.

### `src/python_cli/__init__.py`

- Package docstring and `__version__`.

## Request flow

```
$ python-cli hello --name Alice
  └─ cli.hello(name="Alice")
       └─ main.create_greeting("Alice")
            └─ models.Message(content=..., recipient="Alice").greet()
  ◄─ "hello world from Python CLI, Alice!"  →  typer.echo → stdout
```

## Testing

| Level | Location | What it covers | How |
|---|---|---|---|
| Unit | `tests/` | `main.py`, `models.py` | Import and call functions directly |
| E2E | `e2e-tests/` | Every command and option in `cli.py` | Run `python -m python_cli.cli` as a subprocess and check exit code, stdout, and stderr |

There is no separate integration level, and e2e is kept small. See [docs/adr/001-stack.md](docs/adr/001-stack.md).

## Adding a command

1. Add the logic as a function in `main.py` (and a model in `models.py` if needed), with unit tests in `tests/`.
2. Add a thin `@app.command()` in `cli.py` that calls it.
3. Add one e2e case per command/option to the parametrized table in `e2e-tests/test_cli_e2e.py`.
4. Run `make check` (ruff + pyright strict).
5. Document it in `README.md`.

## Open questions / TODO

- [ ] The version is duplicated in `pyproject.toml` and `__init__.py`; consider reading it from package metadata (`importlib.metadata.version`).
- [ ] Config file or environment variable support, if needed.
- [ ] Logging strategy (`--verbose` flag, log level).
