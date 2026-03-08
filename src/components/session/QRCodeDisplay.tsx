"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  sessionId: string;
  appUrl: string;
}

export default function QRCodeDisplay({ sessionId, appUrl }: QRCodeDisplayProps) {
  const phoneUrl = `${appUrl}/session/${sessionId}/phone`;

  return (
    <div className="text-center">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Connect your phone</h3>
      <p className="text-[13px] text-gray-500 mb-5">
        Scan this QR code to use your phone as the camera
      </p>
      <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl mb-3">
        <QRCodeSVG value={phoneUrl} size={160} level="M" />
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">
        Your phone films your paper. This screen shows the math.
      </p>
    </div>
  );
}
