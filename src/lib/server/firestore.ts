import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ActiveSession } from "./session-manager";

let db: FirebaseFirestore.Firestore | null = null;

// Initialize Firebase Admin SDK (once)
try {
  if (getApps().length === 0) {
    const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : applicationDefault();

    initializeApp({
      credential,
      projectId: process.env.GCP_PROJECT_ID,
    });
  }
  db = getFirestore();
} catch (err) {
  console.warn("Firestore not available (no credentials). Session saving disabled.", (err as Error).message);
}
const SESSIONS_COLLECTION = "sessions";

export async function saveSession(session: ActiveSession): Promise<void> {
  if (!db) {
    console.warn("Firestore not available, skipping session save.");
    return;
  }

  const durationSeconds = session.endedAt
    ? Math.round(
        (session.endedAt.getTime() - session.createdAt.getTime()) / 1000
      )
    : 0;

  try {
    await db
      .collection(SESSIONS_COLLECTION)
      .doc(session.id)
      .set({
        id: session.id,
        studentName: session.studentName,
        classCode: session.classCode,
        topic: session.topic,
        createdAt: session.createdAt,
        endedAt: session.endedAt,
        durationSeconds,
        steps: session.steps,
        summary: session.summary,
      });
    console.log(`Session ${session.id} saved to Firestore`);
  } catch (err) {
    console.warn("Firestore save failed (likely no local credentials), skipping:", (err as Error).message);
  }
}

export interface SessionDocument {
  id: string;
  studentName: string;
  classCode: string;
  topic: "integrals" | "equations";
  createdAt: FirebaseFirestore.Timestamp;
  endedAt: FirebaseFirestore.Timestamp | null;
  durationSeconds: number;
  steps: {
    stepNumber: number;
    label: string;
    mathPlain: string;
    status: "correct" | "error" | "warning";
    note: string;
    correctionPlain: string | null;
  }[];
  summary: {
    problemPlain: string;
    totalSteps: number;
    correctSteps: number;
    errorSteps: number;
    feedback: string;
  } | null;
}

export async function getSessions(
  classCode?: string
): Promise<SessionDocument[]> {
  if (!db) return [];

  let query: FirebaseFirestore.Query = db.collection(SESSIONS_COLLECTION);

  if (classCode) {
    query = query.where("classCode", "==", classCode);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => doc.data() as SessionDocument);
}

export async function getSessionsByStudent(
  studentName: string
): Promise<SessionDocument[]> {
  if (!db) return [];

  const snapshot = await db
    .collection(SESSIONS_COLLECTION)
    .where("studentName", "==", studentName)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as SessionDocument);
}
