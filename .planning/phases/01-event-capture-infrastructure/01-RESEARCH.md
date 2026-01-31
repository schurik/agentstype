# Phase 1: Event Capture Infrastructure - Research

**Researched:** 2025-01-31
**Domain:** Claude Code Hooks, Convex HTTP Actions, Secret Filtering
**Confidence:** HIGH

## Summary

This phase creates a Claude Code hook that captures tool events, filters sensitive data, and POSTs them to a Convex HTTP endpoint for real-time broadcasting. The implementation is well-defined with official documentation for all components.

Claude Code hooks are shell commands triggered at lifecycle points (PreToolUse, PostToolUse, SessionStart, etc.) that receive JSON on stdin. The hook script will parse events, filter secrets using regex patterns, and POST to Convex's HTTP Actions endpoint. Convex handles persistence and provides built-in real-time subscriptions to connected clients.

The existing `vibecraft-hook.sh` in the project serves as a proven reference implementation for the hook pattern, demonstrating event parsing, cross-platform compatibility, and async HTTP posting.

**Primary recommendation:** Build a bash hook script that captures all events, filters secrets with established regex patterns, and POSTs to a Convex httpAction endpoint. Use fire-and-forget HTTP calls to avoid blocking Claude's workflow.

## Standard Stack

### Core

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Bash script | N/A | Hook handler | Claude Code hooks execute shell commands, bash is universal |
| jq | latest | JSON parsing in hook | Required for parsing hook stdin JSON, standard CLI tool |
| curl | latest | HTTP POST | Fire-and-forget POST to Convex, built-in on most systems |
| Convex httpAction | ^1.31.6 | HTTP endpoint | Native Convex HTTP handlers, documented pattern |
| Convex mutations | ^1.31.6 | Event persistence | Type-safe database writes with real-time sync |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| perl/python3 | system | Timestamp generation | macOS fallback for millisecond timestamps (no `date +%N`) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Bash script | Node.js script | More complex setup, larger dependency, but easier JSON handling |
| jq | Built-in bash | jq is cleaner, more reliable for complex JSON |
| curl | wget | curl has better POST support, more common on macOS |

**Installation:**
```bash
# macOS
brew install jq

# Linux (Debian/Ubuntu)
apt-get install jq
```

## Architecture Patterns

### Recommended Project Structure
```
.claude/
  hooks/
    agentstype-hook.sh       # Main hook script
convex/
  http.ts                    # HTTP router with event endpoint
  events.ts                  # Event mutation and queries
  schema.ts                  # Event table schema
.agentstype.json             # Project config (opt-in marker)
```

### Pattern 1: Fire-and-Forget HTTP POST

**What:** POST events to Convex asynchronously without blocking Claude
**When to use:** Always - broadcasting is optional, must never interrupt workflow

**Example:**
```bash
# Source: Claude Code hooks best practices
if [ -n "$CURL" ]; then
  "$CURL" -s -X POST "$CONVEX_URL" \
    -H "Content-Type: application/json" \
    -d "$event_json" \
    --connect-timeout 1 \
    --max-time 2 \
    >/dev/null 2>&1 &
fi
```

### Pattern 2: Convex HTTP Action to Mutation

**What:** HTTP endpoint that validates and stores events via mutation
**When to use:** Receiving external webhooks/POSTs into Convex

**Example:**
```typescript
// Source: https://docs.convex.dev/functions/http-actions
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/event",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await request.json();
    await ctx.runMutation(internal.events.store, { event });
    return new Response(null, { status: 200 });
  }),
});

export default http;
```

### Pattern 3: Opt-In Project Detection

**What:** Only broadcast from directories with `.agentstype.json`
**When to use:** Implementing the opt-in model (per CONTEXT.md decision)

**Example:**
```bash
# Source: vibecraft-hook.sh pattern adapted
CONFIG_FILE="$cwd/.agentstype.json"
if [ ! -f "$CONFIG_FILE" ]; then
  exit 0  # Silent exit - not an agentstype project
fi

# Override project name if specified in config
PROJECT_NAME=$(jq -r '.projectName // empty' "$CONFIG_FILE")
if [ -z "$PROJECT_NAME" ]; then
  PROJECT_NAME=$(basename "$cwd")
fi
```

### Pattern 4: Secret Filtering with Regex

**What:** Redact sensitive patterns before sending events
**When to use:** Processing any tool output or file content

**Example:**
```bash
# Source: https://github.com/h33tlit/secret-regex-list
filter_secrets() {
  local content="$1"

  # AWS Access Key
  content=$(echo "$content" | sed -E 's/AKIA[0-9A-Z]{16}/[REDACTED_AWS_KEY]/g')

  # Generic API keys
  content=$(echo "$content" | sed -E 's/[a-zA-Z0-9_-]*[Aa][Pp][Ii][_-]?[Kk][Ee][Yy][a-zA-Z0-9_-]*[=:]["'"'"']?[a-zA-Z0-9_\-]{20,}["'"'"']?/[REDACTED_API_KEY]/g')

  # GitHub tokens
  content=$(echo "$content" | sed -E 's/ghp_[0-9a-zA-Z]{36}/[REDACTED_GITHUB_TOKEN]/g')

  echo "$content"
}
```

### Anti-Patterns to Avoid

- **Synchronous HTTP calls:** Never block Claude waiting for POST response
- **Failing loudly:** Hook errors should be silent - broadcasting is optional
- **Capturing without opt-in:** Only broadcast from configured projects
- **Sending raw file contents:** Always filter secrets before transmission
- **Complex hook logic:** Keep hook simple, move complexity to Convex

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secret detection | Custom regex | secrets-patterns-db patterns | 1600+ tested patterns, ReDoS-safe |
| JSON parsing in bash | grep/awk | jq | Reliable, handles escaping, nested objects |
| Real-time sync | WebSocket server | Convex subscriptions | Built-in, handles reconnection, scales |
| Cross-platform timestamps | bash date | perl/python3 fallback | macOS lacks `date +%N` |
| HTTP fire-and-forget | Complex async | `curl ... &` | Simple, works, no dependencies |

**Key insight:** The existing vibecraft-hook.sh demonstrates all the cross-platform edge cases already solved. Don't reinvent - adapt.

## Common Pitfalls

### Pitfall 1: Blocking Claude's Workflow

**What goes wrong:** Hook takes too long, Claude waits, user experience degraded
**Why it happens:** Synchronous HTTP calls without timeout, network issues
**How to avoid:**
- Always use `&` for background execution
- Set aggressive timeouts (`--connect-timeout 1 --max-time 2`)
- Redirect stdout/stderr to /dev/null
**Warning signs:** Noticeable delay after tool calls

### Pitfall 2: Missing jq in PATH

**What goes wrong:** Hook fails silently, no events captured
**Why it happens:** Hooks run with minimal PATH, jq not found
**How to avoid:**
- Expand PATH at script start with known locations
- Use `find_tool` pattern from vibecraft-hook.sh
- Provide clear error message if jq missing
**Warning signs:** Hook commands return "jq: command not found"

### Pitfall 3: Leaking Secrets in Tool Output

**What goes wrong:** Sensitive data broadcast to viewers
**Why it happens:** File reads, bash outputs can contain credentials
**How to avoid:**
- Filter ALL content with secret regex before JSON construction
- Blocklist entire files (.env, *.pem, credentials.json)
- Add `redacted: true` flag when filtering occurs
**Warning signs:** API keys visible in event viewer

### Pitfall 4: macOS Timestamp Issues

**What goes wrong:** Non-unique event IDs, duplicate detection fails
**Why it happens:** macOS `date` doesn't support nanoseconds
**How to avoid:** Use perl/python3 fallback for millisecond timestamps
**Warning signs:** Events have identical timestamps, collision errors

### Pitfall 5: CORS Errors on Convex HTTP Endpoint

**What goes wrong:** Browser rejects WebSocket connection
**Why it happens:** (Not applicable - hooks POST from CLI, not browser)
**Note:** For the HTTP endpoint receiving hook POSTs, CORS is irrelevant. Only the frontend needs CORS for direct Convex access (handled by Convex SDK).

## Code Examples

Verified patterns from official sources:

### Hook Script Structure

```bash
#!/bin/bash
# Source: Claude Code hooks reference + vibecraft-hook.sh
set -e

# 1. Expand PATH for tool discovery
KNOWN_PATHS=("/opt/homebrew/bin" "/usr/local/bin" "$HOME/.local/bin" "/usr/bin" "/bin")
for dir in "${KNOWN_PATHS[@]}"; do
  [ -d "$dir" ] && export PATH="$dir:$PATH"
done

# 2. Find required tools
JQ=$(command -v jq) || { echo "jq required" >&2; exit 1; }

# 3. Read JSON input from stdin
input=$(cat)

# 4. Extract common fields
hook_event_name=$(echo "$input" | "$JQ" -r '.hook_event_name // "unknown"')
session_id=$(echo "$input" | "$JQ" -r '.session_id // "unknown"')
cwd=$(echo "$input" | "$JQ" -r '.cwd // ""')

# 5. Check opt-in
if [ ! -f "$cwd/.agentstype.json" ]; then
  exit 0
fi

# 6. Process event (type-specific logic)
# 7. Filter secrets
# 8. POST to Convex (fire-and-forget)

exit 0
```

### Convex Schema Definition

```typescript
// Source: https://docs.convex.dev/database/schemas
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    // Identity
    eventId: v.string(),
    sessionId: v.string(),
    projectName: v.string(),

    // Event data
    type: v.string(),
    timestamp: v.number(),

    // Tool-specific (optional)
    tool: v.optional(v.string()),
    toolInput: v.optional(v.any()),
    toolOutput: v.optional(v.any()),

    // Content (optional)
    prompt: v.optional(v.string()),
    response: v.optional(v.string()),

    // Metadata
    cwd: v.optional(v.string()),
    redacted: v.optional(v.boolean()),
  })
    .index("by_project", ["projectName", "timestamp"])
    .index("by_session", ["sessionId", "timestamp"]),
});
```

### Convex HTTP Endpoint

```typescript
// Source: https://docs.convex.dev/functions/http-actions
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/event",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const event = await request.json();
      await ctx.runMutation(internal.events.store, event);
      return new Response(null, { status: 200 });
    } catch (error) {
      // Log but return 200 to not retry
      console.error("Event storage failed:", error);
      return new Response(null, { status: 200 });
    }
  }),
});

export default http;
```

### Secret Filtering Regex Patterns

```bash
# Source: https://github.com/h33tlit/secret-regex-list
# Key patterns to implement:

# AWS Access Key ID
AKIA[0-9A-Z]{16}

# AWS Secret Key (context-dependent)
[a-zA-Z0-9/+]{40}

# GitHub Personal Access Token
ghp_[0-9a-zA-Z]{36}

# GitHub OAuth Token
gho_[0-9a-zA-Z]{36}

# Google API Key
AIza[0-9A-Za-z\-_]{35}

# Slack Token
xox[pboa]-[0-9]{12}-[0-9]{12}-[0-9a-zA-Z]{24}

# Generic patterns
[pP][aA][sS][sS][wW][oO][rR][dD]\s*[=:]\s*["']?[^\s"']+
[tT][oO][kK][eE][nN]\s*[=:]\s*["']?[^\s"']+
[sS][eE][cC][rR][eE][tT]\s*[=:]\s*["']?[^\s"']+

# Private keys
-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----
```

### File Blocklist Check

```bash
# Source: CONTEXT.md decisions
BLOCKED_FILES=(".env" ".env.local" ".env.production" "credentials.json" "secrets.json")
BLOCKED_EXTENSIONS=(".pem" ".key" ".p12" ".pfx")

should_block_file() {
  local filepath="$1"
  local filename=$(basename "$filepath")
  local extension="${filename##*.}"

  for blocked in "${BLOCKED_FILES[@]}"; do
    if [[ "$filename" == "$blocked" ]]; then
      return 0  # Block
    fi
  done

  for ext in "${BLOCKED_EXTENSIONS[@]}"; do
    if [[ ".$extension" == "$ext" ]]; then
      return 0  # Block
    fi
  done

  return 1  # Allow
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual polling | Convex subscriptions | Native feature | Real-time updates without custom WebSocket |
| Exit code only | JSON output | Claude Code v2.0 | Structured hook responses possible |
| Input modification blocked | updatedInput field | v2.0.10 | Hooks can modify tool inputs |

**Deprecated/outdated:**
- `decision` field in PreToolUse: Use `hookSpecificOutput.permissionDecision` instead
- `approve`/`block` values: Use `allow`/`deny` instead

## Open Questions

1. **Convex Deployment URL**
   - What we know: HTTP actions deploy to `https://<deployment>.convex.site`
   - What's unclear: How to get deployment URL in hook at runtime
   - Recommendation: Require URL in `.agentstype.json` config file

2. **Event Volume Limits**
   - What we know: Convex has generous limits, no hard documentation on events/second
   - What's unclear: Rate limiting behavior under heavy tool use
   - Recommendation: Implement client-side throttling if issues arise

3. **Large Tool Outputs**
   - What we know: Some tool outputs (file reads) can be very large
   - What's unclear: Optimal truncation strategy
   - Recommendation: Truncate at 10KB, add `truncated: true` flag

## Sources

### Primary (HIGH confidence)
- Claude Code Hooks Reference: https://code.claude.com/docs/en/hooks - Complete event schemas, JSON formats
- Convex HTTP Actions: https://docs.convex.dev/functions/http-actions - Endpoint patterns
- Convex Schemas: https://docs.convex.dev/database/schemas - Schema definition

### Secondary (MEDIUM confidence)
- Secret Regex List: https://github.com/h33tlit/secret-regex-list - Tested patterns
- secrets-patterns-db: https://github.com/mazen160/secrets-patterns-db - 1600+ patterns

### Tertiary (LOW confidence)
- WebSearch results for bash async patterns - Community practices

### Project Reference
- vibecraft-hook.sh in project root - Proven implementation pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation for all components
- Architecture: HIGH - Follows documented Convex and Claude Code patterns
- Pitfalls: HIGH - Based on official troubleshooting guides and existing hook implementation

**Research date:** 2025-01-31
**Valid until:** 2025-03-01 (stable - Claude Code hooks and Convex are mature)
