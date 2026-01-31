# Phase 1: Event Capture Infrastructure - Context

**Gathered:** 2025-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

A Claude Code hook that captures tool events, filters sensitive data, and POSTs to Convex. This is invisible infrastructure — no UI. The hook runs locally on the developer's machine and feeds the downstream live feed.

</domain>

<decisions>
## Implementation Decisions

### Event Granularity
- Capture ALL tool calls (Read, Write, Edit, Bash, Glob, Grep, WebFetch, etc.)
- Include full tool outputs (file contents, command results) — can limit/summarize downstream
- Capture Claude's text responses between tool calls (shows the "why")
- Capture user prompts (shows what was asked)

### Secret Filtering
- When secrets detected: redact in place + add flag so viewers know something was removed
- Standard secret patterns: API keys, tokens, passwords, AWS keys, private keys
- Blocklist files that should never send contents: .env, credentials.json, *.pem, etc.

### Project Detection
- Derive project name from working directory name
- **Opt-in model**: Only broadcast from directories that have a config file
- Config file name: `.agentstype.json`
- Config file can override auto-detected project name

### Error Handling
- Silent fail if Convex unreachable — don't interrupt Claude's workflow
- Run asynchronously (fire-and-forget) — never block Claude
- Silent fail on hook script crash — broadcasting is optional, not critical

### Claude's Discretion
- Blocklist configuration approach (hardcoded vs config file)
- HTTP timeout duration
- Specific secret detection regex patterns
- Hook implementation details based on Claude Code hook capabilities

</decisions>

<specifics>
## Specific Ideas

- Research needed: What parameters are available when Claude Code hooks are triggered? The researcher should investigate hook event structure to understand what data is available.
- The hook should feel invisible — zero impact on normal Claude Code usage

</specifics>

<deferred>
## Deferred Ideas

- Home page design, styling, type — Phase 5 (Pages & Navigation)

</deferred>

---

*Phase: 01-event-capture-infrastructure*
*Context gathered: 2025-01-31*
