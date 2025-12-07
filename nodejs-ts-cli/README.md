# Node.js TypeScript CLI Template

A modern Node.js CLI template using TypeScript, Vitest, and Commander.js. This template provides a well-structured starting point for TypeScript CLI applications with proper testing, type safety, and project organization.

## Features

- Fast Development: TypeScript with ts-node for quick iteration
- Comprehensive Testing: Unit and E2E tests using Vitest
- Type Safety: Full TypeScript support with strict type checking
- CLI Framework: Built with Commander.js for excellent UX
- Modern Tooling: Latest Node.js and TypeScript features

## Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- npm (comes with Node.js)

### Installation

1. Clone or download this template
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Usage

Run the CLI with npm scripts or directly:

```bash
# Run hello world command
npm start

# Or directly with ts-node
npx ts-node bin/cli.ts
```

## Available Commands

The template includes a simple hello world command as a starting point. Expand it by adding more commands to `bin/cli.ts`.

### Default Command
Prints "hello world" to the console.

```bash
nodejs-ts-cli
```

### `help`
Get help for commands.

```bash
nodejs-ts-cli --help
```

## Development

### Project Structure

```
nodejs-ts-cli/
├── package.json           # Project configuration and dependencies
├── README.md             # This file
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore patterns
├── bin/                 # CLI entry point
│   └── cli.ts           # Commander.js-based CLI
├── src/                 # Source code directory
│   ├── main.ts          # Main business logic
│   └── main.test.ts     # Unit tests for main module
└── e2e-test/            # End-to-end tests
    └── cli.e2e.test.ts  # Full CLI e2e tests
```

### Available Scripts

- `npm start` - Run the CLI
- `npm test` - Run all tests with Vitest
- `npm run build` - Compile TypeScript to JavaScript

### Testing

The template includes two levels of testing:

1. **Unit Tests** (`src/*.test.ts`): Test individual functions and modules
2. **E2E Tests** (`e2e-test/`): Test full CLI execution

Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Configuration

#### package.json

The project configuration is defined in `package.json`:

- **Dependencies**: commander, @commander-js/extra-typings
- **Dev dependencies**: typescript, ts-node, vitest, @types/node
- **Scripts**: build, test, and more

#### TypeScript Configuration

The template uses strict TypeScript settings in `tsconfig.json` for maximum type safety:
- Strict mode enabled
- Target ES2020 for modern features
- CommonJS module system for Node.js compatibility

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Build the project: `npm run build`
6. Commit your changes: `git commit`
7. Push to the branch: `git push origin feature-name`
8. Open a pull request

## Best Practices Used

- **Type Safety**: Full TypeScript with strict mode for compile-time error checking
- **Testing**: Unit and E2E testing strategy with Vitest
- **Code Organization**: Clear separation of concerns (CLI, business logic)
- **Error Handling**: Proper exception handling with exit codes
- **Modern Node.js**: Uses modern JavaScript/TypeScript features

## Dependencies

### Runtime Dependencies

- **commander** (^14.0.2): Complete solution for Node.js command-line interfaces
- **@commander-js/extra-typings** (^14.0.0): Enhanced TypeScript support for Commander.js

### Development Dependencies

- **typescript** (5.9): TypeScript compiler
- **ts-node** (^10.9.2): TypeScript execution environment for Node.js
- **vitest** (^1.6.0): Fast unit testing framework
- **@types/node** (^24.10.1): TypeScript definitions for Node.js

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Commander.js](https://github.com/tj/commander.js) for the excellent CLI framework
- [Vitest](https://vitest.dev/) for the fast testing framework
- [TypeScript](https://www.typescriptlang.org/) for type safety