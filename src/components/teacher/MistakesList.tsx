import type { SessionDocument } from "@/lib/server/firestore";

interface MistakesListProps {
  sessions: SessionDocument[];
}

interface MistakeEntry {
  name: string;
  topic: string;
  count: number;
  studentCount: number;
}

export function MistakesList({ sessions }: MistakesListProps) {
  // Aggregate errors from all sessions
  const mistakeMap = new Map<
    string,
    { count: number; students: Set<string>; topic: string }
  >();

  for (const session of sessions) {
    for (const step of session.steps) {
      if (step.status !== "error") continue;
      const key = step.note.toLowerCase().trim();
      const existing = mistakeMap.get(key);
      if (existing) {
        existing.count++;
        existing.students.add(session.studentName);
      } else {
        mistakeMap.set(key, {
          count: 1,
          students: new Set([session.studentName]),
          topic: session.topic,
        });
      }
    }
  }

  // Sort by count descending, take top 3
  const mistakes: MistakeEntry[] = Array.from(mistakeMap.entries())
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      topic: data.topic.charAt(0).toUpperCase() + data.topic.slice(1),
      count: data.count,
      studentCount: data.students.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const maxCount = mistakes.length > 0 ? mistakes[0].count : 1;

  if (mistakes.length === 0) {
    return (
      <div className="mb-8">
        <div className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">
          Most Common Mistakes
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-500">
          No errors recorded yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">
        Most Common Mistakes
      </div>
      <div className="flex flex-col gap-3">
        {mistakes.map((mistake) => (
          <div
            key={mistake.name}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {mistake.name}
              </div>
              <div className="text-xs text-gray-500">
                {mistake.topic} · Seen across {mistake.studentCount} student
                {mistake.studentCount !== 1 ? "s" : ""}
              </div>
              <div className="h-1 bg-gray-100 rounded mt-2 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded"
                  style={{
                    width: `${Math.round((mistake.count / maxCount) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col items-end ml-4">
              <div className="text-xl font-bold text-red-500">
                {mistake.count}
              </div>
              <div className="text-xs text-gray-500">occurrences</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
