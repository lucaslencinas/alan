import {
  GoogleGenAI,
  Modality,
  type Session,
  type LiveServerMessage,
  type FunctionCall,
} from "@google/genai";
import { getSystemPrompt } from "../../config/prompts";
import { toolDeclarations } from "../../config/tools";
import type { Topic } from "../../types/session";

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY! });
  }
  return ai;
}

export async function createGeminiSession(
  topic: Topic,
  onAudio: (base64Audio: string) => void,
  onFunctionCall: (name: string, args: Record<string, unknown>) => void,
  onError: (error: unknown) => void
): Promise<Session> {
  const session = await getAI().live.connect({
    model: "gemini-2.5-flash-native-audio-latest",
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: getSystemPrompt(topic),
      tools: [{ functionDeclarations: toolDeclarations }],
    },
    callbacks: {
      onmessage: (message: LiveServerMessage) => {
        // Handle audio data
        if (message.serverContent?.modelTurn?.parts) {
          for (const part of message.serverContent.modelTurn.parts) {
            if (part.inlineData?.data && part.inlineData.mimeType?.startsWith("audio/")) {
              onAudio(part.inlineData.data);
            }
          }
        }

        // Handle function calls
        if (message.toolCall?.functionCalls) {
          for (const fc of message.toolCall.functionCalls) {
            if (fc.name && fc.args) {
              console.log(`Gemini function call: ${fc.name}(${JSON.stringify(fc.args).slice(0, 100)}...)`);
              onFunctionCall(fc.name, fc.args);
              // Send back a response so Gemini continues
              try {
                sendFunctionResponse(session, fc);
              } catch (err) {
                console.error("Error sending function response:", err);
              }
            }
          }
        }

        // Log other message types for debugging
        if (message.serverContent?.turnComplete) {
          console.log("Gemini turn complete");
        }
      },
      onerror: (e: ErrorEvent) => {
        console.error("Gemini Live API error:", e.message || e);
        onError(e.error ?? e.message ?? e);
      },
      onclose: (e: CloseEvent) => {
        console.log(`Gemini session closed (code: ${e.code}, reason: ${e.reason || "none"})`);
        // If Gemini crashed (not a clean close), notify via error callback
        if (e.code !== 1000) {
          onError(new Error(`Gemini session closed unexpectedly (code: ${e.code}, reason: ${e.reason})`));
        }
      },
    },
  });

  return session;
}

function sendFunctionResponse(session: Session, fc: FunctionCall): void {
  session.sendToolResponse({
    functionResponses: [{
      id: fc.id!,
      name: fc.name!,
      response: { success: true },
    }],
  });
}

export function sendAudioToGemini(
  session: Session,
  base64Audio: string
): void {
  session.sendRealtimeInput({
    audio: {
      data: base64Audio,
      mimeType: "audio/pcm;rate=16000",
    },
  });
}

export function sendVideoToGemini(
  session: Session,
  base64Jpeg: string
): void {
  session.sendRealtimeInput({
    video: {
      data: base64Jpeg,
      mimeType: "image/jpeg",
    },
  });
}

export function closeGeminiSession(session: Session): void {
  session.close();
}
