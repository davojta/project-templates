## 1. Implementation

### File Structure
- [ ] 1.1 Create `go-cli/` directory at repo root
- [ ] 1.2 Create `go-cli/cmd/` for CLI entry point
- [ ] 1.3 Create `go-cli/internal/greeting/` for business logic
- [ ] 1.4 Create `go-cli/integration-tests/` for argument-parsing tests
- [ ] 1.5 Create `go-cli/e2e-tests/` for subprocess tests

### Go Module and Dependencies
- [ ] 1.6 Create `go-cli/go.mod` with module name and Go 1.22+
- [ ] 1.7 Add `github.com/spf13/cobra` dependency and run `go mod tidy` to generate `go.sum`

### CLI Entry Point
- [ ] 1.8 Create `go-cli/cmd/main.go` — program entry, calls `cmd.Execute()`
- [ ] 1.9 Create `go-cli/cmd/root.go` — Cobra root command with `--name` flag, delegates to `internal/greeting`

### Business Logic
- [ ] 1.10 Create `go-cli/internal/greeting/greeting.go` — `Greet(name string) string` function
- [ ] 1.11 Create `go-cli/internal/greeting/greeting_test.go` — unit tests for `Greet`

### Integration Tests
- [ ] 1.12 Create `go-cli/integration-tests/cli_test.go` — tests that invoke the Cobra command programmatically and assert output

### E2E Tests
- [ ] 1.13 Create `go-cli/e2e-tests/cli_e2e_test.go` — tests that `exec.Command` the compiled binary and assert stdout

### Code Quality Config
- [ ] 1.14 Create `go-cli/.golangci.yml` — golangci-lint configuration (enable `gofmt`, `govet`, `errcheck`, `staticcheck`)

### Makefile
- [ ] 1.15 Create `go-cli/Makefile` with targets:
  - `run-main` — `go run ./cmd/main.go`
  - `build` — `go build -o bin/go-cli ./cmd/main.go`
  - `run-test` — `go test ./internal/... -v -cover`
  - `run-integration-tests` — `go test ./integration-tests/... -v`
  - `run-e2e-tests` — build binary then `go test ./e2e-tests/... -v`
  - `run-all-tests` — all three test targets in sequence
  - `run-lint` — `golangci-lint run ./...`
  - `run-format` — `gofmt -w .`
  - `check` — lint + format check (CI target)

### Gitignore
- [ ] 1.16 Create `go-cli/.gitignore` — ignore `bin/`, build artifacts, and Go test caches

### Documentation
- [ ] 1.17 Create `go-cli/CLAUDE.md` — tech stack, all make commands, project structure tree
- [ ] 1.18 Create `go-cli/README.md` — prerequisites, installation, usage examples, available commands

### Root Files Update
- [ ] 1.19 Update root `README.md` template table to add `go-cli` row
- [ ] 1.20 Update root `CLAUDE.md` template table to add `go-cli` row

### Validation
- [ ] 1.21 Run `go build ./...` inside `go-cli/` — must succeed
- [ ] 1.22 Run `make run-all-tests` inside `go-cli/` — all tests must pass
- [ ] 1.23 Run `make run-lint` inside `go-cli/` — no lint errors
