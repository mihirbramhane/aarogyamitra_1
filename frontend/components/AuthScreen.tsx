"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LandingHero from "@/components/LandingHero";

// Also rendered before language selection — kept English (a literate helper
// typically completes sign-up once for a low-literacy user).
export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMsg("");
    setLoading(true);
    const fn =
      mode === "in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error } = await fn;
    setLoading(false);
    if (error) setMsg(error.message);
    else if (mode === "up") setMsg("Account created — now sign in.");
  }

  const isSuccess = msg.startsWith("Account created");

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4 sm:p-6">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-card-xl lg:grid-cols-2">
        {/* Illustration side — one hero, reflowed by the grid: stacked above the
            form on mobile (grid-cols-1), side-by-side on desktop (lg:grid-cols-2).
            There is exactly one <LandingHero> in the tree, so nothing can double-render. */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-900">
          <LandingHero />
        </div>

        {/* Form side */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {mode === "in" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "in" ? "Sign in to continue" : "Takes less than a minute"}
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-600">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="min-h-[44px] rounded-xl border-[1.5px] border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-slate-600">Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="min-h-[44px] rounded-xl border-[1.5px] border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                />
              </label>

              <button
                onClick={submit}
                disabled={loading}
                className="mt-2 min-h-[48px] rounded-xl bg-gradient-to-br from-primary-700 to-primary-600 font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Please wait…" : mode === "in" ? "Sign In" : "Sign Up"}
              </button>

              {msg && (
                <p
                  className={`rounded-lg px-3 py-2 text-center text-sm ${
                    isSuccess ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"
                  }`}
                >
                  {msg}
                </p>
              )}

              <button
                onClick={() => setMode(mode === "in" ? "up" : "in")}
                className="mt-1 text-center text-sm text-primary-700 underline-offset-2 hover:text-primary-800 hover:underline"
              >
                {mode === "in" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
