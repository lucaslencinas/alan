"use client";

import type { Step } from "@/types/session";
import MathRenderer from "./MathRenderer";

const statusConfig = {
  correct: {
    icon: "\u2713",
    circleBg: "bg-green-50",
    circleText: "text-green-600",
    borderColor: "border-l-green-500",
  },
  error: {
    icon: "\u2715",
    circleBg: "bg-red-50",
    circleText: "text-red-600",
    borderColor: "border-l-red-500",
  },
  warning: {
    icon: "!",
    circleBg: "bg-yellow-50",
    circleText: "text-yellow-600",
    borderColor: "border-l-yellow-500",
  },
} as const;

interface StepCardProps {
  step: Step;
}

export default function StepCard({ step }: StepCardProps) {
  const config = statusConfig[step.status];

  return (
    <div
      className={`flex items-start gap-4 rounded-xl border border-gray-200 border-l-[3px] bg-white p-5 px-6 ${config.borderColor}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-semibold ${config.circleBg} ${config.circleText}`}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
          Step {step.stepNumber} &mdash; {step.label}
        </div>
        <div className="mb-1.5 text-[22px]">
          <MathRenderer latex={step.mathLatex} plainText={step.mathPlain} />
        </div>
        <div className="text-[13px] leading-relaxed text-gray-500">
          {step.note}
        </div>
        {step.status === "error" && step.correctionLatex && step.correctionPlain && (
          <div className="mt-2.5 flex items-center gap-3 rounded-lg bg-gray-100 px-3.5 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-green-600 whitespace-nowrap">
              Should be
            </span>
            <span className="text-lg text-green-600">
              <MathRenderer latex={step.correctionLatex} plainText={step.correctionPlain} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
