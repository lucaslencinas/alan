import { Type, type FunctionDeclaration } from "@google/genai";

const showStep: FunctionDeclaration = {
  name: "show_step",
  description:
    "Show an evaluation of a step the student has written on paper. Call this for EVERY step you identify in the student's work. Use 'correct' if the step is mathematically right, 'error' if there's a mistake, and 'warning' if it's technically okay but could be improved or carries forward a previous error.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      step_number: {
        type: Type.NUMBER,
        description: "Step number (1, 2, 3...)",
      },
      label: {
        type: Type.STRING,
        description: "Short label like 'Problem setup' or 'Second term'",
      },
      math_latex: {
        type: Type.STRING,
        description: "LaTeX representation of what the student wrote",
      },
      math_plain: {
        type: Type.STRING,
        description: "Plain text fallback of the student's work",
      },
      status: {
        type: Type.STRING,
        enum: ["correct", "error", "warning"],
        description: "Whether the step is correct, has an error, or a warning",
      },
      note: {
        type: Type.STRING,
        description:
          "Brief explanation of why this step is correct/wrong",
      },
      correction_latex: {
        type: Type.STRING,
        description:
          "LaTeX of the correct version (only if status is error)",
      },
      correction_plain: {
        type: Type.STRING,
        description:
          "Plain text of the correct version (only if status is error)",
      },
    },
    required: [
      "step_number",
      "label",
      "math_latex",
      "math_plain",
      "status",
      "note",
    ],
  },
};

const showHint: FunctionDeclaration = {
  name: "show_hint",
  description:
    "Show a hint or reference formula in the hints sidebar. Use 'nudge' for gentle guidance without giving the answer, 'formula' for a reference formula the student should know, 'explain' for a conceptual explanation. Do NOT give away the full solution in hints.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ["nudge", "formula", "explain"],
        description: "The type of hint",
      },
      title: {
        type: Type.STRING,
        description: "Short title for the hint",
      },
      content: {
        type: Type.STRING,
        description: "The hint text",
      },
      formula_latex: {
        type: Type.STRING,
        description: "LaTeX formula (only for type 'formula')",
      },
      formula_plain: {
        type: Type.STRING,
        description: "Plain text formula fallback",
      },
    },
    required: ["type", "title", "content"],
  },
};

const clearSteps: FunctionDeclaration = {
  name: "clear_steps",
  description:
    "Clear all step evaluations and hints from the display. Call this when the student starts working on a new problem.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: {
        type: Type.STRING,
        description: "Why clearing (e.g. 'Starting new problem')",
      },
    },
    required: ["reason"],
  },
};

const showSummary: FunctionDeclaration = {
  name: "show_summary",
  description:
    "Show a summary card after the student finishes solving a problem. Include overall feedback and encouragement.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      problem_latex: {
        type: Type.STRING,
        description: "LaTeX of the original problem",
      },
      problem_plain: {
        type: Type.STRING,
        description: "Plain text of the original problem",
      },
      total_steps: {
        type: Type.NUMBER,
        description: "Total number of steps",
      },
      correct_steps: {
        type: Type.NUMBER,
        description: "Number of correct steps",
      },
      error_steps: {
        type: Type.NUMBER,
        description: "Number of steps with errors",
      },
      feedback: {
        type: Type.STRING,
        description: "Overall encouraging feedback",
      },
    },
    required: [
      "problem_latex",
      "problem_plain",
      "total_steps",
      "correct_steps",
      "error_steps",
      "feedback",
    ],
  },
};

export const toolDeclarations: FunctionDeclaration[] = [
  showStep,
  showHint,
  clearSteps,
  showSummary,
];
