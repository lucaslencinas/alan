# Alan - Product Decisions

This file records product decisions made during development.

---

## 2026-03-07: Core Product Identity

- **Aligned with Google for Education initiative.** The product targets real educational use cases (students + teachers). UI should feel approachable, friendly, and professional — not techy or dark.
- **Light mode by default.** No dark mode for MVP. The base design should be bright/white, inspired by Google Classroom and Google for Education visual language (clean whites, soft blues, rounded corners, Google Sans-style typography).
- **Two-device experience is the core differentiator.** Phone = camera + mic (input). Laptop = tutor whiteboard (visual output). This is what separates Alan from just talking to the Gemini app.

## 2026-03-07: Display View (Laptop Whiteboard)

- **Simplicity over complexity.** The display should NOT be overwhelming. Show what the student wrote (3-4 lines max at a time), with clear status indicators:
  - **Red** — mistake detected
  - **Orange/yellow** — warning, something could be improved
  - **Green** — correct solution (can be partial, doesn't have to be the full problem)
- **No transcript sidebar.** Removed the scrolling transcript of what the AI said. The voice IS the transcript — the student hears it through the phone.
- **Right sidebar: hints/tips panel.** Instead of transcript, show explorable hints and tips. These should guide the student without giving away the full solution. The student can choose to look at hints if stuck. This supports the pedagogical approach of guided discovery, not spoon-feeding answers.
- **Partial correctness.** The display should show per-step feedback, not just "right/wrong" for the entire problem. If step 1 is correct but step 2 has an error, show green for step 1 and red for step 2.

## 2026-03-07: Phone View

- **The phone mockup shows a placeholder.** In production, the camera feed is the real camera — the user's hand, paper, desk. The only UI elements we build are the overlay controls (mic toggle, end session, speaking indicator, connection status).
- **Minimal UI on phone.** The phone is a camera, not a reading device. Keep UI elements to absolute minimum — small overlays that don't obstruct the camera view.

## 2026-03-07: Landing Page

- **Marketing-first landing page.** The landing page should sell the product: hero section, value proposition, how it works, call to action. Similar to what was done for Forging.
- **The QR code / session creation flow lives behind a CTA.** User clicks "Start Studying" → taken to session setup page (topic selector + QR code). The landing page itself is for explaining the product.

## 2026-03-07: Scope Simplification

- **Math only, two topics for MVP:** Integrals and Equations. No derivatives, no systems of equations. Keep it narrow.
- **Hardcoded class for MVP.** No class creation UI. The class is hardcoded as "Math" to avoid extra database schema and UI. Teacher dashboard reads from this single class.
- **Teacher dashboard: simple for MVP.** The detailed dashboard mockup (stats, insights, accuracy bars) is the aspirational version for the demo/presentation. The actual MVP teacher view can be much simpler — a list of students and their recent sessions.

## 2026-03-07: Tech Stack

- **Full TypeScript / Next.js.** No Python. Single repo handles frontend (React) and backend (WebSocket relay + API routes).
- **pnpm** as package manager.
- **KaTeX** for math rendering in the display view.
- **Firestore** for session data (also satisfies the GCP service requirement).
- **Cloud Run** for deployment.

## 2026-03-08: Design Decisions

- **Brand colors: own palette, not Google's.** Primary: `#2563eb` (deeper blue than Google's #1a73e8). Success: `#16a34a`, Error: `#dc2626`, Warning: `#d97706`. Light mode with white/gray backgrounds.
- **Student identity:** Just a name (text input, stored in localStorage). No accounts or sign-in.
- **Hints:** AI-generated via function calls (contextual, not static).
- **WebSocket:** Socket.IO (works on Cloud Run with session affinity + 60min timeout).
- **Audio capture:** Library (RecordRTC or similar) to abstract format conversion to PCM 16kHz.
- **Gemini SDK:** `@google/genai` (supports Live API in Node.js).
- **Session data:** Minimal — just results (~1KB per session). No transcript storage.
- **Speaking indicator on display:** Inferred from function calls (show briefly when function call arrives).
- **QR pairing:** Auto-redirect to display when phone connects.
- **CSS:** Tailwind CSS.
- **Math rendering:** LaTeX with plaintext fallback (both fields in function calls, KaTeX tries LaTeX first).
- **Functions:** 4 declarations — show_step, show_hint, clear_steps, show_summary. All NON_BLOCKING.
- **AI personality:** Patient professor (calm, encouraging, never condescending).
- **Phone preview:** None. Phone is camera-only, no preview of display content.
- **Teacher dashboard:** Functional but simple with real Firestore data.
- **Target audience:** Students first in marketing copy, teachers secondary.

## 2026-03-08: Infrastructure Setup

- **GCP Project:** `alan-live-tutor` (project number: 958890241697)
- **GCP Account:** `lucasdemoreno93@gmail.com`
- **Firestore:** Native mode, `us-central1`, created 2026-03-08
- **Enabled APIs:** Cloud Run, Cloud Build, Firestore, Artifact Registry
- **GitHub Actions auth:** Workload Identity Federation (no service account keys)
  - Pool: `github-pool`
  - Provider: `github-provider` (OIDC, scoped to `lucaslencinas/alan`)
  - Service Account: `github-deploy@alan-live-tutor.iam.gserviceaccount.com`
  - Roles: Cloud Run Admin, Cloud Build Editor, Storage Admin, Service Account User
- **GitHub Secrets set:**
  - `GCP_PROJECT_ID` = `alan-live-tutor`
  - `WIF_PROVIDER` = full resource path
  - `WIF_SERVICE_ACCOUNT` = service account email
  - `GENAI_API_KEY` = (to be set)
- **Cloud Run config:** `--timeout 3600 --session-affinity` for WebSocket support

## 2026-03-09: Local Development Auth

- **Firestore is skipped locally.** No local GCP credentials for Firestore — the code gracefully falls back (saves skipped, reads return empty). Firestore works automatically on Cloud Run via default service account.
- **NEVER run `gcloud auth application-default login` with the personal account.** It overwrites the global ADC that other tools depend on. The alan app uses `GENAI_API_KEY` env var for Gemini, not ADC.
