import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { QUESTION_START_BUFFER_SECONDS } from "@/lib/game";
import { STAGES, RoundKey } from "@/lib/rounds";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const token = String(body.hostToken || "");
  const db = supabaseAdmin();
  const { data: game, error } = await db.from("games").select("id,host_token,status,stage,stage_status,current_round,question_started_at").eq("code", code).single();
  if (error || !game || game.host_token !== token) return NextResponse.json({ error: "Host authorization failed." }, { status: 403 });
  if (game.status !== "question" || game.stage_status !== "question") return NextResponse.json({ error: "No active question." }, { status: 409 });
  if (!game.question_started_at || Date.now() - new Date(game.question_started_at).getTime() < 30000) {
    return NextResponse.json({ error: "Wait until the 30-second timer ends and the answer is revealed." }, { status: 409 });
  }

  const questionIndex = game.current_round % 10;

  // Finalize the revealed question before moving on. This is idempotent, so
  // it is also safe if the host already finalized it when the reveal appeared.
  const { error: finalizeError } = await db.rpc("finalize_round_scores", {
    p_game_id: game.id,
    p_round: game.current_round,
  });
  if (finalizeError) return NextResponse.json({ error: finalizeError.message }, { status: 500 });

  if (questionIndex < 9) {
    const { error: updateError } = await db.from("games").update({
      current_round: game.current_round + 1,
      question_started_at: new Date(Date.now() + QUESTION_START_BUFFER_SECONDS * 1000).toISOString(),
    }).eq("id", game.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: "next_question" });
  }

  const stageIndex = STAGES.indexOf(game.stage as RoundKey);
  const nextStage = STAGES[stageIndex + 1];
  if (!nextStage) {
    const { error: finishError } = await db.from("games").update({ status: "finished", stage_status: "finished", question_started_at: null }).eq("id", game.id);
    if (finishError) return NextResponse.json({ error: finishError.message }, { status: 500 });
    return NextResponse.json({ finished: true });
  }

  const { error: stageError } = await db.from("games").update({
    stage: nextStage,
    current_round: (stageIndex + 1) * 10,
    status: "lobby",
    stage_status: "not_started",
    question_started_at: null,
  }).eq("id", game.id);
  if (stageError) return NextResponse.json({ error: stageError.message }, { status: 500 });
  return NextResponse.json({ ok: true, action: "next_stage", stage: nextStage });
}
