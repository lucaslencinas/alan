const MAX_CAPTURE_SIZE = 1024;

let stream: MediaStream | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

export async function startCamera(
  videoElement: HTMLVideoElement,
  facingMode: "user" | "environment" = "environment"
): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    throw new Error("Camera API not available");
  }

  // Stop any existing stream before starting a new one
  stopCamera();

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });

  videoElement.srcObject = stream;
  await videoElement.play();

  // Create a reusable canvas for frame capture
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
}

export function stopCamera(): void {
  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
    stream = null;
  }
  canvas = null;
  ctx = null;
}

export function captureFrame(videoElement: HTMLVideoElement): string | null {
  if (!canvas || !ctx || !stream) return null;

  const vw = videoElement.videoWidth;
  const vh = videoElement.videoHeight;
  if (vw === 0 || vh === 0) return null;

  // Scale down to fit within MAX_CAPTURE_SIZE while preserving aspect ratio
  const scale = Math.min(1, MAX_CAPTURE_SIZE / Math.max(vw, vh));
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(videoElement, 0, 0, w, h);

  // Export as JPEG base64 (strip the data URL prefix)
  const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
  return dataUrl.split(",")[1] ?? null;
}
