import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const token = String(body.hostToken || "");
  const round = Number(body.round);
  if (!token || !Number.isInteger(round) || round < 0 || round > 29) {
    return NextResponse.json({ error: "Invalid finalize request." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: game, error } = await db.from("games")
    .select("id,host_token,current_round,status,stage_status,question_started_at")
    .eq("code", code).single();
  if (error || !game) return NextResponse.json({ error: "Game not found." }, { status: 404 });
  if (game.host_token !== token) return NextResponse.json({ error: "Host authorization failed." }, { status: 403 });
  if (game.current_round !== round) return NextResponse.json({ error: "Question has changed." }, { status: 409 });
  if (game.status !== "question" || game.stage_status !== "question" || !game.question_started_at) {
    return NextResponse.json({ error: "No active question." }, { status: 409 });
  }
  if (Date.now() - new Date(game.question_started_at).getTime() < 30000) {
    return NextResponse.json({ error: "The question is still active." }, { status: 409 });
  }

  const { data, error: rpcError } = await db.rpc("finalize_round_scores", {
    p_game_id: game.id,
    p_round: round,
  });
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });
  return NextResponse.json({ ok: true, awarded: Number(data || 0) });
}
