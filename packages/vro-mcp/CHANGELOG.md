# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added
- Initial release of VRO MCP server
- Shared core library integration via `@veeam-mcp/core`
- VRO API client with port 9898, `/api/token` auth, `/api/v7.21/` prefix
- 10 MCP tools: auth, list-plans, get-plan, run-readiness-check, get-runtime-status, trigger-failover, trigger-failback, list-recovery-locations, get-license-usage, list-scopes
- Confirmation-gated destructive operations (failover, failback)
- Dual transport support: stdio (default) and HTTP with StreamableHTTP
- Health endpoint (`/health`) for HTTP transport mode
- Environment-based credential configuration (`VRO_HOST`, `VRO_USERNAME`, `VRO_PASSWORD`)
- Configurable TLS verification via `VRO_REJECT_UNAUTHORIZED`
- Dockerfile with multi-stage build (Node 20 Alpine)
- docker-compose.yml with env_file support (port 3003)
- ESLint configuration with TypeScript support
- Vitest test suite
- This changelog
