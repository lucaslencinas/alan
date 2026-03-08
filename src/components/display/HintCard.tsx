"use client";

import { useState } from "react";
import type { Hint } from "@/types/session";
import MathRenderer from "./MathRenderer";

const badgeConfig = {
  nudge: { bg: "bg-blue-50", text: "text-[#2563eb]" },
  formula: { bg: "bg-green-50", text: "text-green-700" },
  explain: { bg: "bg-yellow-50", text: "text-yellow-700" },
} as const;

interface HintCardProps {
  hint: Hint;
}

export default function HintCard({ hint }: HintCardProps) {
  const [expanded, setExpanded] = useState(false);
  const badge = badgeConfig[hint.type];

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`cursor-pointer border-b border-gray-100 px-5 py-4 transition-colors hover:bg-gray-50 ${
        expanded ? "bg-gray-50" : ""
      }`}
    >
      <span
        className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badge.bg} ${badge.text}`}
      >
        {hint.type}
      </span>
      <div className="mb-1 text-sm font-medium text-gray-900">{hint.title}</div>
      <div className="truncate text-[13px] leading-relaxed text-gray-500">
        {hint.content}
      </div>
      {expanded && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3.5">
          <div className="mb-2 text-[13px] leading-relaxed text-gray-700">
            {hint.content}
          </div>
          {hint.formulaLatex && hint.formulaPlain && (
            <div className="rounded-md bg-gray-100 p-3 text-center text-lg text-gray-900">
              <MathRenderer latex={hint.formulaLatex} plainText={hint.formulaPlain} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
