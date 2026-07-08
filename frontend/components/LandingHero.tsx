import Logo from "@/components/Logo";
import { UserRound, Bot, HeartHandshake } from "lucide-react";

const STEPS = [
  { icon: UserRound, label: "Tell us about yourself" },
  { icon: Bot, label: "Our AI agents check your eligibility" },
  { icon: HeartHandshake, label: "Get your hospital + paperwork, in your language" },
];

// The single hero: rendered once and reflowed by the parent grid — stacked
// above the form on mobile, side-by-side on desktop. Kept intentionally
// compact (tight gaps/padding by default, roomier from sm: up) so the
// stacked-mobile layout stays close to one screen. One instance only, no
// separate mobile/desktop copies, so there's nothing that can render twice.
export default function LandingHero() {
  return (
    <div className="flex h-full flex-col justify-center gap-5 px-6 py-8 text-white sm:gap-8 sm:px-12 sm:py-10 lg:py-16">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <span className="text-xl font-extrabold tracking-tight sm:text-2xl">AarogyaMitra</span>
      </div>

      <p className="max-w-sm text-base font-medium leading-snug text-primary-50 sm:text-lg lg:text-xl">
        Find free hospital treatment you&apos;re entitled to.
      </p>

      <ol className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
        {STEPS.map((step, i) => (
          <li key={step.label} className="flex items-center gap-3 sm:gap-4">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 sm:h-10 sm:w-10">
              <step.icon size={17} strokeWidth={2.25} />
            </span>
            <span className="text-sm font-medium text-primary-50 sm:text-base">
              <span className="mr-1.5 text-white/60">{i + 1}.</span>
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
