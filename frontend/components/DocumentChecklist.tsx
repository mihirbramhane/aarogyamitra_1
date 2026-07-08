"use client";

import { useEffect, useState } from "react";
import { FileCheck } from "lucide-react";

export default function DocumentChecklist({
  reportId,
  items,
}: {
  reportId: string;
  items: string[];
}) {
  const storageKey = `aarogyamitra_checklist_${reportId}`;
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setChecked(JSON.parse(saved));
  }, [storageKey]);

  function toggle(i: number) {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  if (items.length === 0) return null;

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="card checklist-card">
      <h3 className="section-title">
        <FileCheck size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
        Documents Needed ({doneCount}/{items.length})
      </h3>
      <div className="checklist-list">
        {items.map((doc, i) => (
          <label key={i} className={`checklist-item ${checked[i] ? "checked" : ""}`}>
            <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)} />
            <span>{doc}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
