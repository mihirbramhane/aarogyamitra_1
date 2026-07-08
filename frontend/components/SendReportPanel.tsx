"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { sendReport } from "@/lib/aarogyamitra";
import type { Strings } from "@/lib/i18n";

export default function SendReportPanel({ reportText, strings }: { reportText: string; strings: Strings }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send(channel: "sms" | "whatsapp") {
    if (!phone.trim()) {
      setStatus("Enter a phone number first (with country code, e.g. +91...).");
      return;
    }
    setSending(true);
    setStatus(null);
    const res = await sendReport(phone.trim(), channel, reportText);
    setSending(false);
    setStatus(res.ok ? "✅ Sent!" : `❌ ${res.error ?? "Could not send."}`);
  }

  return (
    <div className="send-report-panel">
      <input
        type="tel"
        placeholder={strings.phoneNumberPlaceholder}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <div className="send-report-buttons">
        <button className="btn-action btn-whatsapp" onClick={() => send("whatsapp")} disabled={sending}>
          <MessageCircle size={16} /> {strings.sendWhatsApp}
        </button>
        <button className="btn-action btn-copy" onClick={() => send("sms")} disabled={sending}>
          <Send size={16} /> {strings.sendSms}
        </button>
      </div>
      {status && <p className="send-report-status">{status}</p>}
    </div>
  );
}
