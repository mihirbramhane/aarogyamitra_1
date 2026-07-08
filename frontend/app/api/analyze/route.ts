// app/api/analyze/route.ts
// Verifies the Supabase auth token, then forwards the request to the CrewAI
// FastAPI backend. Keeps the backend URL server-side.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchBackend, backendUnreachableMessage } from "@/lib/backendFetch";

export async function POST(req: NextRequest) {
  // --- 1. Require an authenticated user ---
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // --- 2. Forward the multipart form (profile JSON + optional bill) ---
  const incoming = await req.formData();
  const forward = new FormData();
  const profile = incoming.get("profile");
  const bill = incoming.get("bill");
  if (profile) forward.append("profile", profile as string);
  if (bill && bill instanceof File) forward.append("bill", bill);

  try {
    const resp = await fetchBackend("/analyze", { method: "POST", body: forward });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json(
        { error: data.detail ?? `Backend error (${resp.status})` },
        { status: resp.status >= 500 ? 502 : resp.status }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: backendUnreachableMessage(e) }, { status: 502 });
  }
}
