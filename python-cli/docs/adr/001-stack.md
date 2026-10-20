# ADR 001: Typer, pyright strict, unit + thin e2e

**Status:** Accepted · 2026-10-20

## Context

Click with unchecked hints; integration and e2e tests duplicated each other.

## Decision

- **Typer** (`Annotated` params): the signature is the CLI, so pyright checks what gets parsed. Rejected: Click (types written twice), argparse (untyped).
- **Pyright strict:** cheap now, hard to adopt later; handles Pydantic natively. Rejected: mypy (needs a plugin), ty (not mature yet).
- **No integration tests:** `cli.py` has no logic, so they duplicated e2e. E2E has one subprocess case per command/option; logic goes in unit tests.

## Consequences

- Keep logic out of `cli.py`. If it creeps in, test it with `CliRunner`, not subprocesses.
- No unexplained `# pyright: ignore`; don't relax strict mode.
- Help output is Rich-formatted, so assert on content, not layout.
