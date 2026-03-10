const TARGET_SAMPLE_RATE = 16000;

let audioContext: AudioContext | null = null;
let stream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let workletNode: AudioWorkletNode | null = null;
let muted = false;

// Buffer audio to send larger chunks less frequently
const BUFFER_DURATION_MS = 500; // Send audio every 500ms
let audioBuffer: Float32Array[] = [];
let bufferInterval: ReturnType<typeof setInterval> | null = null;

// Inline AudioWorklet processor code (registered as a blob URL)
const workletCode = `
class PcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0] && input[0].length > 0) {
      // Copy the float32 samples and send to main thread
      this.port.postMessage(new Float32Array(input[0]));
    }
    return true;
  }
}
registerProcessor("pcm-processor", PcmProcessor);
`;

function downsample(
  buffer: Float32Array,
  inputRate: number,
  outputRate: number
): Float32Array {
  if (inputRate === outputRate) return buffer;
  const ratio = inputRate / outputRate;
  const length = Math.round(buffer.length / ratio);
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const index = Math.round(i * ratio);
    result[i] = buffer[Math.min(index, buffer.length - 1)];
  }
  return result;
}

function float32ToPcm16Base64(samples: Float32Array): string {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  // Convert ArrayBuffer to base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function startMicCapture(
  onAudioData: (base64Pcm: string) => void
): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    throw new Error("Microphone API not available");
  }

  stopMicCapture();

  stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, sampleRate: { ideal: TARGET_SAMPLE_RATE } },
    video: false,
  });

  audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
  const actualRate = audioContext.sampleRate;

  // Load worklet from blob URL
  const blob = new Blob([workletCode], { type: "application/javascript" });
  const workletUrl = URL.createObjectURL(blob);
  await audioContext.audioWorklet.addModule(workletUrl);
  URL.revokeObjectURL(workletUrl);

  sourceNode = audioContext.createMediaStreamSource(stream);
  workletNode = new AudioWorkletNode(audioContext, "pcm-processor");

  workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
    if (muted) return;
    const samples = downsample(event.data, actualRate, TARGET_SAMPLE_RATE);
    audioBuffer.push(samples);
  };

  // Flush the buffer periodically
  bufferInterval = setInterval(() => {
    if (audioBuffer.length === 0) return;
    const totalLength = audioBuffer.reduce((sum, buf) => sum + buf.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffer) {
      merged.set(buf, offset);
      offset += buf.length;
    }
    audioBuffer = [];
    const base64 = float32ToPcm16Base64(merged);
    onAudioData(base64);
  }, BUFFER_DURATION_MS);

  sourceNode.connect(workletNode);
  workletNode.connect(audioContext.destination);
}

export function stopMicCapture(): void {
  if (bufferInterval) {
    clearInterval(bufferInterval);
    bufferInterval = null;
  }
  audioBuffer = [];
  if (workletNode) {
    workletNode.disconnect();
    workletNode = null;
  }
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
    stream = null;
  }
  muted = false;
}

export function muteMic(): void {
  muted = true;
}

export function unmuteMic(): void {
  muted = false;
}
