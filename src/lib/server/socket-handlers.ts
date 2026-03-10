import type { Server as SocketServer, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../types/socket-events";
import type { StepRecord } from "../../types/session";
import {
  createSession,
  getSession,
  joinSession,
  endSession,
  getSessionBySocketId,
  removeSocketFromSession,
} from "./session-manager";
import {
  createGeminiSession,
  sendAudioToGemini,
  sendVideoToGemini,
  closeGeminiSession,
} from "./gemini-live";
import { saveSession } from "./firestore";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(
  io: SocketServer<ClientToServerEvents, ServerToClientEvents>
): void {
  io.on("connection", (socket: TypedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("create-session", (data, callback) => {
      const sessionId = createSession(
        data.topic,
        data.studentName,
        data.classCode
      );
      // Track the creator socket so we can notify it when phone connects
      const session = getSession(sessionId);
      if (session) {
        session.creatorSocketId = socket.id;
      }
      console.log(`Session created: ${sessionId} (topic: ${data.topic}), creator=${socket.id}`);
      callback(sessionId);
    });

    socket.on("join-session", async (data) => {
      console.log(`join-session request: sessionId=${data.sessionId}, role=${data.role}, socketId=${socket.id}`);
      const session = joinSession(data.sessionId, data.role, socket.id);
      if (!session) {
        console.log(`Session ${data.sessionId} not found!`);
        socket.emit("error", { message: "Session not found" });
        return;
      }

      console.log(`${data.role} joined session ${data.sessionId} (phone=${session.phoneSocketId}, display=${session.displaySocketId})`);

      socket.emit("session-joined", {
        sessionId: data.sessionId,
        role: data.role,
      });

      if (data.role === "phone") {
        // Create Gemini session when phone connects
        try {
          const geminiSession = await createGeminiSession(
            session.topic,
            // onAudio: relay to phone
            (base64Audio) => {
              if (session.phoneSocketId) {
                io.to(session.phoneSocketId).emit("audio-response", {
                  audio: base64Audio,
                });
              }
            },
            // onFunctionCall: relay to display and store in session
            (name, args) => {
              if (session.displaySocketId) {
                io.to(session.displaySocketId).emit("function-call", {
                  name,
                  args,
                });
              }

              // Store step/hint/summary in session state
              if (name === "show_step") {
                const step: StepRecord = {
                  stepNumber: args.step_number as number,
                  label: args.label as string,
                  mathPlain: args.math_plain as string,
                  status: args.status as "correct" | "error" | "warning",
                  note: args.note as string,
                  correctionPlain:
                    (args.correction_plain as string) ?? null,
                };
                session.steps.push(step);
              } else if (name === "show_hint") {
                session.hints.push({
                  type: args.type as string,
                  title: args.title as string,
                  content: args.content as string,
                });
              } else if (name === "clear_steps") {
                session.steps = [];
                session.hints = [];
              } else if (name === "show_summary") {
                session.summary = {
                  problemPlain: args.problem_plain as string,
                  totalSteps: args.total_steps as number,
                  correctSteps: args.correct_steps as number,
                  errorSteps: args.error_steps as number,
                  feedback: args.feedback as string,
                };
              }
            },
            // onError — auto-reconnect on crash
            async (error) => {
              console.error("Gemini error:", error);
              if (session.phoneSocketId) {
                console.log(`Attempting to reconnect Gemini for session ${session.id}...`);
                try {
                  const newSession = await createGeminiSession(
                    session.topic,
                    (audio) => {
                      if (session.phoneSocketId) {
                        io.to(session.phoneSocketId).emit("audio-response", { audio });
                      }
                    },
                    (name, args) => {
                      if (session.displaySocketId) {
                        io.to(session.displaySocketId).emit("function-call", { name, args });
                      }
                      if (session.phoneSocketId) {
                        io.to(session.phoneSocketId).emit("function-call", { name, args });
                      }
                    },
                    (err) => {
                      console.error("Gemini reconnect also failed:", err);
                    }
                  );
                  session.geminiSession = newSession;
                  console.log(`Gemini reconnected for session ${session.id}`);
                } catch (err) {
                  console.error("Failed to reconnect Gemini:", err);
                }
              }
            }
          );

          session.geminiSession = geminiSession;
        } catch (err) {
          console.error("Failed to create Gemini session:", err);
          socket.emit("error", { message: "Failed to connect to AI" });
          return;
        }

        // Notify creator socket (setup page) that phone connected
        if (session.creatorSocketId) {
          io.to(session.creatorSocketId).emit("phone-connected");
        }
        // Also notify display if it's already connected
        if (session.displaySocketId) {
          io.to(session.displaySocketId).emit("phone-connected");
        }
        console.log(`Phone connected to session ${data.sessionId}, notified creator=${session.creatorSocketId}, display=${session.displaySocketId}`);
      } else if (data.role === "display") {
        // Notify phone that display connected
        if (session.phoneSocketId) {
          io.to(session.phoneSocketId).emit("display-connected");
          // Phone is already connected, notify display
          socket.emit("phone-connected");
        }
        console.log(`Display connected to session ${data.sessionId}, phone=${session.phoneSocketId}`);
      }
    });

    socket.on("audio-data", (data) => {
      const session = getSessionBySocketId(socket.id);
      if (!session?.geminiSession) return;
      sendAudioToGemini(session.geminiSession, data.audio);
    });

    socket.on("video-frame", (data) => {
      const session = getSessionBySocketId(socket.id);
      if (!session?.geminiSession) return;
      sendVideoToGemini(session.geminiSession, data.frame);
    });

    socket.on("end-session", async () => {
      const session = getSessionBySocketId(socket.id);
      if (!session) return;

      // Close Gemini session
      if (session.geminiSession) {
        closeGeminiSession(session.geminiSession);
      }

      // End session and get data for saving
      const sessionData = endSession(session.id);
      if (sessionData) {
        try {
          await saveSession(sessionData);
          console.log(`Session ${session.id} saved to Firestore`);
        } catch (err) {
          console.error("Failed to save session:", err);
        }
      }

      // Notify both clients
      if (session.phoneSocketId) {
        io.to(session.phoneSocketId).emit("session-ended");
      }
      if (session.displaySocketId) {
        io.to(session.displaySocketId).emit("session-ended");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id} (reason: ${reason})`);

      const session = getSessionBySocketId(socket.id);
      if (!session) return;

      removeSocketFromSession(session.id, socket.id);

      // If both clients are gone, clean up
      if (!session.phoneSocketId && !session.displaySocketId) {
        if (session.geminiSession) {
          closeGeminiSession(session.geminiSession);
        }
        endSession(session.id);
        console.log(
          `Session ${session.id} cleaned up (both clients disconnected)`
        );
      }
    });
  });
}
