# Project Context

## Purpose
This repository provides a comprehensive collection of project templates and boilerplates for different programming languages, frameworks, and architectures. The goal is to accelerate development by providing well-structured, production-ready starting points that include modern tooling, testing setups, and best practices for various technology stacks.

## Tech Stack

### Repository Level
- **Node.js** - Package management and build tooling
- **TypeScript** - Type-safe development
- **Husky** - Git hooks management
- **Commitlint** - Conventional commit enforcement
- **npm** - Package manager

### Template Categories
- **Node.js**: CLI apps, Express servers, NestJS projects, Puppeteer automation
- **Frontend**: React, HTML templates, Map libraries (MapLibre, Mapbox), chatbots
- **Python**: CLI apps (Click + Pydantic), FastAPI, OSM geodata processing
- **Go**: CLI and REST API applications
- **C++**: CLI and REST API applications, rendering (OpenGL, Metal, Vulkan, WebGPU)
- **Rust**: CLI and REST API applications
- **Bun**: CLI and REST API applications
- **Deno**: CLI and REST API applications
- **Data Processing**: OSM data, DuckDB, tiling systems
- **AI/Automation**: OpenAI/Claude integration, agentic frameworks, OpenRouter

### Key Libraries per Stack
- **Node.js CLI**: Commander.js, TypeScript, Vitest testing
- **Node.js Web**: Express, NestJS, Zod schemas, Vitest
- **Frontend**: React, Cypress (E2E), Lodash, templating engines
- **Python**: Click, Pydantic, FastAPI, Jupyter notebooks

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, proper typing throughout
- **JavaScript/TypeScript**: Use modern ES6+ syntax
- **Python**: Follow PEP 8, type hints with Pydantic
- **Go**: Follow standard Go conventions and gofmt
- **C++**: Modern C++ (17/20), RAII patterns
- **Rust**: Standard Rust conventions, clippy formatting
- **All templates**: Consistent README.md structure, proper licensing

### Architecture Patterns
- **CLI Applications**: Commander pattern, proper error handling, help system
- **REST APIs**: MVC or similar patterns, proper HTTP status codes, input validation
- **Frontend**: Component-based architecture, proper state management
- **Testing**: Unit tests + integration tests + E2E tests where applicable
- **Configuration**: Environment-based configuration, proper defaults
- **Documentation**: README with setup/usage, inline documentation where needed

### Testing Strategy
- **Unit Tests**: Core business logic, utilities, individual components
- **Integration Tests**: API endpoints, CLI commands, database interactions
- **E2E Tests**: Full workflow testing (especially for frontend templates)
- **Test Frameworks**: Vitest (Node.js), Jest (React), pytest (Python), standard testing libraries for other languages
- **Coverage Requirements**: Aim for >80% coverage where practical
- **Test Organization**: Separate test directories, clear naming conventions

### Git Workflow
- **Branching Strategy**: Main branch for stable releases, feature branches for development
- **Commit Convention**: Strict conventional commits enforced via Commitlint
  - `feat:` - New features/templates
  - `fix:` - Bug fixes
  - `docs:` - Documentation updates
  - `style:` - Code formatting/linting
  - `refactor:` - Code refactoring
  - `test:` - Test additions/updates
  - `build:` - Build system changes
  - `chore:` - Maintenance tasks
- **Pre-commit Hooks**: Husky managed, ensure code quality and commit message format
- **Pull Requests**: Code review required for all non-trivial changes

## Domain Context

This project targets developers who need quick, reliable starting points for various types of applications. The templates should:

1. **Be Production-Ready**: Include proper error handling, logging, configuration management
2. **Follow Best Practices**: Modern language features, security considerations, performance optimizations
3. **Be Extensible**: Clean architecture that allows easy customization and feature addition
4. **Include Tooling**: Pre-configured build systems, testing frameworks, CI/CD setup where appropriate
5. **Be Well-Documented**: Clear setup instructions and usage examples

Each template should be self-contained and immediately usable after standard setup (npm install, pip install, etc.).

## Important Constraints

### Technical Constraints
- **Node.js Version**: Templates should target modern Node.js (18+)
- **Browser Support**: Frontend templates should support modern browsers (ES2020+)
- **Python Version**: Target Python 3.10+ for modern features and compatibility
- **Language Versions**: Use stable, recent versions of all languages
- **Security**: No hardcoded secrets, proper input validation, dependency scanning
- **Performance**: Templates should be reasonably performant for their intended use case

### Design Constraints
- **Simplicity**: Templates should be minimal but functional
- **Consistency**: Similar structure across related templates
- **Documentation**: Every template must have comprehensive README
- **Testing**: All templates must include basic test setup
- **License**: MIT license for maximum compatibility

### Maintainability Constraints
- **Dependencies**: Minimize external dependencies where possible
- **Updates**: Regular template updates for security and compatibility
- **Compatibility**: Ensure templates work across major operating systems
- **Version Control**: Clear versioning strategy for templates

## External Dependencies

### Development Tools
- **Git**: Version control
- **Node.js/npm**: Primary package management and build system
- **TypeScript**: Type checking and compilation
- **Husky**: Git hooks management
- **Commitlint**: Commit message validation

### Testing Dependencies
- **Vitest**: Modern JavaScript/TypeScript testing
- **Jest**: React testing framework
- **Cypress**: End-to-end testing for frontend
- **pytest**: Python testing framework
- **Standard testing libraries** for other languages

### Template-Specific Dependencies
- **Web Frameworks**: Express, NestJS, FastAPI, etc.
- **CLI Libraries**: Commander.js, Click, etc.
- **Validation**: Zod, Pydantic, etc.
- **Frontend**: React, MapLibre, Mapbox, etc.
- **AI Integration**: OpenAI SDK, Anthropic SDK, OpenRouter APIs
- **Data Processing**: DuckDB, OSM tools
- **Build Tools**: TypeScript compiler, bundlers, etc.

### Documentation Dependencies
- **Markdown**: For README files and inline documentation
- **License headers**: Standard MIT license text
