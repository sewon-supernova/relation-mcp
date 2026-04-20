# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-04-20

### Added

- Initial public release.
- MCP server (stdio transport) exposing 9 tools covering ticket triage,
  internal records/comments, address-book lookup, and reference data
  (labels, users).
- Token-bucket rate limiter sized for the 60 req/min Re:lation tenant cap.
- Typed errors: `RelationApiError`, `RelationAuthError`, `RelationRateLimitError`.
- Zod-based input validation and config parsing.
- Vitest unit tests for config, client, and rate limiter.
- GitHub Actions CI (typecheck + test + build) and npm publish workflow.
