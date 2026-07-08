"use client";

import { Home, History, Bookmark, User, type LucideIcon } from "lucide-react";

export type NavView = "home" | "history" | "saved" | "profile";

const NAV_ITEMS: { view: NavView; icon: LucideIcon; label: string }[] = [
  { view: "home", icon: Home, label: "New Check" },
  { view: "history", icon: History, label: "History" },
  { view: "saved", icon: Bookmark, label: "Saved Hospitals" },
  { view: "profile", icon: User, label: "Profile" },
];

export default function Sidebar({
  active,
  onNavigate,
  historyCount,
}: {
  active: NavView;
  onNavigate: (view: NavView) => void;
  historyCount: number;
}) {
  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      {NAV_ITEMS.map(({ view, icon: Icon, label }) => (
        <button
          key={view}
          type="button"
          className={`sidebar-link ${active === view ? "active" : ""}`}
          onClick={() => onNavigate(view)}
        >
          <span className="sidebar-icon">
            <Icon size={20} />
            {view === "history" && historyCount > 0 && (
              <span className="sidebar-badge">{historyCount}</span>
            )}
          </span>
          <span className="sidebar-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
