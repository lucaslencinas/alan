import type { SessionDocument } from "@/lib/server/firestore";

interface TopicBreakdownProps {
  sessions: SessionDocument[];
}

export function TopicBreakdown({ sessions }: TopicBreakdownProps) {
  const integralCount = sessions.filter((s) => s.topic === "integrals").length;
  const equationCount = sessions.filter((s) => s.topic === "equations").length;
  const total = Math.max(integralCount, equationCount, 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Topic Breakdown
      </h3>
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Integrals</span>
            <span className="text-sm text-gray-500">
              {integralCount} session{integralCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded mt-1 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded"
              style={{
                width: `${Math.round((integralCount / total) * 100)}%`,
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Equations</span>
            <span className="text-sm text-gray-500">
              {equationCount} session{equationCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded mt-1 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded"
              style={{
                width: `${Math.round((equationCount / total) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
