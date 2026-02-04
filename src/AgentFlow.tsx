import { useState } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

type Procedure = {
  id: number;
  name: string;
  success?: Procedure;
  fail?: Procedure;
  redo?: Procedure;
};

type AgentFlowProps = {
  code: string;
  onChange: (code: string) => void;
};

export default function AgentFlow({ onChange }: AgentFlowProps) {
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [fieldInput, setFieldInput] = useState("");
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const PREDEFINED_PROCEDURES = ["*procedure1|", "*procedure2|", "*procedure3|"];
  const NESTED_PROCEDURES = [...PREDEFINED_PROCEDURES, "END"];
  const [selectedProcedure, setSelectedProcedure] = useState(PREDEFINED_PROCEDURES[0]);

  /* ---------------- ACTIONS ---------------- */
  const addField = () => {
    if (!fieldInput.trim()) return;
    const updated = [...fields, fieldInput.trim()];
    setFields(updated);
    setFieldInput("");
    updateCode(updated, procedures);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    updateCode(updated, procedures);
  };

  const addProcedure = () => {
    if (procedures.find((p) => p.name === selectedProcedure)) return;
    const updated = [...procedures, { id: Date.now(), name: selectedProcedure }];
    setProcedures(updated);
    updateCode(fields, updated);
  };

  const removeProcedure = (id: number) => {
    const updated = procedures.filter((p) => p.id !== id);
    setProcedures(updated);
    updateCode(fields, updated);
  };

  const addNestedProcedure = (
    parentId: number,
    type: "success" | "fail" | "redo",
    name: string
  ) => {
    if (!name) return;
    const updated = procedures.map((p) =>
      p.id === parentId ? { ...p, [type]: { id: Date.now(), name } } : p
    );
    setProcedures(updated);
    updateCode(fields, updated);
  };

  /* ---------------- STATUS ---------------- */
  const getParentLevelStatus = (p: Procedure) => {
    const names = ["success", "fail", "redo"]
      .map((k) => p[k as keyof Procedure])
      .filter((s): s is Procedure => !!s)
      .filter((s) => s.name !== "END")
      .map((s) => s.name);
    const counts: Record<string, number> = {};
    names.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
    return names.every((n) => counts[n] === 1);
  };

  const getNestedFlowStatus = (
    parent: Procedure,
    type: "success" | "fail" | "redo"
  ) => {
    const nested = parent[type as keyof Procedure];

    if (!nested || typeof nested !== "object" || !("name" in nested)) return true;
    if (nested.name === "END") return true;

    const siblingNames = ["success", "fail", "redo"].map(
      (k) => parent[k as keyof Procedure]
    )
    .filter(
      (s): s is Procedure =>
        typeof s === "object" && s !== null && "name" in s && s.name !== "END"
    )
    .map((s) => s.name);

    const counts: Record<string, number> = {};
    siblingNames.forEach((n) => (counts[n] = (counts[n] || 0) + 1));

    return counts[nested.name] === 1;
  };

  /* ---------------- CODE ---------------- */
  const updateCode = (fields: string[], procedures: Procedure[]) => {
    const serialize = (p: Procedure, prefix = ""): string[] => {
      let lines = [`${prefix}${p.name}`];
      if (p.success) lines.push(...serialize(p.success, prefix + "  if success → "));
      if (p.fail) lines.push(...serialize(p.fail, prefix + "  if fail → "));
      if (p.redo) lines.push(...serialize(p.redo, prefix + "  if redo → "));
      return lines;
    };
    const serializedLines = procedures.flatMap((p) => serialize(p));
    onChange(
      `Agent: ${agentName || "∅"}\n` +
      `Description: ${agentDescription || "∅"}\n\n` +
      `Comments: ${fields.join(", ") || "∅"}\n` +
      `Procedures:\n${serializedLines.join("\n") || "∅"}`
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-full gap-6 font-sans min-h-[600px]">
      {/* LEFT: Agent + Comments + Procedures */}
      <div className="w-[55%] space-y-6 p-4 border-r border-gray-200">
        {/* Agent Info */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Agent name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <Textarea
              placeholder="Agent description"
              rows={3}
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add comment"
                value={fieldInput}
                onChange={(e) => setFieldInput(e.target.value)}
              />
              <Button onClick={addField}>Add</Button>
            </div>
            <ul className="space-y-1">
              {fields.map((f, i) => (
                <li key={i} className="flex justify-between items-center group">
                  <span>{f}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => removeField(i)}
                  >
                    ✕
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>


      </div>

      {/* RIGHT: Register + Instructions */}
      <div className="w-[45%] flex flex-col gap-4">
        <Button
          className="bg-green-600 text-white self-end px-6"
          onClick={() => updateCode(fields, procedures)}
        >
          Register
        </Button>

        {/* Procedures */}
        <Card>
          <CardHeader>
            <CardTitle>Procedures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Select
                value={selectedProcedure}
                onValueChange={setSelectedProcedure}
              >
                <SelectTrigger className="flex-1 bg-white border border-gray-300">
                  <SelectValue placeholder="Select procedure" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300">
                  {PREDEFINED_PROCEDURES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addProcedure}>Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col overflow-hidden">
          
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-4 font-mono text-sm">
            {procedures.length === 0 ? (
              <div className="italic text-gray-500">∅</div>
            ) : (
              procedures.map((p) => {
                const ok = getParentLevelStatus(p);
                return (
                  <Card
                    key={p.id}
                    className="p-4 border rounded-lg space-y-2 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold break-all">{p.name}</div>
                      <div className="flex items-center gap-2">
                        <span>{ok ? "✅" : "❌"}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProcedure(p.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(["success", "fail", "redo"] as const).map((type) => (
                        <Select
                          key={type}
                          onValueChange={(v) =>
                            addNestedProcedure(p.id, type, v)
                          }
                        >
                          <SelectTrigger className="bg-white border border-gray-300">
                            <SelectValue placeholder={type.toUpperCase()} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-300">
                            {NESTED_PROCEDURES.map((np) => (
                              <SelectItem
                                key={np}
                                value={np}
                                disabled={np === p.name && type !== "redo"}
                              >
                                {np}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>

                    <div className="ml-4 text-xs italic text-gray-600 space-y-1">
                      {(["success", "fail", "redo"] as const).map((type) => {
                        const nested = p[type];
                        if (!nested) return null;
                        return (
                          <div key={type} className="flex justify-between">
                            <span>
                              ↳ {type} → {nested.name}
                            </span>
                            <span
                              className={
                                getNestedFlowStatus(p, type)
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {getNestedFlowStatus(p, type) ? "✅" : "❌"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
