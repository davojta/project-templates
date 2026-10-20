# Architecture

> Stub: replace the example commands; keep the layering rules.

```
cli.py  ──►  main.py  ──►  models.py
(I/O)        (logic)       (data)
```

Imports go one way. Lower layers never import upper ones or Typer.

| Module | Owns | Must not |
|---|---|---|
| `cli.py` | Typer app, argument parsing, `typer.echo`, input validation, `main()` (exceptions → stderr, exit 1) | Contain logic |
| `main.py` | Pure functions: plain values in, results out | Do I/O, use Typer, call `sys.exit` |
| `models.py` | Pydantic models for data worth validating or passing between functions | Depend on the CLI |

**Adding a command:** function in `main.py` + unit test → thin `@app.command()` → one e2e row. Test strategy: [docs/adr/001-stack.md](docs/adr/001-stack.md).

## TODO

- [ ] Version is in both `pyproject.toml` and `__init__.py`; use `importlib.metadata.version`.
- [ ] Config / env var support, logging (`--verbose`), if needed.
