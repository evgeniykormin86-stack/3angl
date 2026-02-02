import { useRef } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { findActiveRanges, extractBetweenChars } from "./ActiveRanges";
import type { ActiveBlock } from "./ActiveRanges";
import "./index.css";

const initialOrchestratorCode = `
Start
% Fields
IoT, LLM <subfield1> <subfield2>

% Instructions
*mcp-server1::2026-Feb-1 -> PG('table1')|
*execute-task something|
*unknown-task|

End
`;

export default function OrchestratorFlow() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const handleBeforeMount = (monaco: typeof import("monaco-editor")) => {
    monaco.languages.register({ id: "3angle" });
    monaco.languages.setMonarchTokensProvider("3angle", {
      tokenizer: { root: [[/.+/, "normal"]] },
    });

    monaco.editor.defineTheme("3angleTheme", {
      base: "vs",
      inherit: true,
      rules: [{ token: "normal", foreground: "000000" }],
      colors: { "editor.background": "#f9fafb" },
    });
  };

const applyDecorations = (editor: monaco.editor.IStandaloneCodeEditor) => {
  const model = editor.getModel();
  if (!model) return;

  const blocks: ActiveBlock[] = findActiveRanges(model, monaco);
  const instructions = extractBetweenChars(model, "*", "|");

  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [
    // Block backgrounds — only for fields & instructions, skip subfields
    ...blocks
      .filter(b => b.type === "fields" || b.type === "instructions")
      .map((block) => ({
        range: block.range,
        options: { inlineClassName: block.type === "fields" ? "active-fields-bg" : "active-instructions-bg" },
      })),

    // Validated instructions — override font color
    ...instructions.map((instr) => ({
      range: new monaco.Range(instr.line, 1, instr.line, instr.text.length + 1),
      options: {
        inlineClassName: instr.is_validated ? "validated-instr" : "invalid-instr",
      },
    })),
  ];

  decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, newDecorations);
};

  return (
<Editor
  defaultValue={initialOrchestratorCode}
  height="100vh"
  defaultLanguage="3angle"
  theme="3angleTheme"
  beforeMount={handleBeforeMount}
  onMount={(editor) => {
    editorRef.current = editor;
    applyDecorations(editor);

    // Live updates for validated instructions
    editor.onDidChangeModelContent(() => applyDecorations(editor));
  }}
  options={{
    fontSize: 14,
    wordWrap: "on",
    lineNumbers: "on",
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  }}
/>
  );
}
