import * as monaco from "monaco-editor";

export const setupMonaco = () => {
  // Register language
  monaco.languages.register({ id: "3angle" });
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

  // Define theme
  monaco.editor.defineTheme("3angleTheme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "fields-header", foreground: "16a34a", fontStyle: "bold" },
      { token: "instructions-header", foreground: "7c3aed", fontStyle: "bold" },
      { token: "subfield", foreground: "000000" },
      { token: "normal", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#f9fafb",
    },
  });

  return monaco; // return the runtime monaco object
};

export { monaco }; // ✅ export the runtime monaco
