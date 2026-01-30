# Pitfalls Research

**Domain:** Real-time live feed with Claude Code hooks event capture
**Researched:** 2026-01-31
**Confidence:** HIGH (verified against existing hook implementation + established patterns)

## Critical Pitfalls

### Pitfall 1: Hook Blocking Claude Code Sessions

**What goes wrong:**
The hook script performs synchronous work (HTTP requests, heavy JSON parsing, file I/O) that blocks Claude Code's main process. When the hook exceeds the timeout window, Claude Code may abort the hook or experience degraded responsiveness. Users perceive this as "Claude being slow" without understanding the hook is the cause.

**Why it happens:**
Developers treat the hook like a normal script rather than an interrupt handler. The existing `vibecraft-hook.sh` has mitigations (curl with `--connect-timeout 1 --max-time 2` run in background), but failures in the jq parsing or transcript file reads happen synchronously and can accumulate latency.

**How to avoid:**
- All network operations must be fire-and-forget with aggressive timeouts (current: 1s connect, 2s max)
- Consider moving all processing to a separate daemon process; hook only writes raw event to a local Unix socket or FIFO
- Set explicit timeout on transcript file reads (`timeout` command or read with deadline)
- Test hook performance under load: simulate 100+ rapid tool calls and measure p99 latency

**Warning signs:**
- Users report Claude Code feels sluggish after enabling the hook
- Events appear in feed with increasing delays
- Hook process occasionally appears in `ps` output longer than expected
- Timeout errors in Claude Code logs

**Phase to address:**
Phase 1 (Hook Infrastructure) - Critical to get right before building dependent systems

---

### Pitfall 2: Secrets Leaking into Public Feed

**What goes wrong:**
Tool inputs and outputs contain API keys, tokens, passwords, and credentials that flow unfiltered into Convex and display on the public portfolio site. Once in Convex, data is difficult to purge. A single leak can compromise production systems.

**Why it happens:**
- Regex-only detection misses 50%+ of secrets (custom formats, non-standard tokens)
- Filter runs after data already in memory/logs
- "I'll add filtering later" becomes "we shipped with no filtering"
- Tool responses contain full file contents which may include `.env` files or config with secrets

**How to avoid:**
- Filter at the hook level BEFORE data leaves local machine (add to `vibecraft-hook.sh`)
- Use multi-layered detection: regex patterns + entropy analysis + keyword context
- Maintain explicit allowlist of safe fields rather than blocklist of dangerous ones
- Redact aggressively by default (`toolInput.content`, `toolResponse.content` for Read/Write tools)
- NEVER store raw `tool_response` for file-reading tools - extract only safe metadata

**Warning signs:**
- Review hook output and see values that "look like" secrets
- High entropy strings appearing in feed
- Fields like `password`, `token`, `key`, `secret`, `credential` in event data
- User complaints about sensitive data exposure

**Phase to address:**
Phase 1 (Hook Infrastructure) - Must be in place before ANY data flows to Convex

---

### Pitfall 3: Transcript File Race Conditions

**What goes wrong:**
The hook reads Claude Code's transcript file (`tail -30 "$transcript_path"`) while Claude Code is actively writing to it. This causes:
- Partial JSON parsing failures
- Reading stale data (last write not yet flushed)
- Corrupted reads when write happens mid-read
- Inconsistent event data across hook invocations

**Why it happens:**
- No file locking coordination between Claude Code and the hook
- Transcript file grows continuously; hook reads arbitrary tail
- Claude Code may buffer writes; visible file state lags actual state
- jq silently returns empty on parse errors (current: `|| echo ""`)

**How to avoid:**
- Treat transcript reads as best-effort enrichment, not required data
- Use `flock` or similar file locking if transcript parsing is critical
- Add retry logic with exponential backoff for parse failures
- Consider reading tool context from hook input directly rather than transcript
- Log parsing failures to detect systemic issues (don't just swallow errors)

**Warning signs:**
- `assistant_text` or `assistant_response` fields frequently empty
- jq errors in hook debug logs
- Inconsistent data between pre_tool_use and post_tool_use for same tool_use_id
- Events appear out of order

**Phase to address:**
Phase 1 (Hook Infrastructure) - Decide on transcript parsing strategy early

---

### Pitfall 4: Event Storm Overwhelming the UI

**What goes wrong:**
Rapid Claude Code activity (e.g., search operation touching 50 files) generates 50+ events in seconds. The feed becomes an unreadable blur. React re-renders thrash. Users can't follow what's happening. The "live feed" becomes white noise.

**Why it happens:**
- Every hook invocation creates an event (correct behavior for capture)
- No aggregation or batching between hook and UI
- React's default rendering tries to show every event immediately
- Convex subscriptions trigger on every document change

**How to avoid:**
- Implement event coalescing in the UI layer (batch updates within 100-200ms window)
- Add aggregation logic: "Read 47 files" instead of 47 separate read events
- Use virtualization (react-virtuoso) for feed rendering - only render visible items
- Debounce Convex subscription updates in the React client
- Consider "Smart Feed" mode that groups related events by tool_use_id or time window

**Warning signs:**
- Feed scrolls faster than human reading speed
- Browser performance degrades during active Claude sessions
- Users report "couldn't follow what happened"
- React DevTools shows excessive re-renders

**Phase to address:**
Phase 2 (UI Implementation) - Requires working event pipeline to test properly

---

### Pitfall 5: Convex Bandwidth Explosion from Full Payloads

**What goes wrong:**
Storing complete `toolInput` and `toolResponse` JSON causes Convex bandwidth costs to explode. A single Read tool response can contain 100KB+ of file content. Convex queries return full documents; queries listing events transmit entire payloads repeatedly.

**Why it happens:**
- Convex lacks SELECT - you get the whole document every time
- No column/field filtering at query level
- Real-time subscriptions resend full documents on any change
- Listing "last 50 events" means 50 full payloads transferred
- Developers store "everything" thinking they'll filter in the UI

**How to avoid:**
- Split event documents: metadata (small, queried often) vs. payload (large, fetched on demand)
- Store only summaries in the primary event table: `toolInput: { summary: "Reading /path/to/file.ts" }`
- Store full payloads in separate table, linked by ID, fetched only for detail view
- Index strategically to avoid full table scans
- Set explicit field size limits in schema validation

**Warning signs:**
- Convex billing spikes unexpectedly
- Dashboard slow to load
- Network tab shows large payload sizes for event queries
- "Database bandwidth" warnings in Convex dashboard

**Phase to address:**
Phase 1 (Data Model Design) - Schema decisions cascade to everything else

---

### Pitfall 6: Hook Failures Breaking Claude Code Sessions

**What goes wrong:**
An unhandled error in the hook script (missing jq, failed file access, malformed JSON) causes the hook to exit non-zero, which Claude Code interprets as "block the action." Users can't complete tasks because a portfolio feature broke their AI assistant.

**Why it happens:**
- `set -e` in shell scripts causes early exit on any error
- Missing error handling for edge cases (empty input, missing transcript, etc.)
- External dependencies (jq, curl) may not be installed or in PATH
- Network issues with WebSocket notification cause unexpected failures

**How to avoid:**
- The hook MUST always exit 0 (current implementation does this correctly)
- Wrap all potentially-failing operations in error handlers
- Log errors but don't propagate them
- Make every external dependency optional with graceful degradation
- Test hook behavior when: jq missing, curl timeout, transcript file locked, disk full

**Warning signs:**
- Users report Claude Code blocking unexpectedly
- Hook logs show error messages
- Events stop appearing in feed entirely
- Missing `jq` or `curl` errors in stderr

**Phase to address:**
Phase 1 (Hook Infrastructure) - Already partially addressed; needs comprehensive testing

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing full tool responses | Complete data capture | Bandwidth costs, slow queries | Never in production; OK for local dev |
| No secrets filtering | Simpler hook code | Security incidents, trust loss | Never |
| Synchronous HTTP in hook | Simpler architecture | Claude Code latency | Never |
| Polling instead of real-time | No WebSocket complexity | Stale data, higher server load | Only for initial prototype |
| Single event table | Simple schema | Query performance, bandwidth | OK for <1000 events total |
| No event aggregation | Shows all activity | Information overload | Only for debugging mode |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude Code Hooks | Blocking on external requests | Fire-and-forget with background processes |
| Convex Subscriptions | Subscribing to large result sets | Paginate, use indexes, limit fields |
| Transcript File Reads | Assuming file is always valid JSON | Handle parse failures gracefully |
| WebSocket Notifications | Hard-failing on connection errors | Retry with exponential backoff |
| Secrets Detection | Regex-only approach | Multi-layer: regex + entropy + context |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full document queries | Slow feed loads, high bandwidth | Document splitting, pagination | >100 events with full payloads |
| Unthrottled real-time updates | UI jank, dropped frames | Debounce/batch updates (100-200ms) | >10 events/second |
| No virtualization | Feed scroll stutters | react-virtuoso or react-window | >50 visible events |
| Single session view | All events in one query | Filter by sessionId with index | >5 concurrent sessions |
| Unbounded transcript reads | Slow hook, memory issues | Limit tail size, add timeout | Transcript >1MB |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing API keys from tool outputs | Credential exposure to public | Filter at hook level before Convex |
| Including file paths in events | Exposes directory structure | Anonymize paths or use relative paths |
| Storing user prompts verbatim | May contain secrets users typed | Apply same filtering to prompts |
| No rate limiting on event ingestion | Denial of service via rapid events | Implement per-session rate limits |
| Exposing session IDs publicly | Session hijacking potential | Use opaque display IDs, not internal IDs |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing every micro-event | Information overload, can't follow | Group/aggregate related events |
| Auto-scrolling feed | Loses context while reading | "New events" indicator, manual scroll |
| No event filtering | Noise drowns signal | Filter by event type, session, tool |
| Raw JSON display | Unreadable for non-developers | Human-readable summaries |
| No loading states | Feels broken during load | Skeleton screens, loading indicators |
| No empty states | Confusion when no activity | Clear "no events yet" message |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Event Capture:** Working locally but no secrets filtering - verify all sensitive patterns blocked
- [ ] **Feed Display:** Shows events but no virtualization - verify performance with 500+ events
- [ ] **Real-time Updates:** Works with single tab but race conditions with multiple - verify multi-client sync
- [ ] **Error Handling:** Happy path works but edge cases crash - verify behavior with malformed input
- [ ] **Session Filtering:** Filters work but no index - verify query performance at scale
- [ ] **Mobile Support:** Layout looks OK but touch targets wrong - verify on actual devices
- [ ] **Dark Mode:** Colors set but contrast issues - verify accessibility (WCAG AA)

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Secrets leaked to Convex | HIGH | Delete affected documents, rotate leaked credentials, notify if applicable |
| Bandwidth spike | MEDIUM | Implement document splitting, delete oversized historical events |
| Hook blocking Claude | LOW | Fix hook script, restart Claude Code sessions |
| UI performance issues | LOW | Add virtualization, implement batching |
| Race condition data corruption | MEDIUM | Add data validation, backfill missing fields |
| Event storm overwhelms UI | LOW | Add debouncing, implement aggregation |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Hook Blocking Claude | Phase 1: Hook Infrastructure | Measure hook execution time p95 <50ms |
| Secrets Leaking | Phase 1: Hook Infrastructure | Run test suite with known secret patterns |
| Transcript Race Conditions | Phase 1: Hook Infrastructure | Parse failure rate <1% in production |
| Event Storm Overwhelm | Phase 2: UI Implementation | Feed usable at 20 events/second |
| Convex Bandwidth Explosion | Phase 1: Data Model | Monitor bandwidth, set alerts at thresholds |
| Hook Failures | Phase 1: Hook Infrastructure | 100% hook completion rate in testing |

## Sources

- [Hookdeck: Webhooks at Scale](https://hookdeck.com/blog/webhooks-at-scale) - Retry patterns, DLQ strategies
- [Hookdeck: Why Stop Processing Webhooks Synchronously](https://hookdeck.com/webhooks/guides/why-you-should-stop-processing-your-webhooks-synchronously) - Async processing patterns
- [Convex: Queries That Scale](https://stack.convex.dev/queries-that-scale) - Index optimization
- [Convex: Query Performance](https://stack.convex.dev/convex-query-performance) - Bandwidth considerations
- [GitHub: Secrets Patterns DB](https://github.com/mazen160/secrets-patterns-db) - 1600+ regex patterns for secrets
- [GitGuardian: Secrets Detection](https://blog.gitguardian.com/secrets-in-source-code-episode-3-3-building-reliable-secrets-detection/) - Multi-layer detection approach
- [SuprSend: Activity Feed Best Practices](https://www.suprsend.com/post/activity-feed) - Aggregation, filtering, UX
- [GetStream: Activity Feed Design](https://getstream.io/blog/activity-feed-design/) - Visual hierarchy, user control
- [Red Hat: Bash Error Handling](https://www.redhat.com/en/blog/bash-error-handling) - Trap patterns, exit codes
- [CERT: File Race Conditions](https://wiki.sei.cmu.edu/confluence/x/RdUxBQ) - TOCTOU vulnerabilities

---
*Pitfalls research for: Real-time live feed with Claude Code hooks*
*Researched: 2026-01-31*
