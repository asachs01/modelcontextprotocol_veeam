# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added
- Initial VSPC MCP server with 10 tools for Veeam Service Provider Console REST API (v3)
- `auth-vspc` tool for authenticating to VSPC via `/api/v3/token`
- `list-companies` tool for listing managed customer companies
- `get-company` tool for retrieving company details by UID
- `get-active-alarms` tool for listing active alarms across managed infrastructure
- `list-backup-servers` tool for listing managed backup servers
- `list-backup-jobs` tool for listing backup jobs across all managed customers
- `list-repositories` tool for listing backup repositories for capacity planning
- `get-company-usage` tool for storage quota and usage per company
- `get-license-usage` tool for license usage per organization for billing
- `list-protected-vms` tool for listing protected virtual machines
- Shared `@veeam-mcp/core` integration for API client, auth state, tool helpers, and server bootstrap
- VSPC-specific API client with port 1280, `x-client-version: 3.6` header, and `limit`/`offset` pagination
- Dual transport support: stdio (default) and HTTP with StreamableHTTP
- Environment-based credential configuration (`VSPC_HOST`, `VSPC_USERNAME`, `VSPC_PASSWORD`)
- Configurable TLS verification via `VSPC_REJECT_UNAUTHORIZED`
- Dockerfile with multi-stage build (Node 20 Alpine)
- docker-compose.yml with env_file support (port 3002)
- Vitest test suite (unit + integration)
- ESLint configuration with TypeScript support
- This changelog
