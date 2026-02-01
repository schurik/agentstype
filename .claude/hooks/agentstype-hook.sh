#!/bin/bash
# AgentsType Hook - Captures Claude Code events for real-time live feed
#
# This script is called by Claude Code hooks and:
# 1. Checks if project is opt-in (has .agentstype.json)
# 2. Reads the hook input from stdin
# 3. Filters sensitive data (secrets, private keys, blocked files)
# 4. POSTs to configured Convex endpoint for live feed
#
# Installation: Add to .claude/settings.json hooks configuration
# Opt-in: Create .agentstype.json in project root with convexUrl

# =============================================================================
# Cross-Platform PATH Setup
# Hooks may run with a minimal PATH. Add common tool locations defensively.
# =============================================================================

KNOWN_PATHS=(
  "/opt/homebrew/bin"      # macOS Apple Silicon Homebrew
  "/usr/local/bin"         # macOS Intel Homebrew / Linux local
  "$HOME/.local/bin"       # User local bin
  "/usr/bin"               # System binaries
  "/bin"                   # Core binaries
)

for dir in "${KNOWN_PATHS[@]}"; do
  [ -d "$dir" ] && export PATH="$dir:$PATH"
done

# =============================================================================
# Tool Discovery
# Find required tools, searching known locations if not in PATH
# =============================================================================

find_tool() {
  local name="$1"

  # Check PATH first
  local found
  found=$(command -v "$name" 2>/dev/null)
  if [ -n "$found" ]; then
    echo "$found"
    return 0
  fi

  # Check known locations
  for dir in "${KNOWN_PATHS[@]}"; do
    if [ -x "$dir/$name" ]; then
      echo "$dir/$name"
      return 0
    fi
  done

  return 1
}

# Find required tools
JQ=$(find_tool "jq") || {
  # jq is required - exit silently (don't block Claude)
  exit 0
}

CURL=$(find_tool "curl") || {
  # curl is optional - just disable POST if not found
  CURL=""
}

# =============================================================================
# Read Input and Extract CWD
# =============================================================================

input=$(cat)

# Extract cwd first to check for opt-in config
cwd=$(echo "$input" | "$JQ" -r '.cwd // ""')

# =============================================================================
# Opt-In Check
# Only process events for projects with .agentstype.json
# =============================================================================

CONFIG_FILE="$cwd/.agentstype.json"

if [ ! -f "$CONFIG_FILE" ]; then
  # Not an agentstype project - exit silently
  exit 0
fi

# =============================================================================
# Load Configuration
# =============================================================================

CONVEX_URL=$("$JQ" -r '.convexUrl // ""' "$CONFIG_FILE")
PROJECT_NAME=$("$JQ" -r '.projectName // ""' "$CONFIG_FILE")

# convexUrl is required
if [ -z "$CONVEX_URL" ] || [ "$CONVEX_URL" = "null" ]; then
  exit 0
fi

# Default project name to directory basename
if [ -z "$PROJECT_NAME" ] || [ "$PROJECT_NAME" = "null" ]; then
  PROJECT_NAME=$(basename "$cwd")
fi

# =============================================================================
# Secret Filtering
# Redact sensitive patterns before transmission
# =============================================================================

# Global flag to track if any redaction occurred
REDACTED=false

filter_secrets() {
  local content="$1"
  local filtered="$content"
  local original="$content"

  # AWS Access Key ID
  filtered=$(echo "$filtered" | sed -E 's/AKIA[0-9A-Z]{16}/[REDACTED_AWS_KEY]/g')

  # GitHub tokens
  filtered=$(echo "$filtered" | sed -E 's/ghp_[0-9a-zA-Z]{36}/[REDACTED_GITHUB_TOKEN]/g')
  filtered=$(echo "$filtered" | sed -E 's/gho_[0-9a-zA-Z]{36}/[REDACTED_GITHUB_TOKEN]/g')

  # Google API Key
  filtered=$(echo "$filtered" | sed -E 's/AIza[0-9A-Za-z_-]{35}/[REDACTED_GOOGLE_KEY]/g')

  # Slack tokens
  filtered=$(echo "$filtered" | sed -E 's/xox[pboa]-[0-9]{12}-[0-9]{12}-[0-9a-zA-Z]{24}/[REDACTED_SLACK_TOKEN]/g')

  # Generic patterns (case insensitive)
  # Password assignments
  filtered=$(echo "$filtered" | sed -E 's/([pP][aA][sS][sS][wW][oO][rR][dD][[:space:]]*[=:][[:space:]]*["'"'"']?)[^[:space:]"'"'"']{8,}/\1[REDACTED_PASSWORD]/g')

  # Token assignments (20+ chars)
  filtered=$(echo "$filtered" | sed -E 's/([tT][oO][kK][eE][nN][[:space:]]*[=:][[:space:]]*["'"'"']?)[^[:space:]"'"'"']{20,}/\1[REDACTED_TOKEN]/g')

  # Secret assignments (20+ chars)
  filtered=$(echo "$filtered" | sed -E 's/([sS][eE][cC][rR][eE][tT][[:space:]]*[=:][[:space:]]*["'"'"']?)[^[:space:]"'"'"']{20,}/\1[REDACTED_SECRET]/g')

  # API key assignments (20+ chars)
  filtered=$(echo "$filtered" | sed -E 's/([aA][pP][iI][_-]?[kK][eE][yY][[:space:]]*[=:][[:space:]]*["'"'"']?)[^[:space:]"'"'"']{20,}/\1[REDACTED_API_KEY]/g')

  # Private keys
  filtered=$(echo "$filtered" | sed -E 's/-----BEGIN[^-]*PRIVATE KEY-----/[REDACTED_PRIVATE_KEY]/g')

  # Check if any redaction occurred
  if [ "$filtered" != "$original" ]; then
    REDACTED=true
  fi

  echo "$filtered"
}

# =============================================================================
# File Blocklist
# Block contents of sensitive files entirely
# =============================================================================

should_block_file() {
  local filepath="$1"
  local filename
  filename=$(basename "$filepath")
  local extension="${filename##*.}"

  # Blocked filenames
  case "$filename" in
    .env|.env.local|.env.production|.env.development|.env.staging)
      return 0
      ;;
    credentials.json|secrets.json|.secrets|.credentials)
      return 0
      ;;
  esac

  # Blocked extensions
  case ".$extension" in
    .pem|.key|.p12|.pfx|.keystore)
      return 0
      ;;
  esac

  return 1
}

# Filter tool input/output, blocking file contents when needed
filter_tool_data() {
  local json_data="$1"
  local tool_name="$2"

  # For file read/write operations, check if file should be blocked
  if [ "$tool_name" = "Read" ] || [ "$tool_name" = "Write" ]; then
    local file_path
    file_path=$(echo "$json_data" | "$JQ" -r '.file_path // .path // ""')
    if [ -n "$file_path" ] && should_block_file "$file_path"; then
      REDACTED=true
      echo '{"blocked": true, "reason": "[FILE BLOCKED - sensitive file type]"}'
      return
    fi
  fi

  # Apply secret filtering to the JSON content
  local filtered
  filtered=$(filter_secrets "$json_data")
  echo "$filtered"
}

# =============================================================================
# Parse Input
# =============================================================================

hook_event_name=$(echo "$input" | "$JQ" -r '.hook_event_name // "unknown"')
session_id=$(echo "$input" | "$JQ" -r '.session_id // "unknown"')

# Generate unique event ID and timestamp
# macOS doesn't support date +%N, so we use different approaches
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS: use perl or python for milliseconds, fall back to seconds + random
  if command -v perl &> /dev/null; then
    timestamp=$(perl -MTime::HiRes=time -e 'printf "%.0f", time * 1000')
  elif command -v python3 &> /dev/null; then
    timestamp=$(python3 -c 'import time; print(int(time.time() * 1000))')
  else
    timestamp=$(($(date +%s) * 1000 + RANDOM % 1000))
  fi
  event_id="${session_id}-${timestamp}-${RANDOM}"
else
  # Linux: use date +%N for nanoseconds
  ms_part=$(date +%N | cut -c1-3)
  timestamp=$(($(date +%s) * 1000 + 10#$ms_part))
  event_id="${session_id}-$(date +%s%N)"
fi

# =============================================================================
# Event Type Mapping
# =============================================================================

case "$hook_event_name" in
  PreToolUse)         event_type="pre_tool_use" ;;
  PostToolUse)        event_type="post_tool_use" ;;
  PostToolUseFailure) event_type="post_tool_use_failure" ;;
  PermissionRequest)  event_type="permission_request" ;;
  Stop)               event_type="stop" ;;
  SubagentStart)      event_type="subagent_start" ;;
  SubagentStop)       event_type="subagent_stop" ;;
  SessionStart)       event_type="session_start" ;;
  SessionEnd)         event_type="session_end" ;;
  UserPromptSubmit)   event_type="user_prompt_submit" ;;
  Notification)       event_type="notification" ;;
  PreCompact)         event_type="pre_compact" ;;
  *)                  event_type="unknown" ;;
esac

# =============================================================================
# Build Event JSON
# =============================================================================

case "$event_type" in
  pre_tool_use)
    tool_name=$(echo "$input" | "$JQ" -r '.tool_name // "unknown"')
    tool_input_raw=$(echo "$input" | "$JQ" -c '.tool_input // {}')
    tool_use_id=$(echo "$input" | "$JQ" -r '.tool_use_id // ""')

    # Filter tool input
    tool_input=$(filter_tool_data "$tool_input_raw" "$tool_name")

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg tool "$tool_name" \
      --argjson toolInput "$tool_input" \
      --arg toolUseId "$tool_use_id" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        tool: $tool,
        toolInput: $toolInput,
        toolUseId: $toolUseId,
        redacted: $redacted
      }')
    ;;

  post_tool_use)
    tool_name=$(echo "$input" | "$JQ" -r '.tool_name // "unknown"')
    tool_input_raw=$(echo "$input" | "$JQ" -c '.tool_input // {}')
    tool_response_raw=$(echo "$input" | "$JQ" -c '.tool_response // {}')
    tool_use_id=$(echo "$input" | "$JQ" -r '.tool_use_id // ""')
    success=$(echo "$input" | "$JQ" -r '.tool_response.success // true')

    # Filter tool input and response
    tool_input=$(filter_tool_data "$tool_input_raw" "$tool_name")
    tool_response=$(filter_secrets "$tool_response_raw")

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg tool "$tool_name" \
      --argjson toolInput "$tool_input" \
      --argjson toolResponse "$tool_response" \
      --arg toolUseId "$tool_use_id" \
      --argjson success "$success" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        tool: $tool,
        toolInput: $toolInput,
        toolResponse: $toolResponse,
        toolUseId: $toolUseId,
        success: $success,
        redacted: $redacted
      }')
    ;;

  stop|subagent_stop)
    stop_hook_active=$(echo "$input" | "$JQ" -r '.stop_hook_active // false')
    transcript_path=$(echo "$input" | "$JQ" -r '.transcript_path // ""')

    # Try to extract latest assistant response from transcript
    assistant_response=""
    if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
      assistant_response=$(tail -200 "$transcript_path" | \
        "$JQ" -rs '[.[] | select(.type == "assistant") | select(.message.content | map(select(.type == "text")) | length > 0)] | last | .message.content | map(select(.type == "text")) | map(.text) | join("\n")' 2>/dev/null || echo "")
      assistant_response=$(filter_secrets "$assistant_response")
    fi

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --argjson stopHookActive "$stop_hook_active" \
      --arg response "$assistant_response" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        stopHookActive: $stopHookActive,
        response: $response,
        redacted: $redacted
      }')
    ;;

  session_start)
    source_type=$(echo "$input" | "$JQ" -r '.source // "startup"')

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg source "$source_type" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        source: $source
      }')
    ;;

  session_end)
    reason=$(echo "$input" | "$JQ" -r '.reason // "other"')

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg reason "$reason" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        reason: $reason
      }')
    ;;

  user_prompt_submit)
    prompt_raw=$(echo "$input" | "$JQ" -r '.prompt // ""')
    prompt=$(filter_secrets "$prompt_raw")

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg prompt "$prompt" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        prompt: $prompt,
        redacted: $redacted
      }')
    ;;

  notification)
    message_raw=$(echo "$input" | "$JQ" -r '.message // ""')
    message=$(filter_secrets "$message_raw")
    notification_type=$(echo "$input" | "$JQ" -r '.notification_type // "unknown"')

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg message "$message" \
      --arg notificationType "$notification_type" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        message: $message,
        notificationType: $notificationType,
        redacted: $redacted
      }')
    ;;

  pre_compact)
    trigger=$(echo "$input" | "$JQ" -r '.trigger // "manual"')
    custom_instructions_raw=$(echo "$input" | "$JQ" -r '.custom_instructions // ""')
    custom_instructions=$(filter_secrets "$custom_instructions_raw")

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg trigger "$trigger" \
      --arg customInstructions "$custom_instructions" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        trigger: $trigger,
        customInstructions: $customInstructions,
        redacted: $redacted
      }')
    ;;

  permission_request)
    tool_name=$(echo "$input" | "$JQ" -r '.tool_name // "unknown"')
    tool_input_raw=$(echo "$input" | "$JQ" -c '.tool_input // {}')

    # Filter tool input
    tool_input=$(filter_tool_data "$tool_input_raw" "$tool_name")

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg tool "$tool_name" \
      --argjson toolInput "$tool_input" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        tool: $tool,
        toolInput: $toolInput,
        redacted: $redacted
      }')
    ;;

  post_tool_use_failure)
    tool_name=$(echo "$input" | "$JQ" -r '.tool_name // "unknown"')
    tool_input_raw=$(echo "$input" | "$JQ" -c '.tool_input // {}')
    tool_use_id=$(echo "$input" | "$JQ" -r '.tool_use_id // ""')
    error_raw=$(echo "$input" | "$JQ" -r '.error // ""')
    is_interrupt=$(echo "$input" | "$JQ" -r '.is_interrupt // false')

    # Filter tool input and error
    tool_input=$(filter_tool_data "$tool_input_raw" "$tool_name")
    error=$(filter_secrets "$error_raw")

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg tool "$tool_name" \
      --argjson toolInput "$tool_input" \
      --arg toolUseId "$tool_use_id" \
      --arg error "$error" \
      --argjson isInterrupt "$is_interrupt" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        tool: $tool,
        toolInput: $toolInput,
        toolUseId: $toolUseId,
        error: $error,
        isInterrupt: $isInterrupt,
        redacted: $redacted
      }')
    ;;

  subagent_start)
    agent_id=$(echo "$input" | "$JQ" -r '.agent_id // ""')
    agent_type=$(echo "$input" | "$JQ" -r '.agent_type // "unknown"')

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "$event_type" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --arg agentId "$agent_id" \
      --arg agentType "$agent_type" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        agentId: $agentId,
        agentType: $agentType
      }')
    ;;

  *)
    # Unknown event - store filtered raw input
    filtered_input=$(filter_secrets "$input")

    event=$("$JQ" -n -c \
      --arg id "$event_id" \
      --argjson timestamp "$timestamp" \
      --arg type "unknown" \
      --arg sessionId "$session_id" \
      --arg projectName "$PROJECT_NAME" \
      --arg cwd "$cwd" \
      --argjson raw "$filtered_input" \
      --argjson redacted "$REDACTED" \
      '{
        eventId: $id,
        timestamp: $timestamp,
        type: $type,
        sessionId: $sessionId,
        projectName: $projectName,
        cwd: $cwd,
        raw: $raw,
        redacted: $redacted
      }')
    ;;
esac

# =============================================================================
# Fire-and-Forget POST to Convex
# =============================================================================

if [ -n "$CURL" ] && [ -n "$event" ]; then
  "$CURL" -s -X POST "${CONVEX_URL}/event" \
    -H "Content-Type: application/json" \
    -d "$event" \
    --connect-timeout 1 \
    --max-time 2 \
    >/dev/null 2>&1 &
fi

# Always exit successfully - never block Claude
exit 0
