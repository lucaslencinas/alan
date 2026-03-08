export type StepStatus = "correct" | "error" | "warning";
export type HintType = "nudge" | "formula" | "explain";
export type Topic = "integrals" | "equations";
export type SessionRole = "phone" | "display";

export interface Step {
  stepNumber: number;
  label: string;
  mathLatex: string;
  mathPlain: string;
  status: StepStatus;
  note: string;
  correctionLatex?: string;
  correctionPlain?: string;
}

export interface Hint {
  id: string;
  type: HintType;
  title: string;
  content: string;
  formulaLatex?: string;
  formulaPlain?: string;
}

export interface ProblemSummary {
  problemLatex: string;
  problemPlain: string;
  totalSteps: number;
  correctSteps: number;
  errorSteps: number;
  feedback: string;
}

export interface Session {
  id: string;
  studentName: string;
  classCode: string;
  topic: Topic;
  createdAt: Date;
  endedAt: Date | null;
  durationSeconds: number;
  steps: StepRecord[];
  summary: SummaryRecord | null;
}

export interface StepRecord {
  stepNumber: number;
  label: string;
  mathPlain: string;
  status: StepStatus;
  note: string;
  correctionPlain: string | null;
}

export interface SummaryRecord {
  problemPlain: string;
  totalSteps: number;
  correctSteps: number;
  errorSteps: number;
  feedback: string;
}
