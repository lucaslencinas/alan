import { Step, Hint, ProblemSummary, Topic, SessionRole } from "./session";

// Client → Server events
export interface ClientToServerEvents {
  "join-session": (data: {
    sessionId: string;
    role: SessionRole;
    studentName?: string;
    topic?: Topic;
    classCode?: string;
  }) => void;
  "create-session": (
    data: { topic: Topic; studentName: string; classCode: string },
    callback: (sessionId: string) => void
  ) => void;
  "audio-data": (data: { audio: string }) => void; // base64 PCM
  "video-frame": (data: { frame: string }) => void; // base64 JPEG
  "end-session": () => void;
}

// Server → Client events
export interface ServerToClientEvents {
  "session-joined": (data: {
    sessionId: string;
    role: SessionRole;
  }) => void;
  "phone-connected": () => void;
  "display-connected": () => void;
  "audio-response": (data: { audio: string }) => void; // base64 PCM
  "function-call": (data: {
    name: string;
    args: Record<string, unknown>;
  }) => void;
  "session-ended": () => void;
  error: (data: { message: string }) => void;
}
