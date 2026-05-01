# Change: Add Go CLI Template

## Why
The repository covers Node.js, Python, and Bun CLI templates but has no Go starter. Go is listed in `project.md` as a supported stack, and a Go CLI template gives developers a production-ready starting point that mirrors the structure of existing templates.

## What Changes
- New top-level directory `go-cli/` with a complete Go CLI template
- `go-cli/CLAUDE.md` — stack-specific commands and structure doc
- `go-cli/README.md` — setup and usage documentation
- `go-cli/go.mod` + `go.sum` — Go module definition
- `go-cli/Makefile` — common development tasks (run, test, lint, format)
- `go-cli/cmd/root.go` — Cobra-based CLI entry point with `--name` flag
- `go-cli/internal/greeting/` — business logic, separate from CLI wiring
- `go-cli/internal/greeting/greeting_test.go` — unit tests (standard `testing`)
- `go-cli/integration-tests/` — CLI argument-parsing integration tests
- `go-cli/e2e-tests/` — full subprocess E2E tests (exec the built binary)
- `.golangci.yml` — golangci-lint configuration
- Root `CLAUDE.md` table updated to include the new template
- Root `README.md` table updated to include the new template

## Impact
- Affected specs: `go-cli-template` (new capability)
- Affected code: root `README.md`, root `CLAUDE.md` template table
