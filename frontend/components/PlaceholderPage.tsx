"use client";

import type { LucideIcon } from "lucide-react";

export default function PlaceholderPage({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="card placeholder-card">
      <div className="placeholder-icon">
        <Icon size={26} />
      </div>
      <h2 className="section-title">{title}</h2>
      <p className="section-desc">{description}</p>
    </div>
  );
}
