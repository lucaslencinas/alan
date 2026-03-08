import { getSessions } from "@/lib/server/firestore";
import { StatsGrid } from "@/components/teacher/StatsGrid";
import { MistakesList } from "@/components/teacher/MistakesList";
import { StudentsTable } from "@/components/teacher/StudentsTable";
import { TopicBreakdown } from "@/components/teacher/TopicBreakdown";
import { InsightsPanel } from "@/components/teacher/InsightsPanel";
import Link from "next/link";

export default async function TeacherPage() {
  const sessions = await getSessions();

  const uniqueStudents = new Set(sessions.map((s) => s.studentName)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Alan
          </Link>
          <div className="flex gap-1">
            <span className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
              Dashboard
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500">Math class</div>
      </div>

      <div className="flex max-w-[1200px] mx-auto p-8 gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Math</h1>
              <p className="text-sm text-gray-500">
                {uniqueStudents} student{uniqueStudents !== 1 ? "s" : ""} ·{" "}
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Class Code
              </div>
              <div className="text-xl font-bold text-blue-600 tracking-widest font-mono">
                MATH
              </div>
            </div>
          </div>

          <StatsGrid sessions={sessions} />
          <MistakesList sessions={sessions} />
          <StudentsTable sessions={sessions} />
        </div>

        {/* Sidebar */}
        <div className="w-80">
          <TopicBreakdown sessions={sessions} />
          <InsightsPanel sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
