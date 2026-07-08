// lib/aarogyamitra.ts
// Client helper: kick off /api/analyze (job_id), poll status until done, and
// speak the result aloud via the Web Speech API.

import { supabase } from "./supabaseClient";

export interface UserProfile {
  state: string;
  annual_income: number;
  family_size: number;
  has_ration_card: boolean;
  ration_card_type?: string;
  existing_insurance?: string;
  ailment?: string;
  language: string; // "en" | "hi" | "te" | "ta" | ...
  latitude?: number;
  longitude?: number;
}

export interface MatchedScheme {
  name: string;
  authority: string;
  coverage_amount?: string;
  why_eligible: string;
}

export interface Hospital {
  name: string;
  address: string;
  distance_note?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  scheme_name?: string;
  empanelment_status?: "confirmed" | "verify";
  distance_km?: number | null;
}

/** 'full' | 'partial' | 'none' | 'unknown' — see backend CoverageSummaryOutput. */
export type CoverageStatus = "full" | "partial" | "none" | "unknown";

export interface AnalyzeResult {
  matched_schemes: MatchedScheme[];
  coverage_summary: string;
  bill_amount?: string | null;
  coverage_status?: CoverageStatus;
  nearby_hospitals: Hospital[];
  document_checklist: string[];
  voice_guidance: string;
  raw_report?: string;
  disclaimer?: string;
  error?: string;
}

export interface JobStatus {
  status: "running" | "done" | "error";
  step_index: number;
  step_name: string;
  result: AnalyzeResult | null;
  error: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

/** Kick off analysis and poll until the backend job finishes. */
export async function analyze(
  profile: UserProfile,
  bill?: File | null,
  onProgress?: (step_index: number, step_name: string) => void
): Promise<AnalyzeResult> {
  const headers = await authHeaders();

  const form = new FormData();
  form.append("profile", JSON.stringify(profile));
  if (bill) form.append("bill", bill);

  const startRes = await fetch("/api/analyze", { method: "POST", headers, body: form });
  if (!startRes.ok) {
    return emptyResult(`Could not start analysis (${startRes.status}).`);
  }
  const { job_id, error: startError } = await startRes.json();
  if (!job_id) return emptyResult(startError ?? "Could not start analysis.");

  // Drives the live agent-pipeline UI (see components/AgentPipeline.tsx) with
  // real per-agent progress via polling. FUTURE UPGRADE: if this needs to feel
  // more instant, switch the FastAPI endpoint to Server-Sent Events or a
  // WebSocket and have it push a status event straight after each CrewAI task
  // completes (app/jobs.py already has the per-task callback hook to do this;
  // it just currently gets read via polling instead of pushed).
  const authHeadersForPoll = await authHeaders();
  for (;;) {
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch(`/api/analyze/${job_id}/status`, { headers: authHeadersForPoll });
    if (!res.ok) return emptyResult(`Lost track of the analysis job (${res.status}).`);
    const job = (await res.json()) as JobStatus;
    onProgress?.(job.step_index, job.step_name);
    if (job.status === "done" && job.result) return job.result;
    if (job.status === "error") return emptyResult(job.error ?? "Analysis failed.");
  }
}

function emptyResult(error: string): AnalyzeResult {
  return {
    matched_schemes: [],
    coverage_summary: "",
    nearby_hospitals: [],
    document_checklist: [],
    voice_guidance: "",
    error,
  };
}

/** Send the report via Twilio SMS/WhatsApp through the backend. */
export async function sendReport(
  phoneNumber: string,
  channel: "sms" | "whatsapp",
  reportText: string
): Promise<{ ok: boolean; error?: string }> {
  const headers = await authHeaders();
  const res = await fetch("/api/send-report", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, channel, report_text: reportText }),
  });
  return res.json();
}

const LANG_TAGS: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

function formatIndianNumbersForSpeech(text: string): string {
  let t = text.replace(/₹\s*([\d,]+)/g, "$1 rupees");
  t = t.replace(/(\d{1,2}),(\d{2}),(\d{3})/g, (match, lakhs, thousands, hundreds) => {
    let res = `${lakhs} lakh`;
    if (thousands !== "00") res += ` ${Number(thousands)} thousand`;
    if (hundreds !== "000") res += ` ${Number(hundreds)}`;
    return res;
  });
  t = t.replace(/(\d{1,2}),(\d{3})/g, (match, thousands, hundreds) => {
    let res = `${thousands} thousand`;
    if (hundreds !== "000") res += ` ${Number(hundreds)}`;
    return res;
  });
  return t;
}

/** Speak the guidance aloud in the user's language. */
export function speak(text: string, language = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  
  const cleanText = formatIndianNumbersForSpeech(text);
  const utter = new SpeechSynthesisUtterance(cleanText);
  utter.lang = LANG_TAGS[language] ?? "en-IN";
  utter.rate = 0.95;
  
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === utter.lang) || voices.find((v) => v.lang.includes("IN"));
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Copy text to clipboard. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  }
}

/** Download the report as a text file. */
export function downloadReport(text: string, filename = "AarogyaMitra_Report.txt") {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Open print dialog for the report. */
export function printReport(text: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>AarogyaMitra Report</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 40px; line-height: 1.7; color: #1e293b; }
          h1 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
          pre { white-space: pre-wrap; font-family: inherit; }
          .disclaimer { margin-top: 30px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 0.85em; color: #92400e; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>🏥 AarogyaMitra Report</h1>
        <pre>${text}</pre>
        <div class="disclaimer">
          ⚠️ This is informational guidance generated by AI. Final eligibility and coverage must be confirmed with the official scheme portal or an empanelled hospital.
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}

/** Share via WhatsApp. */
export function shareWhatsApp(text: string) {
  const trimmed = text.length > 2000 ? text.substring(0, 2000) + "..." : text;
  const msg = encodeURIComponent(`🏥 AarogyaMitra Report:\n\n${trimmed}`);
  window.open(`https://wa.me/?text=${msg}`, "_blank");
}

/** Capture the browser's geolocation once, resolving to null on failure/denial. */
export function getLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}
