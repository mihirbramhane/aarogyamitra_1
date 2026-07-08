"use client";

import type { ReactNode } from "react";
import { Volume2 } from "lucide-react";

// Renders one step's card chrome (title + speak button + body + footer).
// The overall step-indicator lives one level up (see StepIndicator, rendered
// once by WizardFlow) — this component only owns a single step's content, so
// giving it a fresh `key` per step (done by the caller) remounts just this
// card and replays the fade+slide-in animation, without disturbing the
// indicator above it.
export default function Wizard({
  title,
  onSpeak,
  tapToHearLabel,
  children,
  footer,
}: {
  title: string;
  onSpeak?: () => void;
  tapToHearLabel?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="card wizard-card animate-step-in">
      <div className="wizard-header">
        <h2 className="section-title">{title}</h2>
        {onSpeak && (
          <button
            type="button"
            onClick={onSpeak}
            className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
          >
            <Volume2 size={15} /> {tapToHearLabel}
          </button>
        )}
      </div>
      <div className="wizard-body">{children}</div>
      <div className="wizard-footer">{footer}</div>
    </div>
  );
}
