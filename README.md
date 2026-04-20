# relation-mcp

[![CI](https://github.com/sewon-supernova/relation-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/sewon-supernova/relation-mcp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/relation-mcp.svg)](https://www.npmjs.com/package/relation-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A [Model Context Protocol](https://modelcontextprotocol.io) server for **[Re:lation](https://ingage.jp/relation/)** (by 株式会社インゲージ). Lets Claude / Claude Code / any MCP client search and triage support tickets, create internal records, and inspect the address book directly from an agent.

> Works against the official Re:lation REST API (`https://<tenant>.relationapp.jp/api/v2/`). Read the full API reference at [developer.ingage.jp](https://developer.ingage.jp/).

## Features

- `search_tickets` — filter by status, assignee, labels, free-text query
- `get_ticket` / `update_ticket` — fetch detail, change status/assignee/labels
- `create_record` — post an internal 応対メモ (not visible to the customer)
- `create_comment` — post a team comment on a ticket
- `search_customers` / `get_customer` — address-book lookup
- `list_labels` / `list_users` — reference data for scripting automations
- Built-in token-bucket rate limiter (stays under the 60 req/min tenant limit)
- Typed errors (`RelationApiError`, `RelationAuthError`, `RelationRateLimitError`)

**Not included by design (v0.1):** customer-facing mail send / reply. Re:lation replies are high-stakes — this server is read + internal-write only for now. See [Roadmap](#roadmap).

## Install

```bash
npm install -g relation-mcp
# or run ad-hoc with npx
npx relation-mcp
```

## Configure

Generate an access token in Re:lation (admin UI → API token), then export:

```bash
export RELATION_SUBDOMAIN=yourtenant          # the part before .relationapp.jp
export RELATION_MESSAGE_BOX_ID=1              # default 受信箱 ID
export RELATION_ACCESS_TOKEN=your_token_here
```

A copy of `.env.example` is included for reference.

## Use with Claude Code / Claude Desktop

Add this to your MCP config (e.g. `~/.claude/config.json` or the Claude Desktop config):

```json
{
  "mcpServers": {
    "relation": {
      "command": "npx",
      "args": ["-y", "relation-mcp"],
      "env": {
        "RELATION_SUBDOMAIN": "yourtenant",
        "RELATION_MESSAGE_BOX_ID": "1",
        "RELATION_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

Then prompt the agent:

> Find tickets where status is open and the subject contains "本人確認", then summarize the top 5.

## Tool reference

All tools accept an optional `message_box_id` to override the default for a single call.

| Tool | Purpose |
|------|---------|
| `search_tickets` | `POST /tickets/search` — status, assignee, label, color, free text |
| `get_ticket` | `GET /tickets/{id}` |
| `update_ticket` | `PUT /tickets/{id}` — status, assignee, labels, color, pending reason |
| `create_record` | `POST /records` — internal 応対メモ |
| `create_comment` | `POST /comments` — internal team comment |
| `search_customers` | `POST /customers/search` — address-book search |
| `get_customer` | `GET /customers/{id}` |
| `list_labels` | `GET /labels` |
| `list_users` | `GET /users` |

## Development

```bash
git clone https://github.com/sewon-supernova/relation-mcp.git
cd relation-mcp
npm install
npm run typecheck
npm test
npm run build
```

Run locally against a real tenant:

```bash
cp .env.example .env   # fill in values
npm run build
node dist/index.js     # speaks MCP over stdio
```

## Roadmap

- [ ] `reply_mail` (customer-facing) — off by default, opt-in via env flag
- [ ] `list_message_boxes`
- [ ] `list_pending_reasons` / `list_case_categories`
- [ ] Pagination helpers (auto-iterate `page`)
- [ ] Prompt templates (MCP `prompts/*`) for common triage flows
- [ ] E2E tests against a staging tenant
- [ ] Docker image

## License

[MIT](LICENSE) — see full text.

## Not affiliated with 株式会社インゲージ

This is an unofficial, community-maintained client. "Re:lation" and "relationapp.jp" are trademarks of their respective owners.
