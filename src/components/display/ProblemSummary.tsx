"use client";

import type { ProblemSummary as ProblemSummaryType } from "@/types/session";
import MathRenderer from "./MathRenderer";

interface ProblemSummaryProps {
  summary: ProblemSummaryType;
}

export default function ProblemSummary({ summary }: ProblemSummaryProps) {
  return (
    <div className="mx-12 mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Problem Summary
      </div>
      <div className="mb-4 text-xl">
        <MathRenderer latex={summary.problemLatex} plainText={summary.problemPlain} />
      </div>
      <div className="mb-4 flex gap-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-xs text-green-600">
            &#x2713;
          </span>
          <span className="text-sm text-gray-700">
            {summary.correctSteps} correct
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-xs text-red-600">
            &#x2715;
          </span>
          <span className="text-sm text-gray-700">
            {summary.errorSteps} error{summary.errorSteps !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {summary.totalSteps} total steps
        </div>
      </div>
      <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
        {summary.feedback}
      </div>
    </div>
  );
}
