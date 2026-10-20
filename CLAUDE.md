# project-templates

Collection of starter templates for different languages and stacks.

## Templates

| Template | Type | Runtime |
|----------|------|---------|
| [bun-cli](./bun-cli) | CLI | Bun |
| [bun-api-fe-review-geojson](./bun-api-fe-review-geojson) | Full-Stack | Bun + React |
| [fe-react-mbx-map](./fe-react-mbx-map) | Frontend | Node.js + React |
| [nodejs-ts-cli](./nodejs-ts-cli) | CLI | Node.js |
| [python-cli](./python-cli) | CLI | Python / uv |
| [python-geo-cli](./python-geo-cli) | Geospatial CLI | Python / uv |
| [go-cli](./go-cli) | CLI | Go |
| [rust-cli](./rust-cli) | CLI | Rust / Cargo |

## Root Setup

```bash
npm install   # install Husky + Commitlint hooks
```

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Each template has its own `CLAUDE.md` with stack-specific commands and structure.
