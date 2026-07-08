"use client";

import { ClipboardList, Receipt, ShieldCheck } from "lucide-react";
import type { AnalyzeResult, CoverageStatus } from "@/lib/aarogyamitra";

const STATUS_META: Record<CoverageStatus, { label: string; className: string }> = {
  full: { label: "Fully covered", className: "stat-good" },
  partial: { label: "Partially covered", className: "stat-warn" },
  none: { label: "Not covered", className: "stat-bad" },
  unknown: { label: "Not determined", className: "stat-neutral" },
};

export default function StatCards({ result }: { result: AnalyzeResult }) {
  const status = STATUS_META[result.coverage_status ?? "unknown"];

  return (
    <div className="stat-cards">
      <div className="stat-card">
        <div className="stat-icon stat-icon-teal">
          <ClipboardList size={20} />
        </div>
        <div className="stat-body">
          <span className="stat-value">{result.matched_schemes.length}</span>
          <span className="stat-label">Matched Schemes</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-amber">
          <Receipt size={20} />
        </div>
        <div className="stat-body">
          <span className="stat-value">{result.bill_amount || "—"}</span>
          <span className="stat-label">{result.bill_amount ? "Bill Amount" : "No bill uploaded"}</span>
        </div>
      </div>

      <div className={`stat-card ${status.className}`}>
        <div className="stat-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="stat-body">
          <span className="stat-value">{status.label}</span>
          <span className="stat-label">Coverage Status</span>
        </div>
      </div>
    </div>
  );
}
