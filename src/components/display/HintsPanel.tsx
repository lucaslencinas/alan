"use client";

import type { Hint } from "@/types/session";
import HintCard from "./HintCard";

interface HintsPanelProps {
  hints: Hint[];
}

export default function HintsPanel({ hints }: HintsPanelProps) {
  return (
    <div className="flex w-80 flex-col border-l border-gray-200 bg-white overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 text-sm font-semibold text-gray-900">
        <span className="text-base">💡</span>
        Hints &amp; References
      </div>
      <div className="flex-1">
        {hints.map((hint) => (
          <HintCard key={hint.id} hint={hint} />
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200 px-5 py-4">
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          Hints help you learn without giving away the answer.
        </p>
      </div>
    </div>
  );
}
