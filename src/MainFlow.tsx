import { useState } from "react";
import OrchestratorFlow from "./OrchestratorFlow";
import ProcedureFlow from "./ProcedureFLow";
import "./index.css"; // Tailwind import

const initialOrchestratorCode = `
<<<

% Fields
<subfield1> <subfield2>
-f-

% Instructions
*procedure|
*procedure1|
-i-

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

  return (
    <div className="flex flex-col h-screen w-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">IDE:3angl</h1>

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

      {/* Editors */}
      <div className="flex-1 w-full h-full relative">
        {activePanel === "orchestrator" && (
          <OrchestratorFlow 
            code={orchestratorCode} 
            onChange={setOrchestratorCode} 
          />
        )}
        {activePanel === "procedure" && (
          <ProcedureFlow 
            code={procedureCode} 
            onChange={setProcedureCode}
          />
        )}
      </div>
    </div>
  );
}
