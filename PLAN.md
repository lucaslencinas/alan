# Alan — Complete Implementation Plan

This document is the comprehensive plan for building Alan in a one-shot implementation.
Every decision has been made. This file serves as the single source of truth for the one-shot prompt.

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Pages & Routes](#2-pages--routes)
3. [Design System](#3-design-system)
4. [Tech Stack & Dependencies](#4-tech-stack--dependencies)
5. [Project Structure](#5-project-structure)
6. [Server Architecture](#6-server-architecture)
7. [Gemini Live API Integration](#7-gemini-live-api-integration)
8. [Function Calling Schema](#8-function-calling-schema)
9. [System Prompts](#9-system-prompts)
10. [Page-by-Page Specs](#10-page-by-page-specs)
11. [Data Model (Firestore)](#11-data-model-firestore)
12. [Infrastructure & Deployment](#12-infrastructure--deployment)
13. [Environment Variables](#13-environment-variables)
14. [Testing Strategy](#14-testing-strategy)
15. [File-by-File Implementation Order](#15-file-by-file-implementation-order)

---

## 1. Product Summary

**Alan** is a two-device live AI math tutor:
- **Phone** — camera + microphone. Films the student's paper, captures voice, plays AI audio responses.
- **Laptop** — the "tutor's whiteboard." Shows step-by-step evaluations (red/green/yellow), contextual hints, and a problem summary.

**Differentiator:** Unlike chatting with Gemini on a phone, Alan splits input (phone camera) from output (laptop screen), giving students both auditory and visual feedback. The AI uses function calling to render math on the laptop while speaking through the phone.

**Target audience:** Students first, teachers second.

**MVP scope:** Two math topics — Integrals and Equations. Hardcoded class ("Math"). Functional but simple teacher dashboard with real Firestore data.

**Personality:** Patient professor — calm, encouraging, never condescending. "Almost there!" not "Wrong."

---

## 2. Pages & Routes

| Route | View | Purpose |
|-------|------|---------|
| `/` | Landing page | Marketing page: hero, how it works, two-device explainer, teacher section, CTA |
| `/session/new` | Session setup | Topic selector (Integrals/Equations), student name input, class code input (optional), QR code for phone pairing |
| `/session/[id]/display` | Display view (laptop) | Step cards with red/green/yellow indicators, hints sidebar, speaking bar |
| `/session/[id]/phone` | Phone view | Full-screen camera feed, mic controls, speaking overlay, connection status |
| `/teacher` | Teacher dashboard | Class overview: stats, common mistakes, student table, AI insights sidebar |

---

## 3. Design System

### Brand Colors (NOT Google's exact colors)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#2563eb` | CTAs, links, active states, logo (a deeper, richer blue than Google's #1a73e8) |
| `primary-light` | `#dbeafe` | Badges, light backgrounds |
| `primary-dark` | `#1d4ed8` | Hover states |
| `success` | `#16a34a` | Correct step indicator |
| `success-light` | `#dcfce7` | Correct step background |
| `error` | `#dc2626` | Error step indicator |
| `error-light` | `#fef2f2` | Error step background |
| `warning` | `#d97706` | Warning step indicator |
| `warning-light` | `#fefce8` | Warning step background |
| `gray-50` | `#f9fafb` | Page background |
| `gray-100` | `#f3f4f6` | Card hover, secondary backgrounds |
| `gray-200` | `#e5e7eb` | Borders |
| `gray-500` | `#6b7280` | Secondary text |
| `gray-900` | `#111827` | Primary text |

### Typography

- Font: `Inter` via Google Fonts (weight 400, 500, 600, 700, 800)
- Headings: `font-bold` or `font-extrabold`, tight letter-spacing
- Body: `text-sm` (14px) or `text-base` (16px), `text-gray-500` for secondary

### Components

- Buttons: Rounded-full (`rounded-full`), primary blue fill or white with border
- Cards: White bg, `border border-gray-200`, `rounded-xl`, subtle shadow on hover
- Badges/pills: `rounded-full`, light background + colored text
- Step indicators: 32px circle, colored bg + icon (✓, ✕, !)

### Light Mode Only

No dark mode. All pages use white/gray backgrounds.

---

## 4. Tech Stack & Dependencies

### Core

| Package | Purpose |
|---------|---------|
| `next` (15.x) | Framework (React + API + custom server) |
| `react` (19.x) | UI |
| `typescript` | Type safety |
| `tailwindcss` (4.x) | Styling |

### AI & Real-time

| Package | Purpose |
|---------|---------|
| `@google/genai` | Gemini Live API SDK (server-side) |
| `socket.io` | WebSocket server (relay between phone, display, and Gemini) |
| `socket.io-client` | WebSocket client (browser-side) |

### Math & UI

| Package | Purpose |
|---------|---------|
| `katex` | LaTeX math rendering |
| `react-katex` or custom wrapper | React component for KaTeX |
| `qrcode.react` | QR code generation |

### Audio

| Package | Purpose |
|---------|---------|
| `recordrtc` or `extendable-media-recorder` | Mic capture + format handling on phone |

### Infrastructure

| Package | Purpose |
|---------|---------|
| `firebase-admin` | Firestore access (server-side) |
| `uuid` or `nanoid` | Session ID generation |

### Dev

| Package | Purpose |
|---------|---------|
| `@types/node`, `@types/react` | TypeScript types |
| `eslint`, `eslint-config-next` | Linting |

**Package manager:** pnpm

---

## 5. Project Structure

```
alan/
├── CLAUDE.md
├── PLAN.md
├── PRODUCT.md
├── TODO.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── .env.local                    # (gitignored)
├── .gitignore
├── Dockerfile
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions → Cloud Run
│
├── server.ts                     # Custom Node.js server (Next.js + Socket.IO)
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (Inter font, Tailwind globals)
│   │   ├── page.tsx              # Landing page (marketing)
│   │   ├── session/
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Session setup (topic + name + QR)
│   │   │   └── [id]/
│   │   │       ├── display/
│   │   │       │   └── page.tsx  # Display view (laptop whiteboard)
│   │   │       └── phone/
│   │   │           └── page.tsx  # Phone view (camera + mic)
│   │   └── teacher/
│   │       └── page.tsx          # Teacher dashboard
│   │
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── TwoDevices.tsx
│   │   │   ├── ForTeachers.tsx
│   │   │   └── Footer.tsx
│   │   ├── session/
│   │   │   ├── TopicSelector.tsx
│   │   │   ├── NameInput.tsx
│   │   │   ├── ClassCodeInput.tsx
│   │   │   ├── QRCodeDisplay.tsx
│   │   │   └── ConnectionStatus.tsx
│   │   ├── display/
│   │   │   ├── StepCard.tsx       # Single step with status indicator
│   │   │   ├── StepList.tsx       # List of step cards
│   │   │   ├── HintCard.tsx       # Expandable hint card
│   │   │   ├── HintsPanel.tsx     # Right sidebar with hints
│   │   │   ├── SpeakingBar.tsx    # "Alan is speaking..." bar
│   │   │   ├── ProblemSummary.tsx # End-of-problem summary card
│   │   │   └── MathRenderer.tsx   # KaTeX wrapper with plaintext fallback
│   │   ├── phone/
│   │   │   ├── CameraFeed.tsx     # Full-screen camera
│   │   │   ├── SpeakingOverlay.tsx # Translucent speaking bubble
│   │   │   └── Controls.tsx       # Mic, flip camera, end session
│   │   ├── teacher/
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── MistakesList.tsx
│   │   │   ├── StudentsTable.tsx
│   │   │   ├── TopicBreakdown.tsx
│   │   │   └── InsightsPanel.tsx
│   │   └── shared/
│   │       ├── Header.tsx         # Shared header (logo + nav)
│   │       └── TopBar.tsx         # In-session top bar (logo + status)
│   │
│   ├── lib/
│   │   ├── server/
│   │   │   ├── gemini-live.ts     # Gemini Live API client wrapper
│   │   │   ├── session-manager.ts # In-memory session state management
│   │   │   ├── socket-handlers.ts # Socket.IO event handlers
│   │   │   └── firestore.ts       # Firestore client + session save/read
│   │   └── client/
│   │       ├── media-capture.ts   # Camera frame capture (JPEG, base64)
│   │       ├── audio-capture.ts   # Mic capture via library → PCM 16kHz
│   │       ├── audio-playback.ts  # Play PCM audio from Gemini
│   │       └── socket-client.ts   # Socket.IO client wrapper
│   │
│   ├── config/
│   │   ├── prompts.ts             # System prompts per topic
│   │   └── tools.ts               # Function declarations for Gemini
│   │
│   └── types/
│       ├── session.ts             # Session, Step, Hint, Summary types
│       └── socket-events.ts       # Socket.IO event type definitions
│
└── firestore.rules                # Firestore security rules
```

---

## 6. Server Architecture

### Custom server.ts

Next.js runs inside a custom Node.js HTTP server. Socket.IO attaches to the same HTTP server.

```typescript
// server.ts (pseudocode)
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketServer } from "socket.io";
import { setupSocketHandlers } from "./src/lib/server/socket-handlers";

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url!, true));
  });

  const io = new SocketServer(httpServer, {
    cors: { origin: "*" }, // tighten in production
  });

  setupSocketHandlers(io);

  const port = parseInt(process.env.PORT || "3000");
  httpServer.listen(port, () => {
    console.log(`Alan server running on port ${port}`);
  });
});
```

### Socket.IO Event Flow

**Phone connects:**
1. Phone emits `join-session` with `{ sessionId, role: "phone" }`
2. Server creates Gemini Live API session (if not exists)
3. Server confirms with `session-joined` event
4. Server notifies display client: `phone-connected`

**Phone streams:**
1. Phone emits `audio-data` with PCM audio chunks
2. Phone emits `video-frame` with JPEG base64 frames (~1/sec)
3. Server forwards both to Gemini Live API via `session.sendRealtimeInput()`

**Gemini responds:**
1. Server receives audio from Gemini → emits `audio-response` to phone
2. Server receives function call from Gemini → emits `function-call` to display
3. Server receives text (if any) → emits `transcript` to display

**Display connects:**
1. Display emits `join-session` with `{ sessionId, role: "display" }`
2. Server confirms with `session-joined`
3. Display starts receiving `function-call` events

**Session end:**
1. Either client emits `end-session`
2. Server saves session data to Firestore
3. Server closes Gemini Live API session
4. Server emits `session-ended` to both clients

---

## 7. Gemini Live API Integration

### Connection

```typescript
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

const session = await ai.live.connect({
  model: "gemini-2.5-flash-native-audio-preview",
  config: {
    responseModalities: [Modality.AUDIO],
    systemInstruction: SYSTEM_PROMPT,
    tools: FUNCTION_DECLARATIONS,
  },
  callbacks: {
    onmessage: (message) => {
      // Handle audio → relay to phone
      // Handle function calls → relay to display
      // Handle text → relay to display
    },
    onerror: (e) => console.error("Gemini error:", e),
    onclose: () => console.log("Gemini session closed"),
  },
});
```

### Sending Input

```typescript
// Camera frame
session.sendRealtimeInput({
  video: {
    data: base64JpegString,
    mimeType: "image/jpeg",
  },
});

// Audio
session.sendRealtimeInput({
  audio: {
    data: base64PcmString,
    mimeType: "audio/pcm;rate=16000",
  },
});
```

### Audio Output

Gemini returns audio as PCM at 24kHz. The server relays raw audio chunks to the phone client, which plays them via Web Audio API.

---

## 8. Function Calling Schema

Four non-blocking functions:

### 1. `show_step`

Called when the AI evaluates a step the student has written.

```typescript
{
  name: "show_step",
  description: "Show an evaluation of a step the student has written on paper. Call this for EVERY step you identify in the student's work. Use 'correct' if the step is mathematically right, 'error' if there's a mistake, and 'warning' if it's technically okay but could be improved or carries forward a previous error.",
  parameters: {
    type: "object",
    properties: {
      step_number: { type: "number", description: "Step number (1, 2, 3...)" },
      label: { type: "string", description: "Short label like 'Problem setup' or 'Second term'" },
      math_latex: { type: "string", description: "LaTeX representation of what the student wrote" },
      math_plain: { type: "string", description: "Plain text fallback of the student's work" },
      status: { type: "string", enum: ["correct", "error", "warning"] },
      note: { type: "string", description: "Brief explanation of why this step is correct/wrong" },
      correction_latex: { type: "string", description: "LaTeX of the correct version (only if status is error)" },
      correction_plain: { type: "string", description: "Plain text of the correct version (only if status is error)" },
    },
    required: ["step_number", "label", "math_latex", "math_plain", "status", "note"],
  },
}
```

### 2. `show_hint`

Called to provide a contextual hint or reference formula in the sidebar.

```typescript
{
  name: "show_hint",
  description: "Show a hint or reference formula in the hints sidebar. Use 'nudge' for gentle guidance without giving the answer, 'formula' for a reference formula the student should know, 'explain' for a conceptual explanation. Do NOT give away the full solution in hints.",
  parameters: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["nudge", "formula", "explain"] },
      title: { type: "string", description: "Short title for the hint" },
      content: { type: "string", description: "The hint text" },
      formula_latex: { type: "string", description: "LaTeX formula (only for type 'formula')" },
      formula_plain: { type: "string", description: "Plain text formula fallback" },
    },
    required: ["type", "title", "content"],
  },
}
```

### 3. `clear_steps`

Called when the student starts a new problem.

```typescript
{
  name: "clear_steps",
  description: "Clear all step evaluations and hints from the display. Call this when the student starts working on a new problem.",
  parameters: {
    type: "object",
    properties: {
      reason: { type: "string", description: "Why clearing (e.g. 'Starting new problem')" },
    },
    required: ["reason"],
  },
}
```

### 4. `show_summary`

Called when a problem is fully solved.

```typescript
{
  name: "show_summary",
  description: "Show a summary card after the student finishes solving a problem. Include overall feedback and encouragement.",
  parameters: {
    type: "object",
    properties: {
      problem_latex: { type: "string", description: "LaTeX of the original problem" },
      problem_plain: { type: "string", description: "Plain text of the original problem" },
      total_steps: { type: "number" },
      correct_steps: { type: "number" },
      error_steps: { type: "number" },
      feedback: { type: "string", description: "Overall encouraging feedback" },
    },
    required: ["problem_latex", "problem_plain", "total_steps", "correct_steps", "error_steps", "feedback"],
  },
}
```

All functions configured with `behavior: "NON_BLOCKING"` so the AI speaks and renders simultaneously.

---

## 9. System Prompts

### Base Prompt (shared)

```
You are Alan, a patient and encouraging math tutor. You are watching a student solve problems on paper through a camera feed.

PERSONALITY:
- Patient, calm, and encouraging. Never condescending.
- Say "Almost there!" or "Good thinking, but..." instead of "Wrong" or "Incorrect."
- Celebrate correct steps enthusiastically.
- When the student makes a mistake, explain WHY it's wrong and guide them toward the right approach.

BEHAVIOR:
- You MUST call show_step() for EVERY step you identify in the student's work.
- You MUST call show_hint() to provide contextual guidance when the student is stuck or makes an error.
- Call clear_steps() when the student starts a new problem.
- Call show_summary() when a problem is fully solved (whether correctly or with corrections).
- Speak your explanations out loud (audio) AND call the visual functions simultaneously.
- Keep spoken explanations concise (2-3 sentences per step). The visual display handles the details.
- When you can't read the handwriting clearly, ask the student to clarify. Do NOT guess.

IMPORTANT:
- Do NOT give away the full solution unprompted. Guide the student step by step.
- Hints should nudge toward the answer, not reveal it.
- If the student asks for the answer directly, encourage them to try first, then give a small hint.
- Only show the full solution if the student explicitly asks after multiple attempts.
```

### Integrals Topic Prompt (appended)

```
TOPIC: Integrals (Indefinite and Definite)

You are helping the student practice integration. Common areas to watch for:
- Forgetting the constant of integration (+C) for indefinite integrals
- Incorrect power rule application (increase exponent by 1, divide by new exponent)
- Integration by parts mistakes (choosing u and dv)
- Trigonometric substitution errors
- Bounds of integration mistakes for definite integrals

Reference formulas you should share via show_hint() when relevant:
- Power rule: ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C, n ≠ -1
- ∫ eˣ dx = eˣ + C
- ∫ 1/x dx = ln|x| + C
- ∫ sin(x) dx = -cos(x) + C
- ∫ cos(x) dx = sin(x) + C
```

### Equations Topic Prompt (appended)

```
TOPIC: Equations (Polynomial, Quadratic, Linear)

You are helping the student solve equations. Common areas to watch for:
- Sign errors when moving terms across the equals sign
- Incorrect factoring
- Forgetting to check solutions (especially with square roots or absolute values)
- Errors in applying the quadratic formula
- Not simplifying final answers

Reference formulas you should share via show_hint() when relevant:
- Quadratic formula: x = (-b ± √(b²-4ac)) / 2a
- Difference of squares: a² - b² = (a+b)(a-b)
- Perfect square trinomial: a² ± 2ab + b² = (a ± b)²
- Vieta's formulas: for ax² + bx + c = 0, sum of roots = -b/a, product = c/a
```

---

## 10. Page-by-Page Specs

### Landing Page (`/`)

**Layout:** Full-width marketing page, scrollable.

**Sections (top to bottom):**
1. **Header** (sticky): Logo "Alan" on left. Nav links: "How It Works", "For Teachers", "GitHub". Primary CTA button: "Start Studying" → links to `/session/new`.
2. **Hero**: Badge "Powered by Google Gemini". H1: "Your AI tutor that **sees** your work". Subtitle explaining the concept. Two buttons: "Start Studying" (primary) and "See How It Works" (secondary, scrolls to section).
3. **Preview**: Browser frame mockup showing 3 step cards (green ✓, red ✕, yellow !) with example math. This is the same visual from the current mockup.
4. **How It Works**: 3-column grid. Step 1: Scan QR code. Step 2: Solve on paper. Step 3: See corrections live. Each has an illustration placeholder (emoji for MVP) and description.
5. **Two Devices**: Left column: text explaining the two-device concept with icon list (Phone = camera, Laptop = whiteboard). Right column: two device mockups with arrow between them.
6. **For Teachers**: Centered section. H2: "Built for classrooms". 3 feature cards: Class insights, Student progress, Simple class code. CTA: "View Teacher Dashboard" → `/teacher`.
7. **Footer**: Logo, tagline, links (GitHub, Hackathon).

### Session Setup (`/session/new`)

**Layout:** Centered card on gray background.

**Flow:**
1. Card with H1 "Start a session"
2. Topic selector: 2 cards in a grid (Integrals, Equations). Click to select. Default: Integrals.
3. Name input: "What's your name?" text field. Stored in localStorage for future sessions. Pre-filled if returning.
4. Class code input: optional, placeholder "e.g. MATH-301".
5. "Create Session" button (primary). On click:
   - POST to API or emit Socket.IO event to create session
   - Session ID generated (nanoid, 8 chars)
   - Page updates to show QR code below
6. QR code section: shows QR code encoding the URL `https://{host}/session/{id}/phone`. Text: "Scan with your phone to use it as your camera."
7. Waiting status: "Waiting for phone to connect..." with yellow dot.
8. Once phone connects → auto-redirect to `/session/{id}/display`.

### Display View (`/session/[id]/display`)

**Layout:** Full viewport height. Top bar + speaking bar + main content (work panel + hints sidebar).

**Top bar:** Logo "Alan" | Topic badge (e.g. "Integrals") | Status: green dot + "Phone connected · {elapsed time}" | "End Session" button.

**Speaking bar** (below top bar): Appears when AI is speaking (inferred from function calls). Shows wave animation + "Alan is speaking:" + last spoken text snippet. Fades after 5 seconds of no function calls.

**Main area** (flex row):
- **Work panel** (flex: 1): Header "Your work". Scrollable list of `StepCard` components. Each card shows:
  - Status circle (green ✓ / red ✕ / yellow !)
  - Left colored border (3px, matches status)
  - Step label (e.g. "Step 2 — Second term")
  - Math expression (KaTeX rendered, with plaintext fallback)
  - Note text
  - If error: correction row with "Should be" label + correct math (KaTeX)
- When `clear_steps` is called → animate cards out, clear list.
- When `show_summary` is called → show summary card at bottom with stats + feedback.

- **Hints panel** (width: 320px, right sidebar): Header "Hints & References" with lightbulb icon. List of `HintCard` components:
  - Badge (Nudge / Formula / Explain, colored)
  - Title
  - Preview text (1 line)
  - Click to expand → shows full content + formula (KaTeX)
  - Footer text: "Hints help you learn without giving away the answer."

### Phone View (`/session/[id]/phone`)

**Layout:** Full-screen camera feed with overlays. Dark overlays for contrast against camera.

**Overlays (z-indexed above camera):**
- **Top**: Gradient overlay (black → transparent). Logo "Alan" + topic pill + connection status (green dot + "Display connected").
- **Speaking overlay** (above bottom controls): White/translucent rounded card. Wave animation + "Alan is speaking" + current speech text. Shows when audio is playing, hides when silent.
- **Timer**: Centered, small text showing elapsed time.
- **Bottom controls**: Gradient overlay (transparent → black). Three buttons centered:
  - Flip camera (secondary style)
  - Mic toggle (primary blue, larger)
  - End session (red)
  - Labels below each button.

**Camera behavior:**
- On mount: request camera permission, start rear-facing camera.
- Every ~1 second: capture a JPEG frame (max 1024x1024), base64 encode, emit via Socket.IO.
- "Flip" button toggles between front/rear camera.

**Audio behavior:**
- On mount: request mic permission, start capturing audio.
- Audio captured via library → PCM 16-bit 16kHz mono → emitted via Socket.IO as chunks.
- Incoming audio from server → played via Web Audio API (AudioContext).
- "Mic" button toggles mute.

### Teacher Dashboard (`/teacher`)

**Layout:** Top bar + main content (content area + sidebar).

**Top bar:** Logo "Alan" | Nav tabs: "Dashboard" (active) | Teacher label: "Math class".

**Main content:**
- **Page header:** H1 "Math" (hardcoded class name). Subtitle "X students · Y sessions". Class code box on the right showing "MATH" (hardcoded).
- **Stats grid** (4 columns): Total Sessions, Active Students, Avg. Accuracy, Avg. Session Duration. All read from Firestore.
- **Common Mistakes**: List of the top 3 most frequent mistake types across all sessions. Each shows name, detail, occurrence count, and a bar chart.
- **Students table**: Columns: Student name (with avatar initials), Sessions count, Topics practiced, Accuracy %, Last active timestamp.

**Sidebar:**
- **Topic Breakdown**: Bar chart showing Integrals vs Equations session counts.
- **AI Insights**: Hardcoded insights for MVP (can be dynamic later). E.g., "X students forgot +C this week."

**Data source:** All data from Firestore. Fetched via Next.js server component or API route. No real-time updates needed.

---

## 11. Data Model (Firestore)

### Collection: `sessions`

```typescript
interface SessionDocument {
  id: string;                    // nanoid, 8 chars
  studentName: string;
  classCode: string;             // "MATH" (hardcoded for MVP)
  topic: "integrals" | "equations";
  createdAt: Timestamp;
  endedAt: Timestamp | null;
  durationSeconds: number;
  steps: StepRecord[];
  summary: SummaryRecord | null;
}

interface StepRecord {
  stepNumber: number;
  label: string;
  mathPlain: string;
  status: "correct" | "error" | "warning";
  note: string;
  correctionPlain: string | null; // only if error
}

interface SummaryRecord {
  problemPlain: string;
  totalSteps: number;
  correctSteps: number;
  errorSteps: number;
  feedback: string;
}
```

### Firestore Security Rules (firestore.rules)

For MVP, allow read from teacher dashboard (no auth for hackathon):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read: if true;
      allow write: if false; // only server writes via admin SDK
    }
  }
}
```

---

## 12. Infrastructure & Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

Note: `server.ts` is compiled to `server.js` during build. We may need to use `tsx` or add a separate TypeScript compilation step for the custom server.

### GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: alan-live-tutor
  SERVICE_NAME: alan
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Build and push container
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE_NAME \
            --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars "GENAI_API_KEY=${{ secrets.GENAI_API_KEY }}" \
            --set-env-vars "GCP_PROJECT_ID=${{ secrets.GCP_PROJECT_ID }}" \
            --timeout 3600 \
            --session-affinity \
            --min-instances 0 \
            --max-instances 3
```

Key flags:
- `--timeout 3600`: 60-minute timeout for WebSocket connections
- `--session-affinity`: Sticky sessions so the phone and display hit the same instance
- `--allow-unauthenticated`: Public access

### GCP Setup Steps (manual, with user's help)

All done:
1. GCP project: `alan-live-tutor` (project number: 958890241697)
2. APIs enabled: Cloud Run, Cloud Build, Firestore, Artifact Registry
3. Firestore database created (Native mode, `us-central1`)
4. Workload Identity Federation configured (pool: `github-pool`, provider: `github-provider`)
5. Service account: `github-deploy@alan-live-tutor.iam.gserviceaccount.com`
6. GitHub secrets set: `GCP_PROJECT_ID`, `WIF_PROVIDER`, `WIF_SERVICE_ACCOUNT`, `GENAI_API_KEY`

---

## 13. Environment Variables

### `.env.example`

```bash
# Gemini
GENAI_API_KEY=your_gemini_api_key_here

# GCP / Firestore
GCP_PROJECT_ID=alan-live-tutor
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

### For Cloud Run (set via --set-env-vars or secrets)

- `GENAI_API_KEY`
- `GCP_PROJECT_ID`
- `NEXT_PUBLIC_APP_URL` (the Cloud Run URL)

Firestore auth on Cloud Run uses the default service account (no credentials file needed).

---

## 14. Testing Strategy

### What can be tested without camera/audio:

1. **Landing page** — renders correctly, links work, responsive
2. **Session setup** — topic selection, name input, session creation, QR code generation
3. **Display view** — function call handling, step card rendering (mock Socket.IO events), KaTeX rendering, hints panel expand/collapse, summary card
4. **Teacher dashboard** — data fetching from Firestore, stats calculation, table rendering
5. **Server** — session manager (create, join, end), Firestore writes, Socket.IO event routing

### What requires manual testing:

1. Camera capture + frame sending
2. Audio capture + format + playback
3. Gemini Live API responses (audio + function calls)
4. End-to-end two-device flow
5. QR code scanning on real phone

### For the one-shot implementation:

Focus on getting all code written and UI rendering correctly. Test with:
- Mock Socket.IO events to populate the display view
- A test page that sends fake function calls to verify rendering
- Firestore reads/writes with test data

---

## 15. File-by-File Implementation Order

This is the order for the one-shot prompt to build files:

**Phase 1: Project Setup**
1. `package.json`
2. `tsconfig.json`
3. `next.config.ts`
4. `tailwind.config.ts`
5. `postcss.config.js`
6. `.env.example`
7. `.gitignore`

**Phase 2: Types & Config**
8. `src/types/session.ts`
9. `src/types/socket-events.ts`
10. `src/config/tools.ts`
11. `src/config/prompts.ts`

**Phase 3: Server**
12. `server.ts`
13. `src/lib/server/session-manager.ts`
14. `src/lib/server/gemini-live.ts`
15. `src/lib/server/socket-handlers.ts`
16. `src/lib/server/firestore.ts`

**Phase 4: Client Libraries**
17. `src/lib/client/socket-client.ts`
18. `src/lib/client/media-capture.ts`
19. `src/lib/client/audio-capture.ts`
20. `src/lib/client/audio-playback.ts`

**Phase 5: Shared Components**
21. `src/components/shared/Header.tsx`
22. `src/components/shared/TopBar.tsx`
23. `src/components/display/MathRenderer.tsx`

**Phase 6: Landing Page**
24. `src/app/layout.tsx`
25. `src/components/landing/Hero.tsx`
26. `src/components/landing/HowItWorks.tsx`
27. `src/components/landing/TwoDevices.tsx`
28. `src/components/landing/ForTeachers.tsx`
29. `src/components/landing/Footer.tsx`
30. `src/app/page.tsx`

**Phase 7: Session Setup**
31. `src/components/session/TopicSelector.tsx`
32. `src/components/session/NameInput.tsx`
33. `src/components/session/ClassCodeInput.tsx`
34. `src/components/session/QRCodeDisplay.tsx`
35. `src/components/session/ConnectionStatus.tsx`
36. `src/app/session/new/page.tsx`

**Phase 8: Display View**
37. `src/components/display/StepCard.tsx`
38. `src/components/display/StepList.tsx`
39. `src/components/display/HintCard.tsx`
40. `src/components/display/HintsPanel.tsx`
41. `src/components/display/SpeakingBar.tsx`
42. `src/components/display/ProblemSummary.tsx`
43. `src/app/session/[id]/display/page.tsx`

**Phase 9: Phone View**
44. `src/components/phone/CameraFeed.tsx`
45. `src/components/phone/SpeakingOverlay.tsx`
46. `src/components/phone/Controls.tsx`
47. `src/app/session/[id]/phone/page.tsx`

**Phase 10: Teacher Dashboard**
48. `src/components/teacher/StatsGrid.tsx`
49. `src/components/teacher/MistakesList.tsx`
50. `src/components/teacher/StudentsTable.tsx`
51. `src/components/teacher/TopicBreakdown.tsx`
52. `src/components/teacher/InsightsPanel.tsx`
53. `src/app/teacher/page.tsx`

**Phase 11: Infrastructure**
54. `Dockerfile`
55. `.github/workflows/deploy.yml`
56. `firestore.rules`

**Phase 12: Documentation**
57. `README.md` (update with final architecture)
58. `.env.example` (finalize)

---

## Summary of All Decisions

| Decision | Choice |
|----------|--------|
| Brand color | Deep blue `#2563eb` (not Google's #1a73e8) |
| Target audience | Students first |
| Student identity | Just a name (localStorage) |
| Hints | AI-generated via function calls |
| WebSocket | Socket.IO (works on Cloud Run with session affinity) |
| Audio capture | Library (RecordRTC or similar) |
| Gemini SDK | `@google/genai` SDK (supports Live API in Node.js) |
| GCP project | New project for Alan |
| API key | New Gemini key for Alan |
| Session data | Minimal (results only, ~1KB/session) |
| Speaking indicator | Inferred from function calls |
| QR pairing | Auto-redirect to display when phone connects |
| CSS framework | Tailwind CSS |
| Math format | LaTeX with plaintext fallback |
| Functions | 4: show_step, show_hint, clear_steps, show_summary |
| AI personality | Patient professor |
| Phone preview | No preview, phone is camera-only |
| Teacher dashboard | Functional but simple (real Firestore data) |
| Infra | Full: Dockerfile + GitHub Actions + Firestore rules |
| Topics | Integrals and Equations only |
| Class | Hardcoded "Math" |
