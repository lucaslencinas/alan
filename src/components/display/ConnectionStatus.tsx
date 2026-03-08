"use client";

interface ConnectionStatusProps {
  connected: boolean;
}

export default function ConnectionStatus({ connected }: ConnectionStatusProps) {
  if (connected) {
    return (
      <div className="mt-5 px-4 py-3 bg-green-50 rounded-lg text-[13px] text-green-700 flex items-center justify-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        Phone connected!
      </div>
    );
  }

  return (
    <div className="mt-5 px-4 py-3 bg-amber-50 rounded-lg text-[13px] text-amber-700 flex items-center justify-center gap-2">
      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      Waiting for phone to connect...
    </div>
  );
}
