"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { startCamera, stopCamera } from "@/lib/client/media-capture";

export interface CameraFeedHandle {
  videoElement: HTMLVideoElement | null;
}

interface CameraFeedProps {
  facingMode: "user" | "environment";
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  function CameraFeed({ facingMode }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      get videoElement() {
        return videoRef.current;
      },
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      startCamera(video, facingMode).catch((err) => {
        console.error("Failed to start camera:", err);
      });

      return () => {
        stopCamera();
      };
    }, [facingMode]);

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover bg-black"
      />
    );
  }
);

export default CameraFeed;
