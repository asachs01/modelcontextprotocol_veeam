# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added
- Initial Veeam ONE MCP server implementation in TypeScript
- Shared VONE HTTP client (`vone-client.ts`) using `@veeam-mcp/core` API client factory
- Typed auth state module re-exported from core
- Tool helpers for standardized response building and auth-gated handlers
- Lazy-loading tool registry with 10 tools
- Dual transport support: stdio (default) and HTTP with StreamableHTTP
- Health endpoint (`/health`) for HTTP transport mode
- Environment-based credential configuration (`VONE_HOST`, `VONE_USERNAME`, `VONE_PASSWORD`)
- Configurable TLS verification via `VONE_REJECT_UNAUTHORIZED`
- Tools: auth-vone, get-vone-server-info, get-triggered-alarms, get-alarm-templates, resolve-alarms, get-vsphere-vms, get-vsphere-datastores, get-vbr-best-practices, get-vbr-repositories, get-license-usage
- Dockerfile with multi-stage build (Node 20 Alpine)
- docker-compose.yml with env_file support
- ESLint configuration with TypeScript support
- Vitest test suite (unit tests for client, auth, and triggered alarms)
- This changelog
