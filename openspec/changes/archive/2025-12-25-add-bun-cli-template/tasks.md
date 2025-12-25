# Implementation Tasks

## 1. Project Setup

- [x] 1.1 Create `bun-cli/` directory
- [x] 1.2 Create `package.json` with scripts (test, lint, format)
- [x] 1.3 Create `tsconfig.json` for TypeScript configuration
- [x] 1.4 Create `biome.json` for linting and formatting
- [x] 1.5 Run `bun install` to generate lockfile

## 2. Core Implementation

- [x] 2.1 Create `src/main.ts` with `greet()` function
- [x] 2.2 Create `src/cli.ts` with Bun.argv parsing
- [x] 2.3 Add `--name` option and `--help` flag support

## 3. Unit Tests

- [x] 3.1 Create `src/main.test.ts`
- [x] 3.2 Test `greet()` with default name
- [x] 3.3 Test `greet()` with custom name

## 4. Integration Tests

- [x] 4.1 Create `integration-tests/cli.test.ts`
- [x] 4.2 Test CLI argument parsing
- [x] 4.3 Test help flag output

## 5. E2E Tests

- [x] 5.1 Create `e2e-tests/cli.e2e.test.ts`
- [x] 5.2 Test CLI execution via `Bun.spawn()`
- [x] 5.3 Test output matches expected format

## 6. Documentation

- [x] 6.1 Create `README.md` with installation instructions
- [x] 6.2 Add usage examples
- [x] 6.3 Document available scripts

## 7. Validation

- [x] 7.1 Run `bun test` to verify all tests pass
- [x] 7.2 Run `bun run lint` to verify linting
- [x] 7.3 Run `bun run format` to verify formatting
