# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added

- Initial release of Kasten K10 MCP server
- Authentication via kubeconfig (`auth-k10` tool)
- Application discovery (`list-applications` tool)
- Compliance reporting (`get-compliance` tool)
- Policy management (`list-policies`, `run-policy` tools)
- Backup operations (`backup-application` tool)
- Restore operations (`restore-application`, `list-restore-points` tools)
- Action status tracking (`get-action-status` tool)
- Location profile listing (`list-profiles` tool)
- Multi-cluster listing (`list-clusters` tool)
- Dual transport support (stdio and HTTP) via `@veeam-mcp/core`
- Docker and docker-compose support
