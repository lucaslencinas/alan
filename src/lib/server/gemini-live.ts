import {
  GoogleGenAI,
  Modality,
  type Session,
  type LiveServerMessage,
  type FunctionCall,
} from "@google/genai";
import { getSystemPrompt } from "@/config/prompts";
import { toolDeclarations } from "@/config/tools";
import type { Topic } from "@/types/session";

const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

export async function createGeminiSession(
  topic: Topic,
  onAudio: (base64Audio: string) => void,
  onFunctionCall: (name: string, args: Record<string, unknown>) => void,
  onError: (error: unknown) => void
): Promise<Session> {
  const session = await ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview",
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
              onFunctionCall(fc.name, fc.args);
              // Send back an empty response so Gemini continues
              sendFunctionResponse(session, fc);
            }
          }
        }
      },
      onerror: (e: ErrorEvent) => {
        onError(e.error ?? e);
      },
      onclose: () => {
        console.log("Gemini session closed");
      },
    },
  });

  return session;
}

function sendFunctionResponse(session: Session, fc: FunctionCall): void {
  session.sendToolResponse({
    functionResponses: {
      id: fc.id!,
      name: fc.name!,
      response: { success: true },
    },
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
