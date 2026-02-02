import type * as monacoEditor from "monaco-editor";

export type ActiveBlockType = "fields" | "subfield" | "instructions" | "instruction-line";

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

  // Fields block + subfields
  const fieldsStart = lines.findIndex(l => l.trim() === "% Fields");
  if (fieldsStart !== -1) {
    let end = fieldsStart + 1;
    while (end < lines.length && lines[end].trim() !== "") end++;

    // whole block
    blocks.push({
      type: "fields",
      range: new monaco.Range(fieldsStart + 1, 1, end, 1),
    });

    // subfields
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

  // Instructions block
  const instrStart = lines.findIndex(l => l.trim() === "% Instructions");
  if (instrStart !== -1) {
    let end = instrStart + 1;
    while (end < lines.length && lines[end].trim() !== "") end++;

    // whole instructions block background
    blocks.push({
      type: "instructions",
      range: new monaco.Range(instrStart + 1, 1, end, 1),
    });

    // each line starting with * highlighted
    for (let i = instrStart + 1; i < end; i++) {
      const line = lines[i].trimStart();
      if (line.startsWith("*")) {
        blocks.push({
          type: "instruction-line",
          range: new monaco.Range(i + 1, 2, i + 1, lines[i].length + 1), // after *
        });
      }
    }
  }

  return blocks;
}
