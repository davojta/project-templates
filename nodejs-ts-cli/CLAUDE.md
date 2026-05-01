# Project: nodejs-ts-cli

Node.js CLI template using TypeScript and Commander.js.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript (strict mode)
- **CLI Framework**: Commander.js + @commander-js/extra-typings
- **Testing**: Vitest
- **Execution**: ts-node

## Commands

```bash
npm start           # Run the CLI (ts-node bin/cli.ts)
npm test            # Run all tests (unit + e2e)
npm run build       # Compile TypeScript to JavaScript
```

## Project Structure

```
nodejs-ts-cli/
├── bin/
│   └── cli.ts             # Commander.js CLI entry point
├── src/
│   ├── main.ts            # Business logic
│   └── main.test.ts       # Unit tests
├── e2e-test/
│   └── cli.e2e.test.ts    # Full CLI execution tests
├── integration-tests/     # Integration tests
├── tsconfig.json
└── package.json
```

## Validation

```bash
# After each non-trivial edit
npm test

# Before committing
npm run build
```
