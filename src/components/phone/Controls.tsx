"use client";

interface ControlsProps {
  onFlip: () => void;
  onMicToggle: () => void;
  onEnd: () => void;
  isMuted: boolean;
}

export default function Controls({
  onFlip,
  onMicToggle,
  onEnd,
  isMuted,
}: ControlsProps) {
  return (
    <div className="relative z-10 flex items-center justify-center gap-8 bg-gradient-to-t from-black/70 to-transparent px-5 pb-10 pt-5">
      {/* Flip camera */}
      <div className="flex flex-col items-center">
        <button
          onClick={onFlip}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl text-white backdrop-blur-sm"
          aria-label="Flip camera"
        >
          <FlipIcon />
        </button>
        <span className="mt-1.5 text-[10px] text-white/70">Flip</span>
      </div>

      {/* Mic toggle */}
      <div className="flex flex-col items-center">
        <button
          onClick={onMicToggle}
          className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white ${
            isMuted ? "bg-gray-500" : "bg-[#2563eb]"
          }`}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </button>
        <span className="mt-1.5 text-[10px] text-white/70">
          {isMuted ? "Mic Off" : "Mic On"}
        </span>
      </div>

      {/* End session */}
      <div className="flex flex-col items-center">
        <button
          onClick={onEnd}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dc2626] text-xl text-white"
          aria-label="End session"
        >
          <EndIcon />
        </button>
        <span className="mt-1.5 text-[10px] text-white/70">End</span>
      </div>
    </div>
  );
}

function FlipIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function EndIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
