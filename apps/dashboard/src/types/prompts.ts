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

export function tempId(): string {
  return `temp_${crypto.randomUUID()}`;
}

export function isTempId(id: string): boolean {
  return id.startsWith("temp_");
}

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  text_input: "Text Input",
  single_select: "Single Select",
  multi_select: "Multi Select",
  video: "Video",
  textarea: "Text Area",
};

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  basics: "Basics",
  videos: "Videos",
  profile: "Profile",
};
