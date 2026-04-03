export type PromptType =
  | "text_input"
  | "single_select"
  | "multi_select"
  | "video"
  | "textarea";

export type StepType = "basics" | "videos" | "profile";

export interface PromptOption {
  id: string;
  label: string;
  sort_order: number;
}

export interface Prompt {
  id: string;
  label: string;
  type: PromptType;
  required: boolean;
  sort_order: number;
  options: PromptOption[];
}

export interface PromptSection {
  id: string;
  title: string;
  step: StepType;
  sort_order: number;
  prompts: Prompt[];
}
