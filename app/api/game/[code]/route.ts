import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { EVENTS } from "@/lib/events";
import { ASCENSION_QUESTIONS, IGNITION_QUESTIONS, RoundKey } from "@/lib/rounds";
import { stageForRound } from "@/lib/stage";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const db = supabaseAdmin();
  const { data: game, error } = await db.from("games")
    .select("id,code,status,current_round,question_started_at,created_at,stage,stage_status,host_token")
    .eq("code", code).single();
  if (error || !game) return NextResponse.json({ error: "Game not found." }, { status: 404 });

  // Legacy V1 games default to Throwback; all newly-created games have explicit stage data.
  const stage = (game.stage || stageForRound(game.current_round)) as RoundKey;
  const questionIndex = game.current_round % 10;
  const expired = Boolean(game.question_started_at && Date.now() - new Date(game.question_started_at).getTime() >= 30000);
  const playerToken = req.headers.get("x-player-token") || "";
  const hostToken = req.headers.get("x-host-token") || "";
  const isHost = Boolean(hostToken && hostToken === (game as any).host_token);

  let content: any = null;
  if (stage === "throwback") {
    const ev = EVENTS[questionIndex];
    if (ev) content = { type: "throwback", id: ev.id, title: ev.title, image: ev.image, description: ev.description };
  } else {
    const questions = stage === "ascension" ? ASCENSION_QUESTIONS : IGNITION_QUESTIONS;
    const q = questions[questionIndex];
    if (q) content = { type: "quiz", id: q.id, question: q.question, options: q.options };
  }

  let players: any[] = [];
  if (isHost) {
    const { data, error: playerError } = await db.from("players")
      .select("id,name,participant_id,total_score")
      .eq("game_id", game.id)
      .order("total_score", { ascending: false })
      .order("joined_at", { ascending: true });
    if (playerError) return NextResponse.json({ error: playerError.message }, { status: 500 });
    players = data || [];
  }

  let reveal: any = null;
  if (expired && content) {
    if (stage === "throwback") {
      const ev = EVENTS[questionIndex];
      reveal = { type: "throwback", correctYear: ev.year, title: ev.title };
    } else {
      const questions = stage === "ascension" ? ASCENSION_QUESTIONS : IGNITION_QUESTIONS;
      const q = questions[questionIndex];
      reveal = { type: "quiz", correctOption: q.correctIndex, correctText: q.options[q.correctIndex], explanation: q.explanation };
    }
  }

  let myAnswer = null;
  if (playerToken) {
    const { data: player } = await db.from("players").select("id").eq("game_id", game.id).eq("player_token", playerToken).maybeSingle();
    if (player) {
      const { data: answer } = await db.from("answers")
        .select("points,guessed_year,answer_text,round")
        .eq("player_id", player.id).eq("round", game.current_round).maybeSingle();
      if (answer) myAnswer = {
        points: answer.points,
        guessedYear: answer.guessed_year,
        selectedOption: answer.answer_text == null ? null : Number(answer.answer_text),
      };
    }
  }

  const safeGame = { ...game };
  delete (safeGame as any).host_token;

  return NextResponse.json({
    game: { ...safeGame, stage },
    content,
    reveal: expired ? reveal : null,
    myAnswer,
    players: players || [],
    serverNow: new Date().toISOString(),
  });
}

