"use client";

import type { Topic } from "@/types/session";

const topics: { value: Topic; title: string; subtitle: string }[] = [
  { value: "integrals", title: "Integrals", subtitle: "Definite, indefinite, by parts" },
  { value: "equations", title: "Equations", subtitle: "Polynomial, quadratic, linear" },
];

interface TopicSelectorProps {
  selectedTopic: Topic;
  onSelect: (topic: Topic) => void;
}

export default function TopicSelector({ selectedTopic, onSelect }: TopicSelectorProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 text-left mb-3 uppercase tracking-wide">
        What are you studying?
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {topics.map((topic) => {
          const selected = selectedTopic === topic.value;
          return (
            <button
              key={topic.value}
              type="button"
              onClick={() => onSelect(topic.value)}
              className={`text-left rounded-xl p-5 border-2 transition-all cursor-pointer ${
                selected
                  ? "border-[#2563eb] bg-blue-50"
                  : "border-gray-200 bg-white hover:border-[#2563eb] hover:bg-blue-50/30"
              }`}
            >
              <h4 className="text-[15px] font-semibold text-gray-900 mb-1">{topic.title}</h4>
              <p className="text-xs text-gray-500">{topic.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
