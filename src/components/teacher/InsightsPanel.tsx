import type { SessionDocument } from "@/lib/server/firestore";

interface InsightsPanelProps {
  sessions: SessionDocument[];
}

interface Insight {
  icon: string;
  text: string;
}

export function InsightsPanel({ sessions }: InsightsPanelProps) {
  const insights = generateInsights(sessions);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">AI Insights</h3>
      {insights.length === 0 ? (
        <div className="text-sm text-gray-500">
          Not enough data for insights yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {insights.map((insight, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="text-base mt-0.5">{insight.icon}</span>
              <div
                className="text-sm text-gray-500 leading-relaxed [&>strong]:text-gray-900"
                dangerouslySetInnerHTML={{ __html: insight.text }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generateInsights(sessions: SessionDocument[]): Insight[] {
  const insights: Insight[] = [];

  if (sessions.length === 0) return insights;

  // 1. Common mistake insight: find the most frequent error note
  const errorNotes = new Map<string, Set<string>>();
  for (const session of sessions) {
    for (const step of session.steps) {
      if (step.status === "error") {
        const key = step.note.toLowerCase().trim();
        const existing = errorNotes.get(key);
        if (existing) {
          existing.add(session.studentName);
        } else {
          errorNotes.set(key, new Set([session.studentName]));
        }
      }
    }
  }

  if (errorNotes.size > 0) {
    const [topError, topStudents] = Array.from(errorNotes.entries()).sort(
      (a, b) => b[1].size - a[1].size
    )[0];
    if (topStudents.size >= 2) {
      insights.push({
        icon: "\u26A0\uFE0F",
        text: `<strong>${topStudents.size} students</strong> made the same error: "${topError}". Consider reviewing this in class.`,
      });
    }
  }

  // 2. Top student insight
  const studentAccuracy = new Map<
    string,
    { correct: number; total: number; sessionCount: number }
  >();
  for (const session of sessions) {
    const existing = studentAccuracy.get(session.studentName) || {
      correct: 0,
      total: 0,
      sessionCount: 0,
    };
    existing.sessionCount++;
    for (const step of session.steps) {
      existing.total++;
      if (step.status === "correct") existing.correct++;
    }
    studentAccuracy.set(session.studentName, existing);
  }

  const studentsWithEnoughData = Array.from(studentAccuracy.entries())
    .filter(([, data]) => data.total >= 5)
    .map(([name, data]) => ({
      name,
      accuracy: Math.round((data.correct / data.total) * 100),
      sessionCount: data.sessionCount,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  if (studentsWithEnoughData.length > 0) {
    const top = studentsWithEnoughData[0];
    insights.push({
      icon: "\uD83D\uDCC8",
      text: `<strong>${top.name}</strong> has the highest accuracy at ${top.accuracy}% across ${top.sessionCount} sessions.`,
    });
  }

  // 3. Inactive students
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const allStudents = new Set(sessions.map((s) => s.studentName));
  const recentStudents = new Set<string>();
  for (const session of sessions) {
    const sessionDate =
      session.createdAt instanceof Date
        ? session.createdAt
        : session.createdAt.toDate();
    if (sessionDate > oneWeekAgo) {
      recentStudents.add(session.studentName);
    }
  }
  const inactiveCount = allStudents.size - recentStudents.size;
  if (inactiveCount > 0) {
    insights.push({
      icon: "\uD83D\uDD34",
      text: `<strong>${inactiveCount} student${inactiveCount !== 1 ? "s" : ""}</strong> haven't practiced in over a week.`,
    });
  }

  // 4. Practice frequency insight
  if (studentsWithEnoughData.length >= 4) {
    const frequentPracticers = studentsWithEnoughData.filter(
      (s) => s.sessionCount >= 3
    );
    const infrequentPracticers = studentsWithEnoughData.filter(
      (s) => s.sessionCount < 3
    );
    if (frequentPracticers.length > 0 && infrequentPracticers.length > 0) {
      const freqAvg = Math.round(
        frequentPracticers.reduce((sum, s) => sum + s.accuracy, 0) /
          frequentPracticers.length
      );
      const infreqAvg = Math.round(
        infrequentPracticers.reduce((sum, s) => sum + s.accuracy, 0) /
          infrequentPracticers.length
      );
      const diff = freqAvg - infreqAvg;
      if (diff > 5) {
        insights.push({
          icon: "\uD83D\uDCA1",
          text: `Students who practiced <strong>3+ sessions</strong> have ${diff}% higher accuracy than those with fewer sessions.`,
        });
      }
    }
  }

  return insights;
}
