# Change: Add Rust CLI Template

## Why
The project-templates collection lacks a Rust template, leaving developers without a production-ready starting point for Rust CLI applications.

## What Changes
- New `rust-cli/` directory with a complete Rust CLI template
- Uses `clap` for argument parsing, `clippy` for linting, and `rustfmt` for formatting
- Mirrors the structure of existing CLI templates (python-cli, bun-cli)
- Three-level testing: unit tests (inline in `lib.rs`), integration tests (`tests/`)
- Makefile with standard development commands matching project conventions
- Updated root `CLAUDE.md` and `README.md` to list the new template

## Impact
- Affected specs: rust-cli-template (new capability)
- Affected code: `rust-cli/` (new directory), `CLAUDE.md`, `README.md`
