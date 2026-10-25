import { PromptResponse } from "@/lib/types";

const FENCE_RE = /^\s*(```|~~~)/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;

/**
 * Older prompts were sometimes saved as the raw JSON the model returned
 * (e.g. ```json { "title": ..., "prompt": ... } ```). Pull the prompt text out of it.
 */
export function extractPromptText(raw: string | undefined | null): string {
  if (!raw) return "";
  const text = raw.trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const looksLikeJson = start !== -1 && end > start && /^(```(json)?\s*)?\{/i.test(text);
  if (!looksLikeJson) return raw;

  try {
    const parsed = JSON.parse(escapeControlCharsInStrings(text.slice(start, end + 1)));
    const value = parsed?.prompt ?? parsed?.full_prompt;
    if (typeof value === "string" && value.trim()) return value;
  } catch {
    // Not valid JSON after all; show it as-is.
  }
  return raw;
}

/** Models often put literal newlines/tabs inside JSON strings, which JSON.parse rejects. */
function escapeControlCharsInStrings(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (const ch of json) {
    if (inString && !escaped) {
      if (ch === "\n") { out += "\\n"; continue; }
      if (ch === "\r") { out += "\\r"; continue; }
      if (ch === "\t") { out += "\\t"; continue; }
    }
    if (escaped) escaped = false;
    else if (ch === "\\") escaped = inString;
    else if (ch === '"') inString = !inString;
    out += ch;
  }
  return out;
}

/** Normalize line endings and spacing so the file reads cleanly. */
export function tidyMarkdown(text: string): string {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, ""));
  const out: string[] = [];
  let inFence = false;

  const blankAbove = () => {
    if (out.length > 0 && out[out.length - 1] !== "") out.push("");
  };

  for (const line of lines) {
    if (FENCE_RE.test(line)) {
      // Code blocks get a blank line above and below them.
      if (!inFence) blankAbove();
      out.push(line);
      if (inFence) out.push("");
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      // At most one blank line in a row.
      if (line === "" && out[out.length - 1] === "") continue;
      // Headings always get a blank line above them.
      if (HEADING_RE.test(line)) blankAbove();
    }
    out.push(line);
    // ...and below them.
    if (!inFence && HEADING_RE.test(line)) out.push("");
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Shift every heading so the shallowest one lands at `targetLevel` (skips code blocks). */
function shiftHeadings(text: string, targetLevel: number): string {
  const lines = text.split("\n");
  let inFence = false;
  let minLevel = 7;

  for (const line of lines) {
    if (FENCE_RE.test(line)) inFence = !inFence;
    const m = !inFence && line.match(HEADING_RE);
    if (m) minLevel = Math.min(minLevel, m[1].length);
  }
  if (minLevel === 7 || minLevel === targetLevel) return text;

  const delta = targetLevel - minLevel;
  inFence = false;
  return lines
    .map((line) => {
      if (FENCE_RE.test(line)) inFence = !inFence;
      const m = !inFence && line.match(HEADING_RE);
      if (!m) return line;
      const level = Math.min(6, Math.max(1, m[1].length + delta));
      return `${"#".repeat(level)} ${m[2]}`;
    })
    .join("\n");
}

function escapeCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

/** A Markdown table whose columns are padded so it is aligned in the raw file too. */
function markdownTable(headers: string[], rows: string[][]): string {
  const cells = [headers, ...rows].map((row) => row.map(escapeCell));
  const widths = headers.map((_, col) => Math.max(3, ...cells.map((row) => (row[col] ?? "").length)));
  const formatRow = (row: string[]) =>
    `| ${widths.map((w, col) => (row[col] ?? "").padEnd(w)).join(" | ")} |`;
  const divider = `| ${widths.map((w) => "-".repeat(w)).join(" | ")} |`;

  return [formatRow(cells[0]), divider, ...cells.slice(1).map(formatRow)].join("\n");
}

function titleCase(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function sourceLabel(prompt: PromptResponse): string {
  switch (prompt.source_type) {
    case "idea":
      return "Project idea";
    case "url":
      return "Website URL";
    case "image":
      return "Uploaded image(s)";
    default:
      return "Website URL + uploaded image(s)";
  }
}

/** Build the complete, structured Markdown document for a generated prompt. */
export function buildPromptMarkdown(prompt: PromptResponse): string {
  const created = new Date(prompt.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections: string[] = [
    `# ${prompt.title}`,
    markdownTable(["Field", "Value"], [
      ["Type", prompt.source_type === "idea" ? "Idea → Development Blueprint" : "UI/UX Developer Prompt"],
      ["Source", sourceLabel(prompt)],
      ["Generated", created],
    ]),
    "---",
  ];

  if (prompt.source_type !== "idea") {
    sections.push(shiftHeadings(tidyMarkdown(extractPromptText(prompt.generated_prompt)), 2));
    return tidyMarkdown(sections.join("\n\n")) + "\n";
  }

  if (prompt.idea_text) {
    sections.push("## Project Idea", prompt.idea_text.trim().split("\n").map((l) => `> ${l}`).join("\n"));
  }

  const stack = Object.entries(prompt.recommended_stack ?? {}).filter(([, techs]) => techs?.length);
  if (stack.length) {
    sections.push(
      "## Recommended Tech Stack",
      markdownTable(["Category", "Technologies"], stack.map(([cat, techs]) => [titleCase(cat), techs.join(", ")]))
    );
  }

  if (prompt.env_variables?.length) {
    sections.push(
      "## Environment Variables",
      markdownTable(
        ["Variable", "Description", "Example"],
        prompt.env_variables.map((v) => [`\`${v.key}\``, v.description, `\`${v.example}\``])
      ),
      "```env\n" +
        prompt.env_variables.map((v) => `# ${v.description}\n${v.key}=${v.example}`).join("\n\n") +
        "\n```"
    );
  }

  if (prompt.db_schemas?.length) {
    sections.push("## Database Schemas");
    for (const schema of prompt.db_schemas) {
      sections.push(
        `### ${schema.name}`,
        markdownTable(
          ["Field", "Type", "Required"],
          schema.fields.map((f) => [`\`${f.name}\``, f.type, f.required ? "Yes" : "No"])
        )
      );
    }
  }

  const fullPrompt = extractPromptText(prompt.full_prompt || prompt.generated_prompt);
  if (fullPrompt.trim()) {
    sections.push("## Development Blueprint", shiftHeadings(tidyMarkdown(fullPrompt), 3));
  }

  if (prompt.phases?.length) {
    sections.push("## Phased Roadmap");
    for (const phase of prompt.phases) {
      sections.push(
        `### Phase ${phase.phase_number}: ${phase.title}`,
        shiftHeadings(tidyMarkdown(phase.content), 4)
      );
    }
  }

  return tidyMarkdown(sections.join("\n\n")) + "\n";
}

/** Trigger a browser download of `content` as a Markdown file. */
export function downloadMarkdown(content: string, filename = "prompt.md"): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
