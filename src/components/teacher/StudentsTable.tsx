import type { SessionDocument } from "@/lib/server/firestore";

interface StudentsTableProps {
  sessions: SessionDocument[];
}

interface StudentRow {
  name: string;
  initials: string;
  sessionCount: number;
  topics: string[];
  accuracy: number;
  lastActive: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(timestamp: { toDate(): Date } | Date): string {
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 60) return diffMin <= 1 ? "Just now" : `${diffMin} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;
}

function getAccuracyClass(accuracy: number): string {
  if (accuracy >= 75) return "bg-green-500";
  if (accuracy >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function StudentsTable({ sessions }: StudentsTableProps) {
  // Group sessions by student
  const studentMap = new Map<
    string,
    {
      sessions: SessionDocument[];
      topics: Set<string>;
      totalSteps: number;
      correctSteps: number;
      lastActive: { toDate(): Date } | Date;
    }
  >();

  for (const session of sessions) {
    const existing = studentMap.get(session.studentName);
    const sessionDate = session.createdAt;

    if (existing) {
      existing.sessions.push(session);
      existing.topics.add(session.topic);
      for (const step of session.steps) {
        existing.totalSteps++;
        if (step.status === "correct") existing.correctSteps++;
      }
      // Keep most recent
      const existingTime =
        existing.lastActive instanceof Date
          ? existing.lastActive.getTime()
          : existing.lastActive.toDate().getTime();
      const currentTime =
        sessionDate instanceof Date
          ? sessionDate.getTime()
          : sessionDate.toDate().getTime();
      if (currentTime > existingTime) {
        existing.lastActive = sessionDate;
      }
    } else {
      let totalSteps = 0;
      let correctSteps = 0;
      for (const step of session.steps) {
        totalSteps++;
        if (step.status === "correct") correctSteps++;
      }
      studentMap.set(session.studentName, {
        sessions: [session],
        topics: new Set([session.topic]),
        totalSteps,
        correctSteps,
        lastActive: sessionDate,
      });
    }
  }

  const students: StudentRow[] = Array.from(studentMap.entries())
    .map(([name, data]) => ({
      name,
      initials: getInitials(name),
      sessionCount: data.sessions.length,
      topics: Array.from(data.topics).map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1)
      ),
      accuracy:
        data.totalSteps > 0
          ? Math.round((data.correctSteps / data.totalSteps) * 100)
          : 0,
      lastActive: formatRelativeTime(data.lastActive),
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  if (students.length === 0) {
    return (
      <div>
        <div className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">
          Students
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-500">
          No students yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">
        Students
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
              Student
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
              Sessions
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
              Topics
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
              Accuracy
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
              Last Active
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.name}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3.5 border-b border-gray-100 text-sm">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mr-2.5 align-middle">
                  {student.initials}
                </span>
                <span className="font-medium text-gray-900">
                  {student.name}
                </span>
              </td>
              <td className="px-4 py-3.5 border-b border-gray-100 text-sm">
                {student.sessionCount}
              </td>
              <td className="px-4 py-3.5 border-b border-gray-100">
                <div className="flex gap-1">
                  {student.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3.5 border-b border-gray-100 text-sm">
                <div className="inline-block w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden align-middle mr-2">
                  <div
                    className={`h-full rounded-full ${getAccuracyClass(student.accuracy)}`}
                    style={{ width: `${student.accuracy}%` }}
                  />
                </div>
                {student.accuracy}%
              </td>
              <td className="px-4 py-3.5 border-b border-gray-100 text-sm text-gray-500">
                {student.lastActive}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
