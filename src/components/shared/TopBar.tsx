import Link from "next/link";

interface TopBarProps {
  topic: string;
  status: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function TopBar({
  topic,
  status,
  actionLabel = "End Session",
  onAction,
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-bold text-[#2563eb]">
          Alan
        </Link>
        <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#2563eb]">
          {topic}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className={`inline-block h-2 w-2 rounded-full ${onAction ? "bg-[#16a34a]" : "bg-gray-400"}`} />
          {status}
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
