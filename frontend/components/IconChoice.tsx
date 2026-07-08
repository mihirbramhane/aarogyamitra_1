"use client";

import type { ReactNode } from "react";

export interface IconChoiceOption {
  value: string;
  label: string;
  icon: ReactNode;
  color?: string;
}

export default function IconChoice({
  options,
  value,
  onChange,
}: {
  options: IconChoiceOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="icon-choice-grid">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`icon-choice-btn ${value === opt.value ? "selected" : ""}`}
          style={opt.color ? ({ ["--choice-color" as any]: opt.color } as React.CSSProperties) : undefined}
          onClick={() => onChange(opt.value)}
        >
          <span className="icon-choice-icon">{opt.icon}</span>
          <span className="icon-choice-label">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
