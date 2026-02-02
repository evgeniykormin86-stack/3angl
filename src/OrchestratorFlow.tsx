import { useRef } from "react";
import Editor from "@monaco-editor/react";
import { monaco, setupMonaco } from "./MonacoSetup";
import "./index.css";

interface OrchestratorFlowProps {
  code: string;
  onChange: (value: string) => void;
}

export default function OrchestratorFlow({ code, onChange }: OrchestratorFlowProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  // Initialize language + theme once
  setupMonaco();

  const applyDecorations = (editor: monaco.editor.IStandaloneCodeEditor) => {
  const model = editor.getModel();
  if (!model) return;

  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  const lines = model.getLinesContent();

  let currentBlock: "fields" | "instructions" | null = null;
  let blockStart = 0;

  const verified_mcp_servers = [
    "procedure1",
    "procedure2"
  ]

lines.forEach((line, idx) => {
  const trimmed = line.trim();

  // ===== Block start =====
  if (trimmed === "% Fields") {
    currentBlock = "fields";
    blockStart = idx;
    decorations.push({
      range: new monaco.Range(idx + 1, 1, idx + 1, line.length + 1),
      options: { inlineClassName: "fields-header" },
    });
    return;
  }
  if (trimmed === "% Instructions") {
    currentBlock = "instructions";
    blockStart = idx;
    decorations.push({
      range: new monaco.Range(idx + 1, 1, idx + 1, line.length + 1),
      options: { inlineClassName: "instructions-header" },
    });
    return;
  }

  // ===== Block end marker =====
  if ((currentBlock === "fields" && trimmed === "-f-") ||
      (currentBlock === "instructions" && trimmed === "-i-")) {

    // decorate all lines in block except end marker
    for (let i = blockStart; i < idx; i++) {
      decorations.push({
        range: new monaco.Range(i + 1, 1, i + 1, lines[i].length + 1),
        options: {
          isWholeLine: true,
          className: currentBlock === "fields" ? "fields-bg" : "instructions-bg",
        },
      });
    }

    // decorate end marker line
    decorations.push({
      range: new monaco.Range(idx + 1, 1, idx + 1, lines[idx].length + 1),
      options: { isWholeLine: true, inlineClassName: "end-of-block" },
    });

    currentBlock = null;
    return;
  }

  // ===== Subfield inline decorations (only in fields) =====
  if (currentBlock === "fields") {
    const regex = /<([^>]+)>/g;
    let match;
    while ((match = regex.exec(line))) {
      decorations.push({
        range: new monaco.Range(idx + 1, match.index + 1, idx + 1, match.index + match[0].length + 1),
        options: { inlineClassName: "subfield" },
      });
    }
    return; // skip procedure check inside fields
  }

  // ===== MCP lines (outside blocks) =====
  if (/^\*.*\|$/.test(trimmed)) {
    const procName = trimmed.replace(/^\*|\|$/g, "");
    const isVerified = verified_mcp_servers.includes(procName);

    decorations.push({
      range: new monaco.Range(idx + 1, 1, idx + 1, line.length + 1),
      options: {
        isWholeLine: true,
        inlineClassName: isVerified ? "procedure-verified" : "procedure-rejected",
      },
    });
  }
});

  // Apply decorations
  decorationIdsRef.current = editor.deltaDecorations(
    decorationIdsRef.current,
    decorations
  );
};

  return (
    <Editor
      height="100%"
      defaultLanguage="3angle"
      theme="3angleTheme"
      value={code}
      onChange={(v) => onChange(v || "")}
      onMount={(editor) => {
        editorRef.current = editor;
        applyDecorations(editor);
        editor.onDidChangeModelContent(() => applyDecorations(editor));
      }}
      options={{
        fontSize: 14,
        wordWrap: "on",
        lineNumbers: "on",
        automaticLayout: true,
      }}
    />
  );
}
