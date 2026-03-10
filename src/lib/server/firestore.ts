import { Firestore, Timestamp, Query } from "@google-cloud/firestore";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { ActiveSession } from "./session-manager";

let db: Firestore | null = null;
let initialized = false;
let tempCredFile: string | null = null;

/**
 * For local dev: creates a temporary impersonated_service_account credentials file
 * using the personal gcloud account's refresh token. This lets @google-cloud/firestore
 * authenticate as the service account without changing the global ADC.
 */
function createTempImpersonationCredentials(localAccount: string, targetSA: string): string | null {
  try {
    // Read the personal account's refresh token from gcloud's credential store
    const credJson = execSync(
      `sqlite3 ~/.config/gcloud/credentials.db "SELECT value FROM credentials WHERE account_id='${localAccount}'"`,
      { encoding: "utf-8", timeout: 5000 }
    ).trim();

    const cred = JSON.parse(credJson);

    const impersonatedCreds = {
      type: "impersonated_service_account",
      service_account_impersonation_url:
        `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${targetSA}:generateAccessToken`,
      source_credentials: {
        type: "authorized_user",
        client_id: cred.client_id,
        client_secret: cred.client_secret,
        refresh_token: cred.refresh_token,
      },
      delegates: [],
    };

    const tmpPath = join(tmpdir(), `alan-firestore-${process.pid}.json`);
    writeFileSync(tmpPath, JSON.stringify(impersonatedCreds), { mode: 0o600 });
    return tmpPath;
  } catch (err) {
    console.warn("Firestore: Failed to create impersonation credentials:", (err as Error).message);
    return null;
  }
}

/**
 * Authentication strategy:
 * - GOOGLE_APPLICATION_CREDENTIALS: Service account key file
 * - K_SERVICE: Cloud Run — uses default service account via ADC
 * - GCP_LOCAL_ACCOUNT + GCP_SERVICE_ACCOUNT: Local dev — impersonates SA
 *   using personal gcloud account (avoids changing ADC which would break Claude Code)
 * - Fallback: ADC
 */
function createFirestoreClient(): Firestore | null {
  const projectId = process.env.GCP_PROJECT_ID;

  // Priority 1: Service account key file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Firestore: Using service account key file");
    return new Firestore({
      projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  // Priority 2: Cloud Run / production (ADC)
  if (process.env.K_SERVICE) {
    console.log("Firestore: Running on Cloud Run, using default credentials");
    return new Firestore({ projectId });
  }

  // Priority 3: Local dev — impersonate SA via temp credentials file
  const localAccount = process.env.GCP_LOCAL_ACCOUNT;
  const targetSA = process.env.GCP_SERVICE_ACCOUNT;
  if (localAccount && targetSA) {
    console.log(`Firestore: Local dev — impersonating ${targetSA} via ${localAccount}`);
    tempCredFile = createTempImpersonationCredentials(localAccount, targetSA);
    if (tempCredFile) {
      return new Firestore({
        projectId,
        keyFilename: tempCredFile,
      });
    }
  }

  // Priority 4: Try ADC as last resort
  console.log("Firestore: Trying ADC");
  return new Firestore({ projectId });
}

function ensureInitialized(): Firestore | null {
  if (initialized) return db;
  initialized = true;

  try {
    db = createFirestoreClient();
    if (db) {
      console.log("Firestore: Initialized successfully");
    } else {
      console.warn("Firestore: No credentials available. Session saving disabled.");
    }
  } catch (err) {
    console.warn("Firestore: Initialization failed. Session saving disabled.", (err as Error).message);
  }

  return db;
}

// Clean up temp credentials on exit
process.on("exit", () => {
  if (tempCredFile && existsSync(tempCredFile)) {
    try { unlinkSync(tempCredFile); } catch {}
  }
});

const SESSIONS_COLLECTION = "sessions";

export async function saveSession(session: ActiveSession): Promise<void> {
  const firestore = ensureInitialized();
  if (!firestore) {
    console.warn("Firestore not available, skipping session save.");
    return;
  }

  const durationSeconds = session.endedAt
    ? Math.round(
        (session.endedAt.getTime() - session.createdAt.getTime()) / 1000
      )
    : 0;

  try {
    await firestore
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
    console.warn("Firestore save failed:", (err as Error).message);
  }
}

export interface SessionDocument {
  id: string;
  studentName: string;
  classCode: string;
  topic: "integrals" | "equations";
  createdAt: Timestamp;
  endedAt: Timestamp | null;
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
  const firestore = ensureInitialized();
  if (!firestore) return [];

  let query: Query = firestore.collection(SESSIONS_COLLECTION);

  if (classCode) {
    query = query.where("classCode", "==", classCode);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => doc.data() as SessionDocument);
}

export async function getSessionsByStudent(
  studentName: string
): Promise<SessionDocument[]> {
  const firestore = ensureInitialized();
  if (!firestore) return [];

  const snapshot = await firestore
    .collection(SESSIONS_COLLECTION)
    .where("studentName", "==", studentName)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as SessionDocument);
}
