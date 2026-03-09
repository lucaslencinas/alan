"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Topic } from "@/types/session";
import TopicSelector from "@/components/session/TopicSelector";
import NameInput from "@/components/session/NameInput";
import ClassCodeInput from "@/components/session/ClassCodeInput";
import QRCodeDisplay from "@/components/session/QRCodeDisplay";
import ConnectionStatus from "@/components/session/ConnectionStatus";
import { getSocket, type TypedSocket } from "@/lib/client/socket-client";

export default function SessionSetupPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic>("integrals");
  const [studentName, setStudentName] = useState("");
  const [classCode, setClassCode] = useState("MATH");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [creating, setCreating] = useState(false);
  const socketRef = useRef<TypedSocket | null>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

  const handleCreateSession = useCallback(() => {
    if (!studentName.trim() || creating) return;

    setCreating(true);
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("create-session", {
      topic: selectedTopic,
      studentName: studentName.trim(),
      classCode: classCode.trim(),
    }, (id: string) => {
      setSessionId(id);
      setCreating(false);
    });

    socket.on("phone-connected", () => {
      setPhoneConnected(true);
    });
  }, [studentName, selectedTopic, classCode, creating]);

  useEffect(() => {
    if (phoneConnected && sessionId) {
      const timeout = setTimeout(() => {
        router.push(`/session/${sessionId}/display`);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [phoneConnected, sessionId, router]);

  // Don't disconnect on unmount — the display page will reuse or create a new socket.
  // The creator socket stays alive until the display page takes over.

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex justify-between items-center px-12 py-4 bg-white border-b border-gray-200">
        <Link href="/" className="text-[22px] font-bold text-[#2563eb] no-underline">
          Alan
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 no-underline">
          &larr; Back
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-12 w-full max-w-[480px] text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start a session</h1>
          <p className="text-sm text-gray-500 mb-8">
            Pick a topic, connect your phone, and start solving.
          </p>

          <TopicSelector selectedTopic={selectedTopic} onSelect={setSelectedTopic} />
          <NameInput value={studentName} onChange={setStudentName} />
          <ClassCodeInput value={classCode} onChange={setClassCode} />

          {!sessionId ? (
            <button
              type="button"
              onClick={handleCreateSession}
              disabled={!studentName.trim() || creating}
              className="w-full py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-semibold rounded-full transition-colors cursor-pointer"
            >
              {creating ? "Creating..." : "Create Session"}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-widest">Then</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <QRCodeDisplay sessionId={sessionId} appUrl={appUrl} />
              <ConnectionStatus connected={phoneConnected} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
