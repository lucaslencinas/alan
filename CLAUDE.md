# Alan - Your Live AI Tutor

Real-time vision + voice math tutoring powered by Gemini Live API.

## Project Overview

Alan is a **two-device** tutoring experience:
- **Phone** — camera + microphone. Films your paper, you talk to Alan.
- **Laptop/tablet** — the "tutor's whiteboard." Shows rendered equations, corrections, step-by-step solutions, and a transcript of what Alan is saying.

This is what makes Alan different from just using the Gemini app: the phone is your camera, the laptop screen is your tutor's whiteboard. Gemini can't do both on one device — you either aim the camera or read the screen.

## Hackathon

- **Event:** Gemini Live Agent Challenge (https://geminiliveagentchallenge.devpost.com/)
- **Category:** Live Agents
- **Deadline:** March 16, 2026 @ 5:00pm PDT
- **Requirements:**
  - Use a Gemini model
  - Use Google GenAI SDK or ADK
  - Use at least 1 Google Cloud service
  - Deploy to Google Cloud
  - Public repo + architecture diagram + <4min demo video

## Tech Stack

- **Framework:** Next.js (React + TypeScript) — single repo, handles both frontend and backend
- **Math rendering:** KaTeX (fast LaTeX rendering in browser)
- **Real-time sync:** WebSocket (Next.js custom server or standalone WS server)
- **Live API:** Gemini Live API via `@google/generative-ai` SDK
- **Cloud:** Google Cloud Run (deployment) + Firestore (session history)
- **Model:** `gemini-2.5-flash-native-audio-preview` (or latest Live API compatible model)
- **Package manager:** pnpm

## Architecture: Two Devices, One Session

```
┌─ PHONE ──────────────────┐        ┌─ LAPTOP ────────────────────────┐
│                          │        │                                  │
│  Camera → films paper    │        │  ┌────────────────────────────┐ │
│  Mic → you ask questions │        │  │ Transcript                 │ │
│  Speaker → AI talks back │        │  │ "You dropped a negative    │ │
│                          │        │  │  sign in step 3..."        │ │
│  Shows: session status,  │        │  ├────────────────────────────┤ │
│  connection indicator    │        │  │ Math Panel (KaTeX)         │ │
│                          │        │  │                            │ │
└──────────┬───────────────┘        │  │ Your work:  x² + x        │ │
           │                        │  │ Correct:    x² + C        │ │
           │ wss://                 │  │                            │ │
           ▼                        │  │ Reference:                 │ │
┌──────────────────────────┐        │  │ ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C │ │
│  Next.js Backend         │        │  └────────────────────────────┘ │
│  (WebSocket relay)       │        └──────────┬───────────────────────┘
│                          │                   │
│  Phone ←→ Gemini Live API│                   │ wss://
│         ↓                │                   │
│  Function calls ────────►├───────────────────┘
│  (show_math, etc.)       │
│                          │
│  Audio ←→ Phone          │
└──────────────────────────┘
```

### How the relay works:

1. Phone opens session → Next.js backend creates a Gemini Live API WebSocket
2. Phone streams camera frames + audio → backend forwards to Gemini
3. Gemini responds with audio → backend relays to phone → phone plays it
4. Gemini responds with function calls → backend relays to laptop → laptop renders math
5. Laptop connects to same session ID → receives only function calls + transcript

### Session pairing:

- User opens Alan on laptop → gets a session URL with QR code
- User scans QR code with phone → phone joins the same session
- Both devices connected via WebSocket to the same Next.js backend session

## Teacher Dashboard

Teachers can create a class, get a join code, and see how their students are doing:

- **Class creation** — teacher signs up, creates a class, gets a shareable code
- **Student sessions are logged** — every tutoring session saves: topic, mistakes made, corrections given, time spent
- **Dashboard shows:**
  - Which students practiced and when
  - Common mistakes across the class (e.g. "12 students forgot +C on integrals this week")
  - Per-student progress: topics covered, error trends, time spent
  - Aggregated class insights: "Most struggled topic: Integration by Parts"

This uses Firestore (satisfies the GCP service requirement) and adds strong "impact" for hackathon judging.

### Routes:

- `/teacher` — teacher dashboard (class overview, student list, insights)
- `/teacher/class/[classId]` — specific class view
- `/teacher/student/[studentId]` — individual student progress

## Core Concept: Voice + Visual via Function Calling

One Gemini Live API session, two output channels:

- **Audio output** → relayed to phone speaker
- **Function calls** (non-blocking) → relayed to laptop for rendering

### Function declarations:

- `show_math(student_work, correction, hint, step_number)` — show what the student wrote vs the correct version, rendered in LaTeX
- `show_formula_reference(title, formula, explanation)` — show a reference formula (e.g. quadratic formula, integration rules)
- `show_step_by_step(steps[])` — show a full worked solution with numbered steps

## Project Structure

```
alan/
├── CLAUDE.md                # This file
├── TODO.md                  # Task checklist
├── README.md                # Project readme (hackathon submission)
├── next.config.ts           # Next.js config
├── package.json
├── tsconfig.json
├── .env.example             # GEMINI_API_KEY
│
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing / session creation → generates QR code
│   │   ├── phone/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx # Phone view: camera + mic + audio playback
│   │   └── display/
│   │       └── [sessionId]/
│   │           └── page.tsx # Laptop view: transcript + math rendering
│   │
│   ├── components/
│   │   ├── CameraView.tsx       # Phone: camera preview + controls
│   │   ├── MathDisplay.tsx      # Laptop: KaTeX-rendered equation blocks
│   │   ├── Transcript.tsx       # Laptop: scrolling transcript
│   │   ├── StepByStep.tsx       # Laptop: numbered solution steps
│   │   ├── FormulaReference.tsx # Laptop: reference formula card
│   │   ├── QRCode.tsx           # Landing: QR code for phone to scan
│   │   ├── TopicSelector.tsx    # Topic picker (shown before session starts)
│   │   └── SessionStatus.tsx    # Connection status indicator
│   │
│   ├── lib/
│   │   ├── gemini-live.ts       # Server-side: Gemini Live API WebSocket client
│   │   ├── session-manager.ts   # Server-side: manages active sessions, pairs phone + display
│   │   ├── ws-server.ts         # Server-side: WebSocket server for phone + display clients
│   │   └── media-capture.ts     # Client-side: camera frame capture + mic audio (phone only)
│   │
│   └── config/
│       ├── prompts.ts           # System prompts per math topic
│       └── tools.ts             # Function declarations for Gemini Live API
│
└── Dockerfile               # For Cloud Run deployment
```

## Git Commits

When creating commits, do NOT include the "Co-Authored-By" line in commit messages.

**Git identity for this repo:**
- Name: `lucaslencinas`
- Email: `lllencinas@gmail.com`
- This is set in the local repo config. Do NOT use the work email.

## MVP Scope

Two-device flow: phone as camera, laptop as whiteboard.
Next.js handles both the frontend (two views) and backend (WebSocket relay).
The differentiator is the split-device UX + visual math rendering via function calling.
