import type { TargetAgent } from "@/lib/types";

export interface AgentOption {
  id: TargetAgent;
  label: string;
  /** Short line shown under the label in the picker. */
  description: string;
  /** Where/how to paste the prompt, shown on the result page. */
  howTo: string;
}

export const AGENTS: AgentOption[] = [
  {
    id: "general",
    label: "Any agent",
    description: "Works everywhere",
    howTo: "Paste it into any AI coding agent's chat. It also asks the agent to save the brief to docs/PROJECT_BRIEF.md.",
  },
  {
    id: "claude_code",
    label: "Claude Code",
    description: "Anthropic",
    howTo: "Paste it into Claude Code. It asks Claude to plan first and save the brief to CLAUDE.md so later sessions remember it.",
  },
  {
    id: "codex",
    label: "Codex",
    description: "OpenAI",
    howTo: "Paste it as a Codex task. It asks Codex to save the brief and commands to AGENTS.md, which Codex reads automatically.",
  },
  {
    id: "cursor",
    label: "Cursor",
    description: "Agent mode",
    howTo: "Paste it into Cursor's Agent. It asks Cursor to save project rules in .cursor/rules/ and build one milestone at a time.",
  },
  {
    id: "antigravity",
    label: "Antigravity",
    description: "Google",
    howTo: "Paste it into an Antigravity agent. It asks for an implementation plan and task list first, then browser checks as it builds.",
  },
];

export function agentById(id?: string | null): AgentOption {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0];
}
