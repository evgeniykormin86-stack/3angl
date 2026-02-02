import type * as monacoEditor from "monaco-editor";

export type ActiveBlockType =
  | "fields"
  | "subfield"
  | "instructions"
  | "mcp-server"; // only *…|

export interface ActiveBlock {
  type: ActiveBlockType;
  range: monacoEditor.Range;
}

export function findActiveRanges(
  model: monacoEditor.editor.ITextModel,
  monaco: typeof import("monaco-editor")
): ActiveBlock[] {
  const lines = model.getLinesContent();
  const blocks: ActiveBlock[] = [];

  // === Fields + Subfields ===
  const fieldsStart = lines.findIndex(l => l.trim() === "% Fields");
  if (fieldsStart !== -1) {
    let end = fieldsStart + 1;
    while (end < lines.length && lines[end].trim() !== "") end++;

    blocks.push({
      type: "fields",
      range: new monaco.Range(fieldsStart + 1, 1, end, 1),
    });

    for (let i = fieldsStart + 1; i < end; i++) {
      const regex = /<([^>]+)>/g;
      let match;
      while ((match = regex.exec(lines[i]))) {
        blocks.push({
          type: "subfield",
          range: new monaco.Range(
            i + 1,
            match.index + 1,
            i + 1,
            match.index + match[0].length + 1
          ),
        });
      }
    }
  }

  // === Instructions block ===
  const instrStart = lines.findIndex(l => l.trim() === "% Instructions");
  if (instrStart !== -1) {
    let end = instrStart + 1;
    while (end < lines.length && lines[end].trim() !== "") end++;

    blocks.push({
      type: "instructions",
      range: new monaco.Range(instrStart + 1, 1, end, 1),
    });
  }
  return blocks;
}

/* ------------------------------------------------------------------ */
/* ---------------- SEMANTIC EXTRACTION (NO MONACO) ------------------ */
/* ------------------------------------------------------------------ */

var validated_servers = [
  "mcp-server1",
  "mcp-server2",
  "mcp-server3",
]

export interface ExtractedText {
  line: number;   // 1-based
  text: string;
}

export interface ExtractedText {
  line: number;   // 1-based
  text: string;
  is_validated: boolean;
}

export function extractBetweenChars(
  model: monacoEditor.editor.ITextModel,
  startChar: string,
  endChar: string
): ExtractedText[] {
  const lines = model.getLinesContent();
  const result: ExtractedText[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const start = line.indexOf(startChar);
    const end = line.lastIndexOf(endChar);

    if (start === -1 || end === -1) continue;
    if (end <= start + 1) continue;

    const text = line.slice(start + 1, end).trim();

    // Check if the instruction starts with a validated server
    const serverName = text.split("::")[0].trim(); // e.g. "mcp-server"
    const is_validated = validated_servers.includes(serverName);

    result.push({
      line: i + 1,
      text,
      is_validated,
    });
  }

  return result;
}