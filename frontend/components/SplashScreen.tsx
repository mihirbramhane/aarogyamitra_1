import Logo from "@/components/Logo";

// Rendered before we know the user's chosen language, so this stays English.
export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-icon">
          <Logo size={56} title="AarogyaMitra" />
        </div>
        <h1 className="splash-title">AarogyaMitra</h1>
        <p className="splash-sub">Loading your health guide…</p>
        <div className="loader" />
      </div>
    </div>
  );
}
