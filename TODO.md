# Alan - TODO

## MVP (Must Have by March 16)

### Phase 1: Project Setup
- [ ] Initialize Next.js + TypeScript project (pnpm)
- [ ] Set up environment variables (GEMINI_API_KEY)
- [ ] Add dependencies: @google/generative-ai, katex, qrcode, ws
- [ ] Create basic app layout with landing page

### Phase 2: WebSocket Server + Session Management
- [ ] Set up WebSocket server alongside Next.js (custom server or separate process)
- [ ] Implement session manager: create session → get session ID
- [ ] Handle two client types per session: "phone" and "display"
- [ ] Test: two browser tabs connect to the same session ID

### Phase 3: Gemini Live API Integration (Server-Side)
- [ ] Connect to Gemini Live API via WebSocket from the backend
- [ ] Forward audio from phone client → Gemini
- [ ] Forward camera frames from phone client → Gemini
- [ ] Receive audio responses from Gemini → relay to phone client
- [ ] Receive function calls from Gemini → relay to display client
- [ ] Test: phone tab sends audio, display tab receives function call data

### Phase 4: Phone View
- [ ] Build phone page (/phone/[sessionId])
- [ ] Capture webcam frames (~1 frame/sec as JPEG, base64)
- [ ] Stream microphone audio (16-bit PCM, 16kHz mono)
- [ ] Receive and play back audio responses from server
- [ ] Minimal UI: camera preview, mic toggle, connection status
- [ ] Test: point phone camera at text, speak, hear AI respond

### Phase 5: Display View + Math Rendering
- [ ] Build display page (/display/[sessionId])
- [ ] Implement Transcript component: scrolling log of AI speech (text)
- [ ] Implement MathDisplay component: render LaTeX via KaTeX
- [ ] Implement FormulaReference component: reference formula cards
- [ ] Implement StepByStep component: numbered solution steps
- [ ] Handle incoming function calls and route to correct component
- [ ] Test: trigger show_math from Gemini, verify it renders on display

### Phase 6: Session Pairing (QR Code)
- [ ] Landing page: create session → show QR code with phone URL
- [ ] Phone scans QR → auto-connects to session
- [ ] Landing page auto-redirects to display view once phone connects
- [ ] Test: full flow from QR scan to connected two-device session

### Phase 7: Math Tutor Prompts + Function Declarations
- [ ] Define function declarations: show_math, show_formula_reference, show_step_by_step
- [ ] Configure functions as NON_BLOCKING
- [ ] Write system prompt: math tutor persona, always use function calls for visual feedback
- [ ] Prompt for equations (polynomial, linear systems)
- [ ] Prompt for integrals and derivatives
- [ ] Test: solve x^3 + 2x^2 + x = y - 1, verify voice on phone + rendered correction on laptop
- [ ] Test: write an integral, verify step-by-step solution appears on display

### Phase 8: UI Polish
- [ ] Topic selector on landing page
- [ ] Phone: clean minimal camera UI, mute button, session status
- [ ] Display: clear layout — transcript top, math bottom
- [ ] Visual indicator when AI is speaking
- [ ] Math panel: clear distinction between "your work" and "correct version"
- [ ] Auto-scroll transcript
- [ ] Responsive design (display works on tablet too)

### Phase 9: Deploy
- [ ] Create Dockerfile (Next.js + WebSocket server)
- [ ] Deploy to Google Cloud Run
- [ ] Verify two-device flow works on deployed URL (phone + laptop over internet)
- [ ] Add Firestore for session logging (satisfies GCP service requirement)

### Phase 10: Submission
- [ ] Record <4 minute demo video
- [ ] Create architecture diagram
- [ ] Write project description for Devpost
- [ ] Update README.md
- [ ] Submit to Devpost

### Phase 9.5: Teacher Dashboard
- [ ] Teacher sign-up / login (simple, can be just a name + class code for MVP)
- [ ] Create class → get shareable join code
- [ ] Students enter class code before starting a session (optional, can study without a class)
- [ ] Log session data to Firestore: topic, mistakes, corrections, timestamps, duration
- [ ] Teacher dashboard page: list of students, recent sessions
- [ ] Class insights: most common mistakes, most practiced topics
- [ ] Per-student view: session history, error trends

---

## Nice to Have (if time permits)
- [ ] Session summary: after studying, show a report of mistakes and corrections
- [ ] Multi-subject (physics diagrams, chemistry equations)
- [ ] Display shows live camera feed from phone (so you can see what the AI sees)
- [ ] Dark mode
- [ ] Multiple topic presets with curated reference formulas
- [ ] Teacher: export class report as PDF
