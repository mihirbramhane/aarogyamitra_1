"use client";

import { ShieldCheck } from "lucide-react";
import type { MatchedScheme } from "@/lib/aarogyamitra";

export default function SchemeCard({ scheme }: { scheme: MatchedScheme }) {
  return (
    <div className="scheme-card">
      <div className="scheme-card-icon">
        <ShieldCheck size={22} />
      </div>
      <div className="scheme-card-body">
        <h4 className="scheme-card-name">{scheme.name}</h4>
        <p className="scheme-card-authority">{scheme.authority}</p>
        {scheme.coverage_amount && (
          <p className="scheme-card-coverage">💰 {scheme.coverage_amount}</p>
        )}
        <p className="scheme-card-reason">{scheme.why_eligible}</p>
      </div>
    </div>
  );
}
