"use client";

import { useMemo } from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Event = Doc<"events">;

export interface BatchedEvent {
  /** Unique ID for React key - use first event's _id */
  id: Id<"events">;
  /** 'single' for individual events, 'batch' for grouped events */
  type: "single" | "batch";
  /** All events in this batch (1 for single, 2+ for batch) */
  events: Event[];
  /** Tool type (Read, Write, etc.) - null for non-tool events */
  tool: string | null;
  /** Agent ID - null for events without agent */
  agentId: string | null;
  /** Number of events in batch */
  count: number;
  /** Timestamp of first event (for ordering) */
  timestamp: number;
}

// Tools that should be batched when consecutive
const BATCHABLE_TOOLS = ["Read", "Glob", "Grep", "WebSearch", "WebFetch"];

// Minimum events to form a batch (per CONTEXT.md: 2+ triggers batching)
const MIN_BATCH_SIZE = 2;

/**
 * Transform events into batched groups for display.
 *
 * Per CONTEXT.md decisions:
 * 1. First pass: Group pre/post events by toolUseId
 * 2. Second pass: Batch consecutive same-tool, same-agent events
 * 3. Batch only BATCHABLE_TOOLS (read-heavy operations)
 * 4. Never cross agent boundaries
 */
export function useBatchedEvents(
  events: Event[] | undefined,
  filters: string[] = []
): BatchedEvent[] {
  return useMemo(() => {
    if (!events) return [];

    // Apply filters if any
    let filtered = events;
    if (filters.length > 0) {
      filtered = events.filter((e) => {
        const eventType = e.tool ?? e.type;
        return filters.includes(eventType);
      });
    }

    // Pass 1: Group pre/post events by toolUseId
    // This prevents "Read" followed by "Read (success)" showing separately
    const toolUseGroups = new Map<string, Event[]>();
    const standaloneEvents: Event[] = [];

    for (const event of filtered) {
      if (event.toolUseId) {
        const group = toolUseGroups.get(event.toolUseId) || [];
        group.push(event);
        toolUseGroups.set(event.toolUseId, group);
      } else {
        standaloneEvents.push(event);
      }
    }

    // Convert toolUseId groups to single logical events
    // Use the post_tool_use event as representative (has result), or first event
    const logicalEvents: Event[] = [];
    for (const [, group] of toolUseGroups) {
      // Sort by timestamp
      group.sort((a, b) => a.timestamp - b.timestamp);
      // Prefer post_tool_use (has result) over pre_tool_use
      const representative =
        group.find((e) => e.type === "post_tool_use") ||
        group.find((e) => e.type === "post_tool_use_failure") ||
        group[0];
      logicalEvents.push(representative);
    }
    logicalEvents.push(...standaloneEvents);

    // Sort DESC (newest first) to match feed display
    logicalEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Pass 2: Batch consecutive same-tool, same-agent events
    const batched: BatchedEvent[] = [];
    let currentBatch: Event[] = [];
    let currentTool: string | null = null;
    let currentAgent: string | null = null;

    const flushBatch = () => {
      if (currentBatch.length === 0) return;

      if (currentBatch.length >= MIN_BATCH_SIZE) {
        // Create batch
        batched.push({
          id: currentBatch[0]._id,
          type: "batch",
          events: [...currentBatch],
          tool: currentTool,
          agentId: currentAgent,
          count: currentBatch.length,
          timestamp: currentBatch[0].timestamp,
        });
      } else {
        // Not enough for batch - add as singles
        for (const event of currentBatch) {
          batched.push({
            id: event._id,
            type: "single",
            events: [event],
            tool: event.tool ?? null,
            agentId: event.agentId ?? null,
            count: 1,
            timestamp: event.timestamp,
          });
        }
      }
      currentBatch = [];
      currentTool = null;
      currentAgent = null;
    };

    for (const event of logicalEvents) {
      const tool = event.tool ?? null;
      const agent = event.agentId ?? null;
      const isBatchable = tool !== null && BATCHABLE_TOOLS.includes(tool);

      if (isBatchable && tool === currentTool && agent === currentAgent) {
        // Continue current batch
        currentBatch.push(event);
      } else {
        // Flush previous batch and start new
        flushBatch();

        if (isBatchable) {
          // Start new batch
          currentBatch = [event];
          currentTool = tool;
          currentAgent = agent;
        } else {
          // Add as single (non-batchable tool)
          batched.push({
            id: event._id,
            type: "single",
            events: [event],
            tool: tool,
            agentId: agent,
            count: 1,
            timestamp: event.timestamp,
          });
        }
      }
    }

    // Flush final batch
    flushBatch();

    return batched;
  }, [events, filters]);
}
