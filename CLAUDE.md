<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

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