import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: [
        "typescript",
        "javascript",
        "json",
        "bash",
        "markdown",
        "tsx",
        "jsx",
        "css",
        "html",
        "python",
        "rust",
        "go",
      ],
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  const loadedLangs = highlighter.getLoadedLanguages();

  // Fallback to 'text' for unknown languages
  const language = loadedLangs.includes(lang as never) ? lang : "text";

  return highlighter.codeToHtml(code, {
    lang: language,
    theme: "github-dark",
  });
}
