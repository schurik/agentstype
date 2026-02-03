"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { CodeBlock } from "../ui/CodeBlock";

type Event = Doc<"events">;

interface ExpandedContentProps {
  event: Event;
}

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
    py: "python",
    rs: "rust",
    go: "go",
    sh: "bash",
  };
  return langMap[ext ?? ""] ?? "text";
}

function ReadContent({ event }: { event: Event }) {
  const filePath = (event.toolInput as { file_path?: string })?.file_path;
  const content =
    typeof event.toolResponse === "string"
      ? event.toolResponse
      : JSON.stringify(event.toolResponse, null, 2);
  const lang = filePath ? getLanguageFromPath(filePath) : "text";

  return (
    <div className="space-y-2">
      {filePath && (
        <div className="text-xs text-zinc-500 font-mono">{filePath}</div>
      )}
      <CodeBlock code={content || "(empty)"} lang={lang} />
    </div>
  );
}

function WriteContent({ event }: { event: Event }) {
  const input = event.toolInput as
    | { file_path?: string; content?: string }
    | undefined;
  const filePath = input?.file_path;
  const content = input?.content;
  const lang = filePath ? getLanguageFromPath(filePath) : "text";

  return (
    <div className="space-y-2">
      {filePath && (
        <div className="text-xs text-zinc-500 font-mono">{filePath}</div>
      )}
      <CodeBlock code={content || "(empty)"} lang={lang} />
    </div>
  );
}

function EditContent({ event }: { event: Event }) {
  const input = event.toolInput as
    | { file_path?: string; old_string?: string; new_string?: string }
    | undefined;
  const filePath = input?.file_path;
  const oldString = input?.old_string;
  const newString = input?.new_string;
  const lang = filePath ? getLanguageFromPath(filePath) : "text";

  return (
    <div className="space-y-2">
      {filePath && (
        <div className="text-xs text-zinc-500 font-mono">{filePath}</div>
      )}
      {oldString && (
        <div>
          <div className="text-xs text-red-400 mb-1">- Removed:</div>
          <div className="opacity-60">
            <CodeBlock code={oldString} lang={lang} />
          </div>
        </div>
      )}
      {newString && (
        <div>
          <div className="text-xs text-green-400 mb-1">+ Added:</div>
          <CodeBlock code={newString} lang={lang} />
        </div>
      )}
    </div>
  );
}

function BashContent({ event }: { event: Event }) {
  const input = event.toolInput as { command?: string } | undefined;
  const command = input?.command;
  const output =
    typeof event.toolResponse === "string"
      ? event.toolResponse
      : JSON.stringify(event.toolResponse, null, 2);

  return (
    <div className="space-y-2 font-mono text-sm">
      {command && (
        <div className="text-green-400">
          <span className="text-zinc-500">$</span> {command}
        </div>
      )}
      {output && (
        <pre className="text-zinc-300 whitespace-pre-wrap bg-zinc-900 p-2 rounded overflow-x-auto">
          {output}
        </pre>
      )}
    </div>
  );
}

function GlobGrepContent({ event }: { event: Event }) {
  const input = event.toolInput as
    | { pattern?: string; path?: string }
    | undefined;
  const pattern = input?.pattern;
  const results = Array.isArray(event.toolResponse) ? event.toolResponse : [];

  return (
    <div className="space-y-2">
      {pattern && (
        <div className="text-xs text-zinc-400">
          <span className="text-zinc-500">Pattern:</span> {pattern}
        </div>
      )}
      {results.length > 0 && (
        <ul className="text-sm font-mono text-zinc-300 space-y-1">
          {results.slice(0, 20).map((item, i) => (
            <li key={i} className="truncate">
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
          {results.length > 20 && (
            <li className="text-zinc-500">...and {results.length - 20} more</li>
          )}
        </ul>
      )}
    </div>
  );
}

function ErrorContent({ event }: { event: Event }) {
  return (
    <div className="bg-red-950/30 border border-red-900/50 rounded p-3">
      <div className="text-red-400 text-sm font-mono">
        {event.error || "Unknown error"}
      </div>
      {event.toolInput && (
        <details className="mt-2">
          <summary className="text-xs text-zinc-500 cursor-pointer">
            Tool Input
          </summary>
          <pre className="mt-1 text-xs text-zinc-400 overflow-x-auto">
            {JSON.stringify(event.toolInput, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

function DefaultContent({ event }: { event: Event }) {
  return (
    <div className="space-y-2 text-sm">
      {event.toolInput && (
        <div>
          <div className="text-xs text-zinc-500 mb-1">Input:</div>
          <pre className="bg-zinc-900 p-2 rounded text-zinc-400 overflow-x-auto text-xs">
            {JSON.stringify(event.toolInput, null, 2)}
          </pre>
        </div>
      )}
      {event.toolResponse && (
        <div>
          <div className="text-xs text-zinc-500 mb-1">Output:</div>
          <pre className="bg-zinc-900 p-2 rounded text-zinc-400 overflow-x-auto text-xs">
            {typeof event.toolResponse === "string"
              ? event.toolResponse
              : JSON.stringify(event.toolResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function ExpandedContent({ event }: ExpandedContentProps) {
  const tool = event.tool?.toLowerCase();

  // Error events
  if (event.type === "post_tool_use_failure" || event.error) {
    return <ErrorContent event={event} />;
  }

  // Tool-specific layouts
  switch (tool) {
    case "read":
      return <ReadContent event={event} />;
    case "write":
      return <WriteContent event={event} />;
    case "edit":
      return <EditContent event={event} />;
    case "bash":
      return <BashContent event={event} />;
    case "glob":
    case "grep":
      return <GlobGrepContent event={event} />;
    default:
      return <DefaultContent event={event} />;
  }
}
