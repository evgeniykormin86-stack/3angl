import { useState } from "react";
import AgentFlow from "./AgentFlow";
import ProcedureFlow from "./ProcedureFLow";
import "./index.css";

export default function App() {
  const [activePanel, setActivePanel] = useState<"agent" | "procedure">("agent");
  const [agentCode, setAgentCode] = useState("");
  const [procedureCode, setProcedureCode] = useState("");

  return (
    <div className="flex flex-col h-screen w-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">IDE:3angl</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActivePanel("agent")}
          className={`px-4 py-2 rounded border ${
            activePanel === "agent" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Agent
        </button>

        <button
          onClick={() => setActivePanel("procedure")}
          className={`px-4 py-2 rounded border ${
            activePanel === "procedure" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Procedure
        </button>
      </div>

      <div className="flex-1 flex">
        {activePanel === "agent" && (
          <AgentFlow code={agentCode} onChange={setAgentCode} />
        )}

        {activePanel === "procedure" && (
          <ProcedureFlow code={procedureCode} onChange={setProcedureCode} />
        )}
      </div>
    </div>
  );
}
