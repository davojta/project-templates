# project-templates

Set of templates to start from scratch for different languages and stacks.

## Templates

### JavaScript/TypeScript

| Template | Type | Description |
|----------|------|-------------|
| [nodejs-ts-cli](./nodejs-ts-cli) | Node.js CLI | TypeScript CLI with Commander.js, Vitest testing, and strict type checking |
| [bun-cli](./bun-cli) | Bun CLI | Minimal Bun CLI with native argument parsing, Biome linting, and three testing levels |
| [fe-react-mbx-map](./fe-react-mbx-map) | React Frontend | Interactive map application with React 19, Vite, Mapbox GL JS, and Cypress E2E |
| [bun-api-fe-review-geojson](./bun-api-fe-review-geojson) | Full-Stack | GeoJSON review app with Hono API, React 19, SQLite, TanStack Router/Query, and Mapbox |

### Python

| Template | Type | Description |
|----------|------|-------------|
| [python-cli](./python-cli) | Python CLI | CLI with Click, Pydantic models, UV package manager, pytest, and ruff |
| [python-geo-cli](./python-geo-cli) | Geospatial CLI | Advanced spatial analysis with SedonaDB, QuackOSM, KeplerGL, GeoParquet, and H3 indexing |

### Common Features

All templates include:
- **Testing**: Unit, integration, and E2E test suites
- **Type Safety**: TypeScript strict mode or Python type hints with Pydantic
- **Code Quality**: Linting and formatting (ESLint, Biome, or ruff)
- **Modern Tooling**: Latest runtimes and package managers (Bun, UV, Vite)

## Setup

This repository uses [Husky](https://typicode.github.io/husky/) and [Commitlint](https://commitlint.js.org/) to enforce conventional commit messages.

### Initial Setup

After cloning the repository, install the dependencies:

```bash
npm install
```

This will automatically set up Git hooks via Husky.

## Commit Message Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer]
```

### Valid Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semi-colons, etc)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or external dependencies
- `ci` - CI/CD changes
- `chore` - Other changes that don't modify src or test files
- `revert` - Revert a previous commit

### Examples

```bash
# Valid commits
git commit -m "feat: add nodejs-ts-cli template"
git commit -m "fix: resolve dependency issue in build script"
git commit -m "docs: update README with setup instructions"

# Invalid commits (will be rejected)
git commit -m "added new feature"
git commit -m "update readme"
```
