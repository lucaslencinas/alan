"use client";

import { useEffect, useRef, useState } from "react";

interface SpeakingBarProps {
  text: string | null;
}

export default function SpeakingBar({ text }: SpeakingBarProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (text) {
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text]);

  if (!visible || !text) return null;

  return (
    <div className="flex items-center gap-2.5 bg-[#dbeafe] px-6 py-3 text-[13px] font-medium text-[#2563eb]">
      <div className="flex items-center gap-0.5">
        <span className="block w-[3px] rounded-sm bg-[#2563eb]" style={{ height: 8 }} />
        <span className="block w-[3px] rounded-sm bg-[#2563eb]" style={{ height: 14 }} />
        <span className="block w-[3px] rounded-sm bg-[#2563eb]" style={{ height: 10 }} />
        <span className="block w-[3px] rounded-sm bg-[#2563eb]" style={{ height: 16 }} />
        <span className="block w-[3px] rounded-sm bg-[#2563eb]" style={{ height: 6 }} />
      </div>
      Alan is speaking:
      <span className="font-normal text-gray-700">&ldquo;{text}&rdquo;</span>
    </div>
  );
}
