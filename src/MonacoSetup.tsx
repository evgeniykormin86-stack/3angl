import * as monaco from "monaco-editor";

export const setupMonaco = () => {
  // ===== Register language =====
  monaco.languages.register({ id: "3angle" });

  // ===== Syntax highlighting =====
  monaco.languages.setMonarchTokensProvider("3angle", {
    tokenizer: {
      root: [
        [/^% Fields$/, "fields-header"],
        [/^% Instructions$/, "instructions-header"],
        [/<[^>]+>/, "subfield"],
        [/.+/, "normal"],
      ],
    },
  });

  // ===== Editor theme =====
  monaco.editor.defineTheme("3angleTheme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "fields-header", foreground: "16a34a", fontStyle: "bold" },
      { token: "instructions-header", foreground: "7c3aed", fontStyle: "bold" },
      { token: "subfield", foreground: "000000", fontStyle: "italic" },
      { token: "normal", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#f9fafb", // light neutral background
    },
  });

  // ===== Minimal autocomplete for lines starting with % =====
monaco.languages.registerCompletionItemProvider("3angle", {
  triggerCharacters: ["$"], // show when typing %
  provideCompletionItems: (model, position) => {
    const line = model.getLineContent(position.lineNumber).trimStart();

    if (!line.startsWith("$")) return { suggestions: [] };

    const word = model.getWordUntilPosition(position);
    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    return {
      suggestions: [
        {
          label: "$Fields",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "$Fields",
          range,
          documentation: "Start a Fields block",
        },
        {
          label: "$Instructions",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "$Instructions",
          range,
          documentation: "Start an Instructions block",
        },
      ],
    };
  },
});

  return monaco;
};

export { monaco };
