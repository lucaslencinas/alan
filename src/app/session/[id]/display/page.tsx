"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import type { Step, Hint, ProblemSummary as ProblemSummaryType } from "@/types/session";
import { getSocket, disconnectSocket } from "@/lib/client/socket-client";
import TopBar from "@/components/shared/TopBar";
import SpeakingBar from "@/components/display/SpeakingBar";
import StepList from "@/components/display/StepList";
import HintsPanel from "@/components/display/HintsPanel";
import ProblemSummaryCard from "@/components/display/ProblemSummary";

export default function DisplayPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [steps, setSteps] = useState<Step[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [summary, setSummary] = useState<ProblemSummaryType | null>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("Integrals");
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const hintCountRef = useRef(0);
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // When we get a function call, clear the thinking state
  const clearThinking = useCallback(() => {
    setIsThinking(false);
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }
  }, []);

  const handleFunctionCall = useCallback(
    (data: { name: string; args: Record<string, unknown> }) => {
      clearThinking();

      switch (data.name) {
        case "show_step": {
          const args = data.args;
          const step: Step = {
            stepNumber: args.step_number as number,
            label: args.label as string,
            mathLatex: args.math_latex as string,
            mathPlain: args.math_plain as string,
            status: args.status as Step["status"],
            note: args.note as string,
            correctionLatex: args.correction_latex as string | undefined,
            correctionPlain: args.correction_plain as string | undefined,
          };
          setSteps((prev) => [...prev, step]);
          setSpeakingText(step.note);
          break;
        }
        case "show_hint": {
          const args = data.args;
          hintCountRef.current += 1;
          const hint: Hint = {
            id: `hint-${hintCountRef.current}`,
            type: args.type as Hint["type"],
            title: args.title as string,
            content: args.content as string,
            formulaLatex: args.formula_latex as string | undefined,
            formulaPlain: args.formula_plain as string | undefined,
          };
          setHints((prev) => [...prev, hint]);
          break;
        }
        case "clear_steps": {
          setSteps([]);
          setHints([]);
          setSummary(null);
          break;
        }
        case "show_summary": {
          const args = data.args;
          setSummary({
            problemLatex: args.problem_latex as string,
            problemPlain: args.problem_plain as string,
            totalSteps: args.total_steps as number,
            correctSteps: args.correct_steps as number,
            errorSteps: args.error_steps as number,
            feedback: args.feedback as string,
          });
          setSpeakingText(args.feedback as string);
          break;
        }
      }
    },
    [clearThinking]
  );

  useEffect(() => {
    const socket = getSocket();

    socket.emit("join-session", { sessionId, role: "display" });

    socket.on("session-joined", () => {
      // Display joined successfully
    });

    socket.on("phone-connected", () => {
      setPhoneConnected(true);
      // Phone just connected — Alan will start analyzing soon
      setIsThinking(true);
      thinkingTimeoutRef.current = setTimeout(() => setIsThinking(false), 15000);
    });

    socket.on("function-call", handleFunctionCall);

    socket.on("session-ended", () => {
      setSessionEnded(true);
      setPhoneConnected(false);
    });

    // Listen for when video frames arrive (means phone is sending data)
    socket.on("phone-disconnected" as never, () => {
      setPhoneConnected(false);
    });

    return () => {
      socket.off("session-joined");
      socket.off("phone-connected");
      socket.off("function-call");
      socket.off("session-ended");
      disconnectSocket();
    };
  }, [sessionId, handleFunctionCall]);

  useEffect(() => {
    if (sessionEnded) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionEnded]);

  const handleEndSession = () => {
    const socket = getSocket();
    socket.emit("end-session");
  };

  const statusText = sessionEnded
    ? "Session ended"
    : phoneConnected
      ? `Phone connected · ${formatTime(elapsed)}`
      : "Waiting for phone...";

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar
        topic={topic.charAt(0).toUpperCase() + topic.slice(1)}
        status={statusText}
        onAction={sessionEnded ? undefined : handleEndSession}
        actionLabel={sessionEnded ? undefined : "End Session"}
      />

      {/* Thinking indicator */}
      {isThinking && !speakingText && (
        <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-6 py-3">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm text-blue-600">Alan is looking at your work...</span>
        </div>
      )}

      <SpeakingBar text={speakingText} />

      <div className="flex flex-1 overflow-hidden">
        <StepList steps={steps} />
        <HintsPanel hints={hints} />
      </div>

      {summary && <ProblemSummaryCard summary={summary} />}

      {/* Disconnected banner */}
      {sessionEnded && (
        <div className="flex items-center justify-between border-t border-yellow-200 bg-yellow-50 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-yellow-700">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Phone disconnected
          </div>
          <div className="flex gap-3">
            <a href="/session/new" className="text-sm font-medium text-blue-600 hover:underline">
              New Session
            </a>
            <a href="/" className="text-sm text-gray-500 hover:underline">
              Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
