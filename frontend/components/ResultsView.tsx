"use client";

import { useState } from "react";
import { Volume2, StopCircle, Copy, Check, Download, Printer, MessageCircleMore } from "lucide-react";
import type { AnalyzeResult } from "@/lib/aarogyamitra";
import type { Strings } from "@/lib/i18n";
import dynamic from "next/dynamic";
import SchemeCard from "@/components/SchemeCard";
import DocumentChecklist from "@/components/DocumentChecklist";
import ReportQRCode from "@/components/ReportQRCode";
import SendReportPanel from "@/components/SendReportPanel";
import NextStepsTab from "@/components/NextStepsTab";
import StatCards from "@/components/StatCards";

// Google Maps needs `window` — load client-only, no SSR.
const HospitalMap = dynamic(() => import("@/components/HospitalMap"), { ssr: false });

export default function ResultsView({
  result,
  reportId,
  userLocation,
  strings,
  isSpeaking,
  copied,
  onSpeak,
  onStop,
  onCopy,
  onDownload,
  onPrint,
  onWhatsApp,
  onReset,
}: {
  result: AnalyzeResult;
  reportId: string;
  userLocation: { latitude: number; longitude: number } | null;
  strings: Strings;
  isSpeaking: boolean;
  copied: boolean;
  onSpeak: () => void;
  onStop: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onWhatsApp: () => void;
  onReset: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"report" | "steps">("report");

  if (result.error) {
    return (
      <div className="card error-card">
        <h2>❌ Error</h2>
        <p>{result.error}</p>
        <button onClick={onReset} className="btn-primary" style={{ marginTop: 12 }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <StatCards result={result} />

      <div className="card action-bar">
        <h2 className="section-title">{strings.resultsReady}</h2>
        <div className="action-buttons">
          <button
            onClick={isSpeaking ? onStop : onSpeak}
            className={`btn-action ${isSpeaking ? "btn-speaking" : "btn-listen"}`}
          >
            {isSpeaking ? <StopCircle size={16} /> : <Volume2 size={16} />}
            {isSpeaking ? strings.stop : strings.listen}
          </button>
          <button onClick={onCopy} className="btn-action btn-copy">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : strings.copy}
          </button>
          <button onClick={onDownload} className="btn-action btn-download">
            <Download size={16} />
            {strings.download}
          </button>
          <button onClick={onPrint} className="btn-action btn-print">
            <Printer size={16} />
            {strings.print}
          </button>
          <button onClick={onWhatsApp} className="btn-action btn-whatsapp">
            <MessageCircleMore size={16} />
            {strings.shareWhatsApp}
          </button>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          📄 Full Report
        </button>
        <button
          className={`tab ${activeTab === "steps" ? "active" : ""}`}
          onClick={() => setActiveTab("steps")}
        >
          📌 Next Steps
        </button>
      </div>

      {activeTab === "report" && (
        <>
          {result.matched_schemes.length > 0 && (
            <div className="card">
              <h3 className="section-title">🛡️ {strings.matchedSchemes}</h3>
              <div className="scheme-grid">
                {result.matched_schemes.map((s, i) => (
                  <SchemeCard key={i} scheme={s} />
                ))}
              </div>
            </div>
          )}

          {result.coverage_summary && (
            <div className="card">
              <h3 className="section-title">📋 {strings.coverageSummary}</h3>
              <p className="section-desc" style={{ whiteSpace: "pre-wrap" }}>
                {result.coverage_summary}
              </p>
            </div>
          )}

          <HospitalMap hospitals={result.nearby_hospitals} userLocation={userLocation} />

          <DocumentChecklist reportId={reportId} items={result.document_checklist} />

          <div className="card report-card">
            <h3 className="section-title">🗣️ Guidance</h3>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{result.voice_guidance}</p>
            <div className="disclaimer">⚠️ {result.disclaimer}</div>
          </div>

          <div className="card">
            <h3 className="section-title">📲 Send this report</h3>
            <div className="send-and-qr">
              <SendReportPanel reportText={result.raw_report ?? result.voice_guidance} strings={strings} />
              <ReportQRCode text={result.raw_report ?? result.voice_guidance} />
            </div>
          </div>
        </>
      )}

      {activeTab === "steps" && <NextStepsTab />}

      <button
        className="btn-ghost"
        style={{ margin: "8px auto 0", display: "block" }}
        onClick={onReset}
      >
        ↺ Start a new search
      </button>
    </>
  );
}
