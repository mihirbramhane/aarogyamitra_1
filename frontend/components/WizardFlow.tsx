"use client";

import { Mic, MapPin, CreditCard, Users, Stethoscope, Languages, ClipboardCheck } from "lucide-react";
import Wizard from "@/components/Wizard";
import StepIndicator, { type StepMeta } from "@/components/StepIndicator";
import IconChoice from "@/components/IconChoice";
import type { Strings, LangCode } from "@/lib/i18n";

export const WIZARD_STEPS = 6;

// NOTE: the real flow has 6 steps (it also collects a ration card + language
// choice, and the bill upload lives inside the final "Review" step rather
// than a separate "Documents" step) — labelled here as-is rather than
// silently dropping/merging steps to match a 5-name list, so the step
// indicator still reflects exactly what the form actually collects.
const STEP_META: StepMeta[] = [
  { icon: Languages, label: "Language" },
  { icon: MapPin, label: "Location" },
  { icon: Users, label: "Income & Family" },
  { icon: CreditCard, label: "Ration Card" },
  { icon: Stethoscope, label: "Ailment" },
  { icon: ClipboardCheck, label: "Review" },
];

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const LANGUAGES: { value: LangCode; label: string; flag: string }[] = [
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "te", label: "తెలుగు", flag: "🇮🇳" },
  { value: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { value: "mr", label: "मराठी", flag: "🇮🇳" },
  { value: "bn", label: "বাংলা", flag: "🇮🇳" },
  { value: "en", label: "English", flag: "🇬🇧" },
];

export interface WizardForm {
  state: string;
  annual_income: number;
  family_size: number;
  has_ration_card: boolean;
  ration_card_type: string;
  ailment: string;
  language: string;
  latitude?: number;
  longitude?: number;
}

interface WizardFlowProps {
  step: number;
  form: WizardForm;
  set: <K extends keyof WizardForm>(k: K, v: WizardForm[K]) => void;
  bill: File | null;
  setBill: (f: File | null) => void;
  locating: boolean;
  onUseMyLocation: () => void;
  onBack: (step: number) => void;
  onNext: (step: number) => void;
  onRun: () => void;
  strings: Strings;
  onSpeakStep: (text: string) => void;
  speechToText: {
    supported: boolean;
    listening: boolean;
    start: () => void;
    stop: () => void;
  };
}

export default function WizardFlow(props: WizardFlowProps) {
  return (
    <>
      <StepIndicator steps={STEP_META} activeStep={props.step} />
      <WizardStep {...props} />
    </>
  );
}

function WizardStep({
  step,
  form,
  set,
  bill,
  setBill,
  locating,
  onUseMyLocation,
  onBack,
  onNext,
  onRun,
  strings,
  onSpeakStep,
  speechToText,
}: WizardFlowProps) {
  if (step === 0) {
    return (
      <Wizard
        key={0}
        title={strings.stepLanguage}
        onSpeak={() => onSpeakStep(strings.stepLanguage)}
        tapToHearLabel={strings.tapToHear}
        footer={
          <button className="btn-primary" onClick={() => onNext(1)}>
            {strings.next}
          </button>
        }
      >
        <IconChoice
          value={form.language}
          onChange={(v) => set("language", v)}
          options={LANGUAGES.map((l) => ({
            value: l.value,
            label: l.label,
            icon: <span style={{ fontSize: 22 }}>{l.flag}</span>,
          }))}
        />
      </Wizard>
    );
  }

  if (step === 1) {
    return (
      <Wizard
        key={1}
        title={strings.stepState}
        onSpeak={() => onSpeakStep(strings.stepState)}
        tapToHearLabel={strings.tapToHear}
        footer={
          <>
            <button className="btn-ghost" onClick={() => onBack(0)}>{strings.back}</button>
            <button className="btn-primary" onClick={() => onNext(2)}>{strings.next}</button>
          </>
        }
      >
        <div className="input-group">
          <label>{strings.stepStateHint}</label>
          <select value={form.state} onChange={(e) => set("state", e.target.value)}>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-ghost location-btn" onClick={onUseMyLocation} disabled={locating}>
          <MapPin size={16} />
          {locating ? "…" : form.latitude ? "📍 Location captured ✓" : strings.useMyLocation}
        </button>
      </Wizard>
    );
  }

  if (step === 2) {
    return (
      <Wizard
        key={2}
        title={strings.stepIncome}
        onSpeak={() => onSpeakStep(strings.stepIncome)}
        tapToHearLabel={strings.tapToHear}
        footer={
          <>
            <button className="btn-ghost" onClick={() => onBack(1)}>{strings.back}</button>
            <button className="btn-primary" onClick={() => onNext(3)}>{strings.next}</button>
          </>
        }
      >
        <div className="form-grid">
          <div className="input-group">
            <label>{strings.incomeLabel}</label>
            <input
              type="number"
              value={form.annual_income}
              onChange={(e) => set("annual_income", Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>{strings.familySizeLabel}</label>
            <input
              type="number"
              value={form.family_size}
              onChange={(e) => set("family_size", Number(e.target.value))}
              min={1}
              max={20}
            />
          </div>
        </div>
      </Wizard>
    );
  }

  if (step === 3) {
    return (
      <Wizard
        key={3}
        title={strings.stepRationCard}
        onSpeak={() => onSpeakStep(strings.stepRationCard)}
        tapToHearLabel={strings.tapToHear}
        footer={
          <>
            <button className="btn-ghost" onClick={() => onBack(2)}>{strings.back}</button>
            <button className="btn-primary" onClick={() => onNext(4)}>{strings.next}</button>
          </>
        }
      >
        <IconChoice
          value={form.ration_card_type}
          onChange={(v) => {
            set("ration_card_type", v);
            set("has_ration_card", v !== "");
          }}
          options={[
            { value: "White / BPL", label: strings.rationWhite, icon: <CreditCard color="#f8fafc" />, color: "#94a3b8" },
            { value: "Yellow / AAY", label: strings.rationYellow, icon: <CreditCard color="#fff" />, color: "#eab308" },
            { value: "Orange / APL", label: strings.rationOrange, icon: <CreditCard color="#fff" />, color: "#f97316" },
            { value: "", label: strings.rationNone, icon: <CreditCard color="#fff" />, color: "#64748b" },
          ]}
        />
      </Wizard>
    );
  }

  if (step === 4) {
    return (
      <Wizard
        key={4}
        title={strings.stepAilment}
        onSpeak={() => onSpeakStep(strings.stepAilment)}
        tapToHearLabel={strings.tapToHear}
        footer={
          <>
            <button className="btn-ghost" onClick={() => onBack(3)}>{strings.back}</button>
            <button className="btn-primary" onClick={() => onNext(5)}>{strings.next}</button>
          </>
        }
      >
        <div className="input-group full-width">
          <label>{strings.stepAilment}</label>
          <div className="ailment-input-row">
            <input
              value={form.ailment}
              onChange={(e) => set("ailment", e.target.value)}
              placeholder={strings.ailmentPlaceholder}
            />
            {speechToText.supported && (
              <button
                type="button"
                className={`mic-btn ${speechToText.listening ? "listening" : ""}`}
                title={strings.tapToSpeak}
                onClick={() => (speechToText.listening ? speechToText.stop() : speechToText.start())}
              >
                <Mic size={18} />
              </button>
            )}
          </div>
        </div>
      </Wizard>
    );
  }

  // step === 5
  return (
    <Wizard
      key={5}
      title={strings.stepReview}
      footer={
        <>
          <button className="btn-ghost" onClick={() => onBack(4)}>{strings.back}</button>
          <button className="btn-primary btn-run" onClick={onRun}>{strings.submit}</button>
        </>
      }
    >
      <div className="input-group">
        <label>{strings.uploadBill}</label>
        <div className="file-input-wrapper">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setBill(e.target.files?.[0] ?? null)}
            id="bill-upload"
          />
          {bill && <span className="file-name">📎 {bill.name}</span>}
        </div>
      </div>
      <ul className="review-summary">
        <li>{LANGUAGES.find((l) => l.value === form.language)?.label}</li>
        <li>{form.state}{form.latitude ? " (📍 location shared)" : ""}</li>
        <li>₹{form.annual_income.toLocaleString("en-IN")} · {form.family_size} family members</li>
        <li>{form.ration_card_type || strings.rationNone}</li>
        <li>{form.ailment}</li>
      </ul>
    </Wizard>
  );
}
