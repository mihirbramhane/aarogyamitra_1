// Icon-only mark: a heart on a rounded teal badge with a white cross cut out
// of its center — reads as "care" + "medical" at a glance, even at favicon
// size, without needing text. Used at consistent sizes across the landing
// hero, auth card and dashboard header.
export default function Logo({ size = 40, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id="aarogyamitra-logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#aarogyamitra-logo-bg)" />
      <path
        d="M20 29.5 10.9 21c-3.1-2.9-3.1-7.6 0-10.5 2.9-2.7 7.4-2.4 10 .6l.9 1 .9-1c2.6-3 7.1-3.3 10-.6 3.1 2.9 3.1 7.6 0 10.5L20 29.5Z"
        fill="white"
      />
      <path d="M18.3 16.3h3.4v3.4h3.4v3.4h-3.4v3.4h-3.4v-3.4h-3.4v-3.4h3.4v-3.4Z" fill="#0d9488" />
    </svg>
  );
}
