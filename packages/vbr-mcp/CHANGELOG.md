# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- TypeScript rewrite of entire codebase with strict type checking
- Shared VBR HTTP client (`vbr-client.ts`) replacing 11 copies of duplicated fetch logic
- Typed auth state module replacing `global.vbrAuth`
- Tool helpers for standardized response building and auth-gated handlers
- Lazy-loading tool registry — schemas loaded eagerly, handlers loaded on first invocation
- Dual transport support: stdio (default) and HTTP with StreamableHTTP
- Health endpoint (`/health`) for HTTP transport mode
- Environment-based credential configuration (`VBR_HOST`, `VBR_USERNAME`, `VBR_PASSWORD`)
- Configurable TLS verification via `VBR_REJECT_UNAUTHORIZED`
- Elicitation support for interactive credential prompting
- Push notifications via event polling (backup completed, malware detected, low repo space)
- Dockerfile with multi-stage build (Node 20 Alpine)
- docker-compose.yml with env_file support
- MCP Bundle manifest (`mcp.json`)
- ESLint configuration with TypeScript support
- Vitest test suite (unit + integration)
- GitHub Actions CI pipeline (typecheck, lint, test, build)
- This changelog

### Changed
- Pinned `@modelcontextprotocol/sdk` to `^1.12.1` (was `"latest"`)
- Removed `node-fetch` dependency (using Node 18+ built-in fetch)
- Auth tool reads credentials from environment variables, falling back to tool parameters

### Removed
- All original JavaScript source files (replaced by TypeScript in `src/`)
- `global.vbrAuth` global state pattern
- Hardcoded placeholder credentials
