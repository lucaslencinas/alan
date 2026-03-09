import { nanoid } from "nanoid";
import type { Topic, StepRecord, SummaryRecord } from "@/types/session";
import type { Session as GeminiSession } from "@google/genai";

export interface ActiveSession {
  id: string;
  topic: Topic;
  studentName: string;
  classCode: string;
  creatorSocketId: string | null;
  phoneSocketId: string | null;
  displaySocketId: string | null;
  geminiSession: GeminiSession | null;
  steps: StepRecord[];
  hints: { type: string; title: string; content: string }[];
  summary: SummaryRecord | null;
  createdAt: Date;
  endedAt: Date | null;
}

const sessions = new Map<string, ActiveSession>();

export function createSession(
  topic: Topic,
  studentName: string,
  classCode: string
): string {
  const id = nanoid(8);
  const session: ActiveSession = {
    id,
    topic,
    studentName,
    classCode,
    creatorSocketId: null,
    phoneSocketId: null,
    displaySocketId: null,
    geminiSession: null,
    steps: [],
    hints: [],
    summary: null,
    createdAt: new Date(),
    endedAt: null,
  };
  sessions.set(id, session);
  return id;
}

export function getSession(sessionId: string): ActiveSession | null {
  return sessions.get(sessionId) ?? null;
}

export function joinSession(
  sessionId: string,
  role: "phone" | "display",
  socketId: string
): ActiveSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  if (role === "phone") {
    session.phoneSocketId = socketId;
  } else {
    session.displaySocketId = socketId;
  }
  return session;
}

export function endSession(sessionId: string): ActiveSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  session.endedAt = new Date();
  sessions.delete(sessionId);
  return session;
}

export function getSessionBySocketId(socketId: string): ActiveSession | null {
  for (const session of sessions.values()) {
    if (
      session.phoneSocketId === socketId ||
      session.displaySocketId === socketId ||
      session.creatorSocketId === socketId
    ) {
      return session;
    }
  }
  return null;
}

export function removeSocketFromSession(
  sessionId: string,
  socketId: string
): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  if (session.phoneSocketId === socketId) {
    session.phoneSocketId = null;
  }
  if (session.displaySocketId === socketId) {
    session.displaySocketId = null;
  }
  if (session.creatorSocketId === socketId) {
    session.creatorSocketId = null;
  }
}
