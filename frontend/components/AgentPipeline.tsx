"use client";

import { UserCheck, Search, ShieldCheck, Building2, FileText, Volume2, Check, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const AGENT_STEPS: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: UserCheck, label: "Eligibility Profiler", desc: "Reviewing your profile…" },
  { icon: Search, label: "Scheme Matcher", desc: "Checking scheme eligibility…" },
  { icon: ShieldCheck, label: "Coverage Analyst", desc: "Working out what's covered…" },
  { icon: Building2, label: "Hospital Finder", desc: "Locating nearby hospitals…" },
  { icon: FileText, label: "Document Agent", desc: "Preparing your paperwork…" },
  { icon: Volume2, label: "Voice Guide", desc: "Translating your guidance…" },
];

export default function AgentPipeline({
  agentStepIndex,
  workingLabel,
}: {
  agentStepIndex: number;
  workingLabel: string;
}) {
  return (
    <div className="card agent-pipeline">
      <h2 className="section-title">
        <Loader2 size={18} className="spin-icon" /> {workingLabel}
      </h2>
      <p className="section-desc">6 specialised agents are analysing your case in real time.</p>
      <div className="pipeline">
        {AGENT_STEPS.map((step, i) => {
          const status = i < agentStepIndex ? "done" : i === agentStepIndex ? "active" : "pending";
          const Icon = step.icon;
          return (
            <div key={i} className={`pipeline-step ${status}`}>
              <div className="step-icon-circle">
                <Icon size={20} />
                {status === "done" && (
                  <span className="step-check-badge">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="step-info">
                <span className="step-label">{step.label}</span>
                {status === "active" && <span className="step-desc step-desc-active">{step.desc}</span>}
                {status === "pending" && <span className="step-desc">Waiting…</span>}
                {status === "done" && <span className="step-desc step-desc-done">Done</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
