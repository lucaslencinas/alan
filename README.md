# Alan - Your Live AI Tutor

A two-device live tutoring experience powered by Google's Gemini Live API. Your phone is the camera. Your laptop is the whiteboard.

## What It Does

Alan splits the tutoring experience across two devices:

- **Phone** — point the camera at your paper, talk naturally. Alan listens and responds with voice.
- **Laptop** — Alan's whiteboard. Shows rendered equations, your errors vs the correct solution, reference formulas, and step-by-step breakdowns.

This is something the Gemini app can't do: on a phone you can either aim the camera OR read the screen, not both. Alan gives you the best of both — your phone handles input (camera + voice), your laptop handles output (visual math + audio).

### Supported Topics (MVP)
- Polynomial equations (e.g. x³ + 2x² + x = y - 1)
- Integrals and derivatives
- Systems of equations

## How It Works

```
┌─ PHONE ──────────────┐          ┌─ LAPTOP ──────────────────────┐
│                      │          │                                │
│  Camera → paper      │          │  Transcript:                   │
│  Mic → your voice    │          │  "You forgot the +C..."        │
│  Speaker → AI voice  │          │                                │
│                      │          │  ┌──────────────────────────┐  │
│  Scan QR to connect  │          │  │ Your work:  ∫2x dx = x² │  │
│                      │          │  │ Correct:    ∫2x dx = x²+C│  │
└──────────┬───────────┘          │  └──────────────────────────┘  │
           │                      │                                │
           │ WebSocket            │  Reference:                    │
           ▼                      │  ∫xⁿ dx = xⁿ⁺¹/(n+1) + C     │
┌──────────────────────┐          └──────────────┬─────────────────┘
│    Next.js Server    │                         │
│                      │◄────────────────────────┘ WebSocket
│  Gemini Live API ◄───┤
│  (WebSocket relay)   │
│                      │
│  Audio → Phone       │
│  Functions → Laptop  │
└──────────────────────┘
```

1. Open Alan on your laptop — get a QR code
2. Scan with your phone — camera + mic activate
3. Work on paper, talk naturally
4. Alan **speaks** corrections through your phone
5. Alan **renders** the math on your laptop: equations, errors, formulas

## Tech Stack

- **Framework:** Next.js (TypeScript) — frontend + backend in one
- **Math rendering:** KaTeX
- **AI:** Gemini Live API (real-time multimodal streaming + function calling)
- **Cloud:** Google Cloud Run + Firestore

## Development

```bash
pnpm install
cp .env.example .env  # Add your GEMINI_API_KEY
pnpm dev
```

## Architecture

The Next.js server acts as a WebSocket relay between the two devices and Gemini:

- **Phone** connects via WebSocket, streams camera frames + audio
- **Server** forwards to Gemini Live API, receives responses
- **Audio responses** → relayed back to phone (speaker)
- **Function calls** (show_math, show_formula_reference, show_step_by_step) → relayed to laptop for KaTeX rendering
- **Session pairing** via QR code — both devices share a session ID

## License

MIT

---

Built for the [Gemini Live Agent Challenge](https://geminiliveagentchallenge.devpost.com/)
