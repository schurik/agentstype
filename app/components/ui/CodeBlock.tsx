"use client";

import { useState, useEffect } from "react";
import { highlight } from "@/app/lib/highlighter";

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang = "text" }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    highlight(code, lang).then(setHtml);
  }, [code, lang]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!html) {
    return (
      <pre className="bg-zinc-900 p-3 rounded text-sm font-mono text-zinc-400 overflow-x-auto">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <div
        className="bg-zinc-900 p-3 rounded text-sm overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
