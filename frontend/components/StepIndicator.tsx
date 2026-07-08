"use client";

import { Check, type LucideIcon } from "lucide-react";

export interface StepMeta {
  icon: LucideIcon;
  label: string;
}

// Full labelled indicator with icons from md: up; collapses to a compact
// "Step X of Y" label + thin progress bar below that, to stay out of the way
// on small screens. Deliberately no connecting line between nodes — a plain
// grid of circle+label keeps this readable and low-clutter for low-literacy
// users, and avoids the alignment fragility of an absolutely-positioned track.
export default function StepIndicator({ steps, activeStep }: { steps: StepMeta[]; activeStep: number }) {
  return (
    <div className="mb-6">
      <div className="md:hidden">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Step {activeStep + 1} of {steps.length}
          </span>
          <span className="truncate text-xs font-semibold text-primary-700">{steps[activeStep]?.label}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-300 ease-out"
            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden grid-flow-col auto-cols-fr gap-1 md:grid">
        {steps.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          const Icon = step.icon;
          return (
            <li key={step.label} className="flex flex-col items-center gap-2 px-1">
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                  isDone
                    ? "border-primary-600 bg-primary-600 text-white"
                    : isActive
                      ? "border-primary-600 bg-white text-primary-700 ring-4 ring-primary-500/15"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {isDone ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={2.25} />}
              </span>
              <span
                className={`max-w-[92px] text-center text-[11px] font-semibold leading-tight transition-colors duration-300 ${
                  isActive ? "text-primary-700" : isDone ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
