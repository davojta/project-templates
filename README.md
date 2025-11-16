# project-templates

Set of templates to start from scratch for different languages and stacks.

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
