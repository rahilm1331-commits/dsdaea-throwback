import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { QUESTION_START_BUFFER_SECONDS } from "@/lib/game";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const token = String(body.hostToken || "");
  const db = supabaseAdmin();
  const { data: game, error } = await db.from("games").select("id,host_token,status,stage,stage_status,current_round").eq("code", code).single();
  if (error || !game || game.host_token !== token) return NextResponse.json({ error: "Host authorization failed." }, { status: 403 });
  if (game.status === "finished") return NextResponse.json({ error: "Game is finished." }, { status: 409 });
  if (game.stage_status === "question") return NextResponse.json({ error: "This round is already running." }, { status: 409 });

  const now = new Date(Date.now() + QUESTION_START_BUFFER_SECONDS * 1000).toISOString();
  const { error: updateError } = await db.from("games").update({
    status: "question",
    stage_status: "question",
    question_started_at: now,
  }).eq("id", game.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
