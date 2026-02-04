import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import "./index.css";
import type { Step } from "./ReadJson";
import { getSteps } from "./ReadJson";

interface ProcedureFlowProps {
  code: string;
  onChange: (value: string) => void;
}

export default function ProcedureFlow({ onChange }: ProcedureFlowProps) {
  const [skills] = useState<Step[]>(getSteps());
  const [procedureSteps, setProcedureSteps] = useState<Step[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const [procedureName, setProcedureName] = useState("");
  const [procedureDescription, setProcedureDescription] = useState("");

  const [definitionDone, setDefinitionDone] = useState("");
  const [definitionFail, setDefinitionFail] = useState("");
  const [definitionRedo, setDefinitionRedo] = useState("");

  const typeClasses = {
    string: "px-2 py-1 text-xs font-mono text-white bg-blue-500 rounded-sm",
    number: "px-2 py-1 text-xs font-mono text-white bg-green-500 rounded-md",
    boolean: "px-2 py-1 text-xs font-mono text-white bg-orange-500 rounded-full",
    fallback: "px-2 py-1 text-xs font-mono text-white bg-gray-500 rounded-md",
  };

  const getTypeClass = (value: any) => {
    if (typeof value === "string") return typeClasses.string;
    if (typeof value === "number") return typeClasses.number;
    if (typeof value === "boolean") return typeClasses.boolean;
    return typeClasses.fallback;
  };

  /* ---------------- Actions ---------------- */
  const addStep = (step: Step) => {
    if (!procedureSteps.find((s) => s.id === step.id)) {
      setProcedureSteps([...procedureSteps, step]);
      setInputs((prev) => ({ ...prev, [step.id]: "" }));
    }
  };

  const removeStep = (stepId: string) => {
    setProcedureSteps(procedureSteps.filter((s) => s.id !== stepId));
    setInputs((prev) => {
      const copy = { ...prev };
      delete copy[stepId];
      return copy;
    });
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const copy = [...procedureSteps];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    setProcedureSteps(copy);
  };

  const moveStepDown = (index: number) => {
    if (index === procedureSteps.length - 1) return;
    const copy = [...procedureSteps];
    [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
    setProcedureSteps(copy);
  };

  const handleInputChange = (stepId: string, value: string) => {
    setInputs((prev) => ({ ...prev, [stepId]: value }));
  };

  const registerProcedure = () => {
    const serialized = {
      name: procedureName,
      description: procedureDescription,
      definitions: {
        done: definitionDone,
        fail: definitionFail,
        redo: definitionRedo,
      },
      steps: procedureSteps.map((s) => ({
        id: s.id,
        name: s.name,
        notes: inputs[s.id] || "",
      })),
    };

    onChange(JSON.stringify(serialized, null, 2));
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-full w-full gap-6 p-4">
      {/* LEFT COLUMN */}
      <div className="flex-[2] flex flex-col gap-4">
        {/* Metadata + Definitions */}
        <Card className="shadow-md border rounded-lg">
          <CardHeader>
            <CardTitle>Procedure Metadata</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input
              placeholder="Procedure name"
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
            />
            <Textarea
              placeholder="Procedure description"
              rows={3}
              value={procedureDescription}
              onChange={(e) => setProcedureDescription(e.target.value)}
            />
            <Textarea
              placeholder="Definition of Done"
              rows={2}
              value={definitionDone}
              onChange={(e) => setDefinitionDone(e.target.value)}
            />
            <Textarea
              placeholder="Definition of Fail"
              rows={2}
              value={definitionFail}
              onChange={(e) => setDefinitionFail(e.target.value)}
            />
            <Textarea
              placeholder="Definition of Redo"
              rows={2}
              value={definitionRedo}
              onChange={(e) => setDefinitionRedo(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Flex row: Procedure Editor + Agent Skills */}
        <div className="flex flex-1 gap-6">
          {/* Procedure Editor */}
          <Card className="flex-1 flex flex-col overflow-hidden shadow-md border rounded-lg">
            <CardHeader>
              <CardTitle>Procedure Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto flex flex-col gap-3 p-2 bg-gray-50">
              {procedureSteps.length === 0 && (
                <div className="text-gray-400 text-sm text-center mt-4">
                  Add a skill from Agent Skills
                </div>
              )}
              {procedureSteps.map((step, index) => (
                <Card
                  key={step.id}
                  className="flex text-xs border bg-white rounded-md shadow-sm hover:shadow-md transition"
                >
                  <Card className="flex-1 p-3 bg-gray-50 border rounded-l-md">
                    <div className="font-semibold">{step.name}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(step.input).map(([k, v]) => (
                        <span key={k} className={getTypeClass(v)}>
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-1 justify-end flex-wrap">
                      {Object.entries(step.output).map(([k, v]) => (
                        <span key={k} className={getTypeClass(v)}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </Card>
                  <div className="w-1/3 p-3 flex flex-col gap-2">
                    <Textarea
                      placeholder="Notes"
                      rows={2}
                      value={inputs[step.id] || ""}
                      onChange={(e) => handleInputChange(step.id, e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => removeStep(step.id)}>
                        ✕
                      </Button>
                      {index > 0 && (
                        <Button size="sm" variant="outline" onClick={() => moveStepUp(index)}>
                          ↑
                        </Button>
                      )}
                      {index < procedureSteps.length - 1 && (
                        <Button size="sm" variant="outline" onClick={() => moveStepDown(index)}>
                          ↓
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Agent Skills */}
          <div className="w-80 flex flex-col gap-3">
            <Button
              className="bg-green-600 text-white mb-2"
              onClick={registerProcedure}
            >
              Register
            </Button>
            <Card className="flex-1 flex flex-col overflow-hidden shadow-md border rounded-lg">
              <CardHeader>
                <CardTitle className="text-sm">Agent Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto flex flex-col gap-2 p-2">
                {skills.map((skill) => (
                  <Card
                    key={skill.id}
                    className="p-2 border rounded-md flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <div className="font-semibold text-sm">{skill.name}</div>
                    <Button size="sm" variant="outline" onClick={() => addStep(skill)}>
                      ⬅
                    </Button>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
