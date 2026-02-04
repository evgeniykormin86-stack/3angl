import stepsData from "./steps/list.json";

export interface Step {
  id: string;
  name: string;
  input: Record<string, any>;
  output: Record<string, any>;
}

interface AgentSteps {
  agentName: string;
  steps: Step[];
}

export function getSteps(): Step[] {
  const data = stepsData as AgentSteps;
  return data.steps;
}