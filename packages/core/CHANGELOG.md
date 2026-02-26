# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added
- Generic auth-state module with typed `AuthState` interface
- Tool helpers (`toolSuccess`, `toolError`, `withAuth`) for standardized MCP tool responses
- Tool registry with lazy-loading handler pattern and configurable log prefix
- API client factory (`createApiClient`) supporting configurable port, token endpoint, version headers
- Server bootstrap (`bootstrapServer`) for dual transport (stdio/HTTP+SSE) with health endpoint
- Full test suite for auth-state, tool-helpers, and api-client
