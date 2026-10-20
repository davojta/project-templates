# ADR 001: CLI stack — Typer, pyright, unit + thin e2e tests

- **Status:** Accepted
- **Date:** 2026-10-20

## Context

This template is a starting point for small-to-medium Python CLIs. It originally used Click with three test levels (unit, integration, e2e) and had no type checker. As a result:

- Click commands repeat each parameter's type in decorators (`type=str`, `is_flag=True`) and again in the function signature, and nothing checks that the two agree.
- Type hints were written but never checked, so they could quietly be wrong.
- The integration and e2e suites both ran the CLI as a subprocess and asserted the same output. Every CLI change meant updating two near-identical test files.

## Decision

### 1. Typer for the CLI layer

Use [Typer](https://typer.tiangolo.com/) with `Annotated[...]` parameters.

- **One source of truth.** The function signature *is* the CLI definition. `name: Annotated[str | None, typer.Option("--name", "-n")] = None` gives the option, its type, its default, and its help text in one place.
- **Works with the type checker.** Because parsing is driven by type hints, pyright checks the same types the CLI uses.
- **Low risk.** Typer is built on Click, so Click's behaviour, `CliRunner`, and the wider ecosystem are still available if needed.
- **Nicer defaults.** Rich-formatted help, shell completion (`--install-completion`), and less boilerplate.

Rejected alternatives:
- **Click**: mature, but the decorator-plus-signature duplication is what we want to get rid of.
- **argparse**: no dependency, but verbose and weakly typed (`Namespace` attributes are `Any`).

### 2. Pyright in strict mode

Use [pyright](https://github.com/microsoft/pyright) with `typeCheckingMode = "strict"`, run in `make check` and CI.

- **Hints are checked.** Unchecked type hints are only documentation; pyright makes them enforced contracts.
- **Strict from day one.** Strict mode is cheap on a small codebase and hard to switch on later. It catches unknown types, missing annotations, and unused variables.
- **Fast, good Pydantic support.** Pyright understands `dataclass_transform`, which Pydantic models use, so model constructors are type-checked.
- **No Node.js setup.** Installed as `pyright[nodejs]` so it runs from `uv` without a separate Node install.

Rejected alternatives:
- **mypy**: works, but slower, and Pydantic needs a plugin.
- **ty** (Astral): fits with uv and ruff, but was not yet mature enough to be the template default. Revisit later.

### 3. Unit tests + a thin e2e layer; no integration tests

| Level | What it tests | Size |
|---|---|---|
| Unit (`tests/`) | `main.py` / `models.py`: all logic and edge cases, called directly | Most tests live here |
| E2E (`e2e-tests/`) | The real CLI, run as a subprocess: one case per command/option | Small, parametrized smoke table |

**Why no integration level:** the architecture keeps `cli.py` as a thin adapter with no logic. It parses arguments, calls `main.py`, and prints. Between "the logic" and "the whole program" there is nothing left to integrate. The old integration tests ran the same subprocess with the same assertions as e2e, so they cost maintenance without catching anything new.

**Why e2e stays small:**
- Subprocess tests are slow (each starts a Python interpreter) and their failure messages are less precise than unit tests.
- Their job is to prove the *wiring*: the entry point starts, each command and option is registered and routed, output goes to stdout, and exit codes are right. One case per command/option is enough for that.
- Edge cases (empty input, whitespace, special characters) are pure logic and belong in fast unit tests.

## Consequences

- Adding a command means: a function in `main.py` plus unit tests, a thin `@app.command()` in `cli.py`, and one row in the e2e parametrized table.
- `make check` = ruff lint + ruff format check + pyright strict. CI runs the same.
- Code must type-check under strict mode. `# pyright: ignore` needs a comment explaining why (enforced in review; see `REVIEW.md`).
- Typer adds `rich` and `shellingham` as transitive runtime dependencies.
- Help output is Rich-formatted (boxed sections), so tests should check for content like command names, not exact layout.
- If `cli.py` ever gains real logic (config loading, I/O orchestration), first move it into `main.py`. If that isn't possible, reconsider an in-process test layer using `typer.testing.CliRunner`.
