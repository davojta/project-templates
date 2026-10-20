# Review Rules

ruff and pyright strict (`make check`) own formatting, lint, and types. Don't repeat them.

## Flag

- **Logic in `cli.py`.** It only parses, calls `main.py`, and prints.
- **Mutation or I/O in `main.py`.** Keep it pure.
- **Over-engineering:** speculative abstractions, single-implementation patterns, helpers extracted before the 3rd repeat.
- **Unrelated changes:** reformatting, renames, or cleanups outside the task. Ask to split them out.
- **Functions with more than ~2 arguments.** Group them into a Pydantic model.
- **Raw dicts crossing modules** where a model fits.
- **Missing tests:** a new function needs a unit test; a new command/option needs one e2e row.
- **Edge cases in e2e, or integration tests coming back.** See [ADR 001](docs/adr/001-stack.md).
- **Typer params without `Annotated`.**
- **Unexplained `# pyright: ignore`, or strict mode relaxed.**
- **`print()`, errors on stdout, or swallowed exceptions.**
- **Version changed** in only one of `pyproject.toml` / `__init__.py`.
- **`pyproject.toml` changed** without `uv.lock`.
- **Tests that depend on the caller's working directory.**

## Skip

- `uv.lock` contents.
- Docstring wording, unless it's wrong.
- Template placeholders (`hello`/`process`, `Template Author`) unless that's the change.
