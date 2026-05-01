## 1. Implementation

### File Structure for the Change
- [x] 1.1 Create `rust-cli/` directory with standard layout
- [x] 1.2 Create `rust-cli/src/main.rs` (clap CLI entry point)
- [x] 1.3 Create `rust-cli/src/lib.rs` (business logic + unit tests)
- [x] 1.4 Create `rust-cli/tests/integration_test.rs` (assert_cmd integration tests)
- [x] 1.5 Create `rust-cli/Cargo.toml`
- [x] 1.6 Create `rust-cli/Makefile`
- [x] 1.7 Create `rust-cli/README.md`
- [x] 1.8 Create `rust-cli/CLAUDE.md`
- [x] 1.9 Create `rust-cli/.gitignore`

### Core Implementation Tasks
- [x] 1.10 Implement `hello` subcommand with optional `--name` / `-n` flag
- [x] 1.11 Implement `process` subcommand with optional text input and `--uppercase` / `-u` flag
- [x] 1.12 Implement `version` subcommand
- [x] 1.13 Write unit tests covering all business-logic functions in `lib.rs`
- [x] 1.14 Write integration tests covering all CLI subcommands
- [x] 1.15 Verify `cargo build`, `cargo test`, `cargo clippy`, and `cargo fmt --check` pass

### Documentation
- [x] 1.16 Update root `CLAUDE.md` templates table to include `rust-cli`
- [x] 1.17 Update root `README.md` templates table to include `rust-cli`
