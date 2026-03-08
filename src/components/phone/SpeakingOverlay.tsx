"use client";

interface SpeakingOverlayProps {
  visible: boolean;
  text: string;
}

function WaveBars() {
  return (
    <span className="inline-flex items-center gap-[2px]">
      {[6, 10, 7, 12, 5].map((h, i) => (
        <span
          key={i}
          className="block w-[2px] rounded-sm bg-[#2563eb] animate-pulse"
          style={{
            height: h,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </span>
  );
}

export default function SpeakingOverlay({ visible, text }: SpeakingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="relative z-10 mx-5 mb-auto mt-0 rounded-2xl bg-white/95 px-5 py-4 shadow-lg">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#2563eb]">
        <WaveBars />
        Alan is speaking
      </div>
      {text && (
        <p className="text-sm leading-snug text-gray-700">
          &ldquo;{text}&rdquo;
        </p>
      )}
    </div>
  );
}
