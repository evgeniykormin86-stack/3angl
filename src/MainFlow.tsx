import { useState } from "react";
import Editor from "@monaco-editor/react";
import { findActiveRanges } from "./ActiveRanges";
import type { ActiveBlock } from "./ActiveRanges";
import "./index.css"; // Tailwind import
import * as monaco from "monaco-editor";

declare global {
  interface Window {
    monaco?: typeof import("monaco-editor");
  }
}

const initialOrchestratorCode = `
<<<
% Fields
<subfiled1> <subfiled2>

% Instructions
*

>>>
`;

const initialProcedureCode = `
Procedure Start
% Steps
Step1, Step2

End Procedure
`;

export default function App() {
  const [activePanel, setActivePanel] = useState<"orchestrator" | "procedure">("orchestrator");
  const [orchestratorCode, setOrchestratorCode] = useState(initialOrchestratorCode);
  const [procedureCode, setProcedureCode] = useState(initialProcedureCode);

  /** Decorations logic for Orchestrator */
  const applyActiveDecorations = (editor: any) => {
    if (activePanel !== "orchestrator") return [];
    const model = editor.getModel();
    if (!model) return [];
    const blocks: ActiveBlock[] = findActiveRanges(model, monaco);
    return blocks.map((block) => ({
      range: block.range,
      options: {
        isWholeLine: block.type !== "subfield",
        className:
          block.type === "fields"
            ? "active-fields-bg"
            : block.type === "subfield"
            ? "active-subfield-bg"
            : "active-instructions-bg",
      },
    }));
  };

  /** Editor mounted */
  const handleOnMount = (editor: any) => {
    let decorationIds: string[] = [];

    const updateDecorations = () => {
      decorationIds = editor.deltaDecorations(decorationIds, applyActiveDecorations(editor));
    };

    updateDecorations();
    editor.onDidChangeModelContent(updateDecorations);
  };

  /** Setup Monaco theme & language */
  const handleBeforeMount = (monaco: typeof import("monaco-editor")) => {
    window.monaco = monaco;
monaco.languages.setMonarchTokensProvider("3angle", {
  tokenizer: {
    root: [
      [/^% Fields$/, "fields-header"],
      [/^% Instructions$/, "instructions-header"],
      [/<[^>]+>/, "subfield"], // subfields
      [/.+/, "normal"],         // default
    ],
  },
});

monaco.editor.defineTheme("3angleTheme", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "fields-header", foreground: "16a34a", fontStyle: "bold" },      // green font
    { token: "instructions-header", foreground: "7c3aed", fontStyle: "bold" }, // purple font
    { token: "subfield", foreground: "000000" },                               // black font, no bg
    { token: "normal", foreground: "000000" },
  ],
  colors: { "editor.background": "#f9fafb" },
});
  }
  return (
    <div className="flex flex-col h-screen w-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">DSL Editor App</h1>

      {/* Toggle buttons */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded border font-medium ${
            activePanel === "orchestrator"
              ? "bg-blue-500 text-white cursor-not-allowed"
              : "bg-white text-gray-800 hover:bg-blue-100"
          }`}
          disabled={activePanel === "orchestrator"}
          onClick={() => setActivePanel("orchestrator")}
        >
          Orchestrator
        </button>
        <button
          className={`px-4 py-2 rounded border font-medium ${
            activePanel === "procedure"
              ? "bg-blue-500 text-white cursor-not-allowed"
              : "bg-white text-gray-800 hover:bg-blue-100"
          }`}
          disabled={activePanel === "procedure"}
          onClick={() => setActivePanel("procedure")}
        >
          Procedure
        </button>
      </div>

      {/* Two persistent editors */}
      <div className="flex-1 w-full h-full relative">
        {/* Orchestrator editor */}
        <div className={activePanel === "orchestrator" ? "absolute inset-0 block" : "absolute inset-0 hidden"}>
          <Editor
            height="100%"
            defaultLanguage="3angle"
            value={orchestratorCode}
            onChange={(v) => setOrchestratorCode(v || "")}
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
              fontFamily: "Fira Code, monospace",
            }}
          />
        </div>

        {/* Procedure editor */}
        <div className={activePanel === "procedure" ? "absolute inset-0 block" : "absolute inset-0 hidden"}>
          <Editor
            height="100%"
            defaultLanguage="3angle"
            value={procedureCode}
            onChange={(v) => setProcedureCode(v || "")}
            theme="3angleTheme"
            beforeMount={handleBeforeMount}
            onMount={() => {}} // no decorations for Procedure
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "Fira Code, monospace",
            }}
          />
        </div>
      </div>
    </div>
  );
}
