"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CameraFeed, { CameraFeedHandle } from "@/components/phone/CameraFeed";
import SpeakingOverlay from "@/components/phone/SpeakingOverlay";
import Controls from "@/components/phone/Controls";
import { getSocket, disconnectSocket } from "@/lib/client/socket-client";
import { captureFrame } from "@/lib/client/media-capture";
import {
  startMicCapture,
  stopMicCapture,
  muteMic,
  unmuteMic,
} from "@/lib/client/audio-capture";
import {
  initAudioPlayback,
  playAudioChunk,
  stopPlayback,
} from "@/lib/client/audio-playback";

export default function PhonePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;

  const cameraRef = useRef<CameraFeedHandle>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isMuted, setIsMuted] = useState(false);
  const [displayConnected, setDisplayConnected] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [topic, setTopic] = useState("");

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Socket connection and event handling
  useEffect(() => {
    const socket = getSocket();

    socket.emit("join-session", { sessionId, role: "phone" });

    socket.on("session-joined", (data) => {
      if (data.role === "phone") {
        // Read topic from URL search params or default
        const urlParams = new URLSearchParams(window.location.search);
        setTopic(urlParams.get("topic") || "");
      }
    });

    socket.on("display-connected", () => {
      setDisplayConnected(true);
    });

    socket.on("audio-response", (data) => {
      playAudioChunk(data.audio);
    });

    socket.on("function-call", (data) => {
      // Show speaking overlay with context from function calls
      let text = "";
      if (data.name === "show_step") {
        const args = data.args as { note?: string };
        text = args.note || "";
      } else if (data.name === "show_hint") {
        const args = data.args as { content?: string };
        text = args.content || "";
      } else if (data.name === "show_summary") {
        const args = data.args as { feedback?: string };
        text = args.feedback || "";
      }

      if (text) {
        setSpeakingText(text);
        setIsSpeaking(true);

        // Clear speaking state after 5 seconds of no function calls
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
        }
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
        }, 5000);
      }
    });

    socket.on("session-ended", () => {
      router.push("/");
    });

    // Start audio playback context (needs user gesture, but we init here)
    initAudioPlayback();

    return () => {
      socket.off("session-joined");
      socket.off("display-connected");
      socket.off("audio-response");
      socket.off("function-call");
      socket.off("session-ended");
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, [sessionId, router]);

  // Camera frame capture interval (~1/sec)
  useEffect(() => {
    const socket = getSocket();

    frameIntervalRef.current = setInterval(() => {
      const video = cameraRef.current?.videoElement;
      if (!video) return;
      const frame = captureFrame(video);
      if (frame) {
        socket.emit("video-frame", { frame });
      }
    }, 1000);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  // Mic capture
  useEffect(() => {
    const socket = getSocket();

    startMicCapture((base64Pcm) => {
      socket.emit("audio-data", { audio: base64Pcm });
    }).catch((err) => {
      console.error("Failed to start mic capture:", err);
    });

    return () => {
      stopMicCapture();
    };
  }, []);

  const handleFlip = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const handleMicToggle = useCallback(() => {
    setIsMuted((prev) => {
      if (prev) {
        unmuteMic();
      } else {
        muteMic();
      }
      return !prev;
    });
  }, []);

  const handleEnd = useCallback(() => {
    const socket = getSocket();
    socket.emit("end-session");
    stopMicCapture();
    stopPlayback();
    disconnectSocket();
    router.push("/");
  }, [router]);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-black">
      {/* Camera feed (full background) */}
      <CameraFeed ref={cameraRef} facingMode={facingMode} />

      {/* Top overlay */}
      <div className="relative z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white">Alan</span>
          {topic && (
            <span className="rounded-xl bg-blue-500/30 px-2.5 py-0.5 text-[11px] font-medium text-blue-300">
              {topic.charAt(0).toUpperCase() + topic.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-300">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              displayConnected ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          {displayConnected ? "Display connected" : "Waiting for display..."}
        </div>
      </div>

      {/* Spacer pushes speaking overlay and controls to bottom */}
      <div className="flex-1" />

      {/* Speaking overlay */}
      <SpeakingOverlay visible={isSpeaking} text={speakingText} />

      {/* Timer */}
      <div className="relative z-10 py-2 text-center text-[13px] tabular-nums text-white/60">
        {formatTime(elapsed)}
      </div>

      {/* Bottom controls */}
      <Controls
        onFlip={handleFlip}
        onMicToggle={handleMicToggle}
        onEnd={handleEnd}
        isMuted={isMuted}
      />
    </div>
  );
}
