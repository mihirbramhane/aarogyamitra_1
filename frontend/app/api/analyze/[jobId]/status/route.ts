// app/api/analyze/[jobId]/status/route.ts
// Proxies job-status polls to the CrewAI backend after verifying the Supabase
// auth token, mirroring the pattern in app/api/analyze/route.ts.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchBackend, backendUnreachableMessage } from "@/lib/backendFetch";

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
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

  try {
    const resp = await fetchBackend(`/analyze/${params.jobId}/status`, {}, 10_000);
    if (!resp.ok) {
      return NextResponse.json({ error: `Backend error (${resp.status})` }, { status: resp.status });
    }
    return NextResponse.json(await resp.json());
  } catch (e) {
    return NextResponse.json({ error: backendUnreachableMessage(e) }, { status: 502 });
  }
}
