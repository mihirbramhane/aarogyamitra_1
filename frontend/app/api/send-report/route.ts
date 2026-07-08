// app/api/send-report/route.ts
// Verifies the Supabase auth token, then forwards the send request to the
// CrewAI FastAPI backend's Twilio-backed /send-report endpoint.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchBackend, backendUnreachableMessage } from "@/lib/backendFetch";

export async function POST(req: NextRequest) {
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

  const body = await req.json();

  try {
    const resp = await fetchBackend("/send-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await resp.json(), { status: resp.status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: backendUnreachableMessage(e) }, { status: 502 });
  }
}
