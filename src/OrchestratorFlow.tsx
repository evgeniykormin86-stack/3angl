import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { findActiveRanges } from "./ActiveRanges";
import type { ActiveBlock } from "./ActiveRanges";
import "./index.css";

const initialOrchestratorCode = `
Start
% Fields
IoT, LLM <subfield1> <subfield2>

% Instructions
*mcp-server::2026-Feb-1 -> PG('table1')
*execute-task something
*unknown-task
- success::proceed

End
`;

export default function OrchestratorFlow() {
  const [code, setCode] = useState(initialOrchestratorCode);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const handleBeforeMount = (monaco: typeof import("monaco-editor")) => {
    monaco.languages.register({ id: "3angle" });
    monaco.languages.setMonarchTokensProvider("3angle", { tokenizer: { root: [[/.+/, "normal"]] } });

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

    const newDecorations: monaco.editor.IModelDeltaDecoration[] = blocks.map((block) => {
      if (block.type === "fields") {
        return { range: block.range, options: { inlineClassName: "active-fields-bg" } };
      }
      if (block.type === "subfield") {
        return { range: block.range, options: { inlineClassName: "active-subfield-bg" } };
      }
      if (block.type === "instructions") {
        return { range: block.range, options: { inlineClassName: "active-instructions-bg" } };
      }
      if (block.type === "instruction-line") {
        return { range: block.range, options: { inlineClassName: "instruction-text" } };
      }
      return { range: block.range, options: {} };
    });

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, newDecorations);
  };

  const handleOnMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    applyDecorations(editor);
    editor.onDidChangeModelContent(() => applyDecorations(editor));
  };

  return (
    <Editor
      height="100vh"
      defaultLanguage="3angle"
      value={code}
      onChange={(v) => setCode(v || "")}
      theme="3angleTheme"
      beforeMount={handleBeforeMount}
      onMount={handleOnMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}