"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const MAX_QR_CHARS = 800; // longer text makes a QR too dense to scan reliably

export default function ReportQRCode({ text }: { text: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const payload = text.length > MAX_QR_CHARS ? text.slice(0, MAX_QR_CHARS) + "…" : text;
    QRCode.toDataURL(payload, { width: 160, margin: 1 })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [text]);

  if (!dataUrl) return null;

  return (
    <div className="qr-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="QR code of your report" width={160} height={160} />
      <p>Show this at the hospital desk</p>
    </div>
  );
}
