const GEMINI_SAMPLE_RATE = 24000;

let audioContext: AudioContext | null = null;
let nextStartTime = 0;

export function initAudioPlayback(): void {
  if (typeof window === "undefined") return;
  if (audioContext) return;

  audioContext = new AudioContext({ sampleRate: GEMINI_SAMPLE_RATE });
}

function base64ToPcm16Samples(base64: string): Float32Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const numSamples = bytes.length / 2;
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const int16 = view.getInt16(i * 2, true);
    samples[i] = int16 / 32768;
  }
  return samples;
}

export function playAudioChunk(base64PcmData: string): void {
  if (!audioContext) {
    initAudioPlayback();
  }
  if (!audioContext) return;

  // Resume context if suspended (autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const samples = base64ToPcm16Samples(base64PcmData);
  if (samples.length === 0) return;

  const buffer = audioContext.createBuffer(
    1,
    samples.length,
    GEMINI_SAMPLE_RATE
  );
  buffer.getChannelData(0).set(samples);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  // Schedule chunks sequentially to avoid gaps
  const now = audioContext.currentTime;
  if (nextStartTime < now) {
    nextStartTime = now;
  }
  source.start(nextStartTime);
  nextStartTime += buffer.duration;
}

export function stopPlayback(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  nextStartTime = 0;
}
