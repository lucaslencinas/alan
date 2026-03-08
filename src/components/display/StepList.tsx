"use client";

import { useEffect, useRef } from "react";
import type { Step } from "@/types/session";
import StepCard from "./StepCard";

interface StepListProps {
  steps: Step[];
}

export default function StepList({ steps }: StepListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps.length]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-12 py-8">
      <div className="mb-6 text-sm font-medium text-gray-500">Your work</div>
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <StepCard key={step.stepNumber} step={step} />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
