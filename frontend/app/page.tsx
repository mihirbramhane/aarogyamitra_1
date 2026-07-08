"use client";

import { useEffect, useState } from "react";
import { Bookmark, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  analyze,
  speak,
  stopSpeaking,
  copyToClipboard,
  downloadReport,
  printReport,
  shareWhatsApp,
  getLocation,
  type AnalyzeResult,
} from "@/lib/aarogyamitra";
import { t } from "@/lib/i18n";
import { useSpeechToText } from "@/lib/useSpeechToText";
import SplashScreen from "@/components/SplashScreen";
import AuthScreen from "@/components/AuthScreen";
import WizardFlow, { type WizardForm } from "@/components/WizardFlow";
import AgentPipeline, { AGENT_STEPS } from "@/components/AgentPipeline";
import ResultsView from "@/components/ResultsView";
import HistoryPanel, { type HistoryItem } from "@/components/HistoryPanel";
import Sidebar, { type NavView } from "@/components/Sidebar";
import PlaceholderPage from "@/components/PlaceholderPage";
import Logo from "@/components/Logo";
import type { Session } from "@supabase/supabase-js";

const AGENT_STEP_COUNT = AGENT_STEPS.length;

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <SplashScreen />;
  if (!session) return <AuthScreen />;
  return <Dashboard email={session.user.email ?? ""} />;
}

const HISTORY_KEY = "aarogyamitra_history";

function Dashboard({ email }: { email: string }) {
  const [form, setForm] = useState<WizardForm>({
    state: "Telangana",
    annual_income: 180000,
    family_size: 4,
    has_ration_card: true,
    ration_card_type: "White / BPL",
    ailment: "Cardiac surgery",
    language: "hi",
    latitude: undefined,
    longitude: undefined,
  });
  const strings = t(form.language);

  const [wizardStep, setWizardStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const [bill, setBill] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [agentStepIndex, setAgentStepIndex] = useState(0);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [view, setView] = useState<NavView>("home");

  const speechToText = useSpeechToText(form.language, (text) => set("ailment", text));

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function set<K extends keyof WizardForm>(k: K, v: WizardForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function saveHistory(next: HistoryItem[]) {
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  async function useMyLocation() {
    setLocating(true);
    const loc = await getLocation();
    setLocating(false);
    if (loc) {
      set("latitude", loc.latitude);
      set("longitude", loc.longitude);
    }
  }

  async function run() {
    setLoading(true);
    setResult(null);
    setAgentStepIndex(0);
    try {
      const res = await analyze({ ...form }, bill, (stepIndex) => setAgentStepIndex(stepIndex));

      // Snap the pipeline to "all done" and hold for a beat so the user sees
      // every node complete before the results screen replaces it — even if
      // the real backend progress (job polling) landed on the final step
      // early relative to this render.
      setAgentStepIndex(AGENT_STEP_COUNT);
      await new Promise((r) => setTimeout(r, 700));

      setResult(res);

      if (!res.error) {
        const item: HistoryItem = {
          id: Date.now().toString(),
          date: new Date().toLocaleString("en-IN"),
          ailment: form.ailment,
          state: form.state,
          language: form.language,
          report: res.raw_report ?? res.voice_guidance,
          disclaimer: res.disclaimer ?? "",
        };
        saveHistory([item, ...history].slice(0, 10));
      }
    } finally {
      setLoading(false);
    }
  }

  const reportText = result?.raw_report ?? result?.voice_guidance ?? "";

  function handleSpeak() {
    speak(reportText, form.language);
    setIsSpeaking(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const check = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(check);
        }
      }, 500);
    }
  }

  function handleStop() {
    stopSpeaking();
    setIsSpeaking(false);
  }

  async function handleCopy() {
    await copyToClipboard(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const fullText = `🏥 AarogyaMitra Report\nGenerated: ${new Date().toLocaleString("en-IN")}\nState: ${form.state} | Ailment: ${form.ailment}\n${"─".repeat(50)}\n\n${reportText}\n\n${"─".repeat(50)}\n⚠️ ${result?.disclaimer ?? ""}`;
    downloadReport(fullText, `AarogyaMitra_${form.state}_${form.ailment.replace(/\s+/g, "_")}.txt`);
  }

  function handlePrint() {
    printReport(reportText);
  }

  function handleWhatsApp() {
    shareWhatsApp(reportText);
  }

  function loadFromHistory(item: HistoryItem) {
    setResult({
      matched_schemes: [],
      coverage_summary: "",
      nearby_hospitals: [],
      document_checklist: [],
      voice_guidance: item.report,
      raw_report: item.report,
      disclaimer: item.disclaimer,
    });
    setView("home");
  }

  function deleteHistory(id: string) {
    saveHistory(history.filter((h) => h.id !== id));
  }

  function resetToWizard() {
    setResult(null);
    setWizardStep(0);
  }

  function handleNavigate(next: NavView) {
    // "New Check" always takes you back to a fresh wizard, even if a result
    // (or an in-progress one) is currently showing.
    if (next === "home" && (result || loading)) resetToWizard();
    setView(next);
  }

  return (
    <div className="app-shell">
      <Sidebar active={view} onNavigate={handleNavigate} historyCount={history.length} />

      <div className="dashboard">
        <header className="dash-header">
          <div className="header-left">
            <Logo size={32} title={strings.appName} />
            <h1 className="header-title">{strings.appName}</h1>
          </div>
          <div className="header-right">
            <button onClick={() => supabase.auth.signOut()} className="btn-ghost signout">
              {strings.signOut} ({email})
            </button>
          </div>
        </header>

        <main className="dash-main">
          {view === "home" && (
            <>
              {!loading && !result && (
                <WizardFlow
                  step={wizardStep}
                  form={form}
                  set={set}
                  bill={bill}
                  setBill={setBill}
                  locating={locating}
                  onUseMyLocation={useMyLocation}
                  onBack={setWizardStep}
                  onNext={setWizardStep}
                  onRun={run}
                  strings={strings}
                  onSpeakStep={(text) => speak(text, form.language)}
                  speechToText={speechToText}
                />
              )}

              {loading && <AgentPipeline agentStepIndex={agentStepIndex} workingLabel={strings.agentsWorking} />}

              {result && (
                <ResultsView
                  result={result}
                  reportId={history[0]?.id ?? "latest"}
                  userLocation={form.latitude != null && form.longitude != null ? { latitude: form.latitude, longitude: form.longitude } : null}
                  strings={strings}
                  isSpeaking={isSpeaking}
                  copied={copied}
                  onSpeak={handleSpeak}
                  onStop={handleStop}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  onPrint={handlePrint}
                  onWhatsApp={handleWhatsApp}
                  onReset={resetToWizard}
                />
              )}
            </>
          )}

          {view === "history" && (
            <HistoryPanel history={history} onView={loadFromHistory} onDelete={deleteHistory} />
          )}

          {view === "saved" && (
            <PlaceholderPage
              icon={Bookmark}
              title="Saved Hospitals"
              description="Bookmark hospitals from your results to find them here quickly next time. This feature is coming soon."
            />
          )}

          {view === "profile" && (
            <PlaceholderPage
              icon={User}
              title="Profile"
              description={`Signed in as ${email}. Profile settings and preferences are coming soon.`}
            />
          )}
        </main>
      </div>
    </div>
  );
}
