import type { SessionDocument } from "@/lib/server/firestore";

interface StatsGridProps {
  sessions: SessionDocument[];
}

export function StatsGrid({ sessions }: StatsGridProps) {
  const totalSessions = sessions.length;

  const uniqueStudents = new Set(sessions.map((s) => s.studentName)).size;

  // Average accuracy: correct steps / total steps across all sessions
  let totalSteps = 0;
  let correctSteps = 0;
  for (const session of sessions) {
    for (const step of session.steps) {
      totalSteps++;
      if (step.status === "correct") correctSteps++;
    }
  }
  const avgAccuracy = totalSteps > 0 ? Math.round((correctSteps / totalSteps) * 100) : 0;

  // Average session duration
  const totalDuration = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const avgDurationSec = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
  const avgDurationMin = Math.round(avgDurationSec / 60);
  const maxDurationMin = Math.round(
    Math.max(0, ...sessions.map((s) => s.durationSeconds || 0)) / 60
  );

  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions.toString(),
      sub: `${uniqueStudents} students`,
    },
    {
      label: "Active Students",
      value: uniqueStudents.toString(),
      sub: "unique students",
    },
    {
      label: "Avg. Accuracy",
      value: `${avgAccuracy}%`,
      sub: `${totalSteps} total steps`,
      positive: avgAccuracy >= 70,
    },
    {
      label: "Avg. Session",
      value: `${avgDurationMin}m`,
      sub: `${maxDurationMin} min longest`,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-xl p-5"
        >
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            {stat.label}
          </div>
          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          <div
            className={`text-xs mt-1 ${
              stat.positive ? "text-green-600" : "text-gray-500"
            }`}
          >
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
