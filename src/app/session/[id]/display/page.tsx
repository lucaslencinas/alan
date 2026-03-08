"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Step, Hint, ProblemSummary as ProblemSummaryType, Topic } from "@/types/session";
import { getSocket, disconnectSocket } from "@/lib/client/socket-client";
import TopBar from "@/components/shared/TopBar";
import SpeakingBar from "@/components/display/SpeakingBar";
import StepList from "@/components/display/StepList";
import HintsPanel from "@/components/display/HintsPanel";
import ProblemSummaryCard from "@/components/display/ProblemSummary";

export default function DisplayPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [steps, setSteps] = useState<Step[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [summary, setSummary] = useState<ProblemSummaryType | null>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("Integrals");
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const hintCountRef = useRef(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleFunctionCall = useCallback(
    (data: { name: string; args: Record<string, unknown> }) => {
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
    []
  );

  useEffect(() => {
    const socket = getSocket();

    socket.emit("join-session", { sessionId, role: "display" });

    socket.on("session-joined", (data) => {
      if (data.role === "display") {
        setPhoneConnected(true);
      }
    });

    socket.on("phone-connected", () => {
      setPhoneConnected(true);
    });

    socket.on("function-call", handleFunctionCall);

    socket.on("session-ended", () => {
      router.push("/");
    });

    return () => {
      socket.off("session-joined");
      socket.off("phone-connected");
      socket.off("function-call");
      socket.off("session-ended");
      disconnectSocket();
    };
  }, [sessionId, handleFunctionCall, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEndSession = () => {
    const socket = getSocket();
    socket.emit("end-session");
  };

  const statusText = phoneConnected
    ? `Phone connected \u00b7 ${formatTime(elapsed)}`
    : "Waiting for phone...";

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopBar
        topic={topic.charAt(0).toUpperCase() + topic.slice(1)}
        status={statusText}
        onAction={handleEndSession}
      />
      <SpeakingBar text={speakingText} />
      <div className="flex flex-1 overflow-hidden">
        <StepList steps={steps} />
        <HintsPanel hints={hints} />
      </div>
      {summary && <ProblemSummaryCard summary={summary} />}
    </div>
  );
}
