# ADR 001: Typer, pyright strict, unit + thin e2e tests

- **Status:** Accepted
- **Date:** 2026-10-20

## Context

- Click repeated parameter types in decorators and signatures, and nothing checked that the two agreed.
- Type hints were never checked.
- Integration and e2e tests ran the same subprocess with the same assertions.

## Decision

**Typer** with `Annotated[...]` params: the function signature is the CLI definition, so pyright checks the types the CLI parses. Built on Click, so it's low risk.
- Rejected: Click (the duplication above), argparse (`Namespace` is untyped).

**Pyright, strict** in `make check` and CI. Strict mode is cheap now and hard to adopt later. It understands Pydantic models (`dataclass_transform`) without a plugin.
- Rejected: mypy (slower, needs the Pydantic plugin), ty (not mature yet; revisit).

**Unit + thin e2e, no integration tests.** `cli.py` has no logic, so there is nothing between unit and e2e to integrate.
- Unit tests cover all logic and edge cases.
- E2E is one subprocess case per command/option, to prove the wiring only. Subprocess tests are slow and their failures are vague.

## Consequences

- `# pyright: ignore` needs a reason. Don't relax strict mode.
- Logic must stay out of `cli.py`. If that ever fails, add in-process tests with `typer.testing.CliRunner`. Don't add a subprocess integration layer back.
- Help output is Rich-formatted. Assert on content, not layout.
- Typer adds `rich` and `shellingham` as runtime dependencies.
