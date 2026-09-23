import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { EVENTS } from "@/lib/events";
import { ASCENSION_QUESTIONS, IGNITION_QUESTIONS, RoundKey } from "@/lib/rounds";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const playerToken = String(body.playerToken || "");
  const answer = Number(body.answer);
  if (!playerToken || !Number.isInteger(answer)) return NextResponse.json({ error: "Invalid answer." }, { status: 400 });

  const db = supabaseAdmin();
  const { data: game, error } = await db.from("games")
    .select("id,stage,current_round,status,stage_status,question_started_at")
    .eq("code", code).single();
  if (error || !game) return NextResponse.json({ error: "Game not found." }, { status: 404 });
  if (game.status !== "question" || game.stage_status !== "question") return NextResponse.json({ error: "Answers are not open." }, { status: 409 });

  const stage = game.stage as RoundKey;
  const questionIndex = game.current_round % 10;

  if (stage === "throwback") {
    if (!Number.isInteger(answer) || answer < 1800 || answer > 2026) return NextResponse.json({ error: "Choose a year from 1800 to 2026." }, { status: 400 });
    const ev = EVENTS[questionIndex];
    if (!ev) return NextResponse.json({ error: "Question not found." }, { status: 404 });
    const { data, error: rpcError } = await db.rpc("submit_throwback_answer", {
      p_player_token: playerToken,
      p_code: code,
      p_guess: answer,
      p_correct_year: ev.year,
      p_title: ev.title,
    });
    if (rpcError) return answerError(rpcError.message);
    const result = Array.isArray(data) ? data[0] : data;
    if (!result) return NextResponse.json({ error: "No answer result returned." }, { status: 500 });
    return NextResponse.json({ accepted: true, points: result.points, guess: result.guessed_year, difference: result.difference });
  }

  if (answer < 0 || answer > 3) return NextResponse.json({ error: "Choose one of the four options." }, { status: 400 });
  const questions = stage === "ascension" ? ASCENSION_QUESTIONS : IGNITION_QUESTIONS;
  const q = questions[questionIndex];
  if (!q) return NextResponse.json({ error: "Question not found." }, { status: 404 });

  const { data, error: rpcError } = await db.rpc("submit_quiz_answer", {
    p_player_token: playerToken,
    p_code: code,
    p_option: answer,
    p_correct_option: q.correctIndex,
    p_question_index: questionIndex,
    p_correct_text: q.options[q.correctIndex],
  });
  if (rpcError) return answerError(rpcError.message);
  const result = Array.isArray(data) ? data[0] : data;
  if (!result) return NextResponse.json({ error: "No answer result returned." }, { status: 500 });
  return NextResponse.json({ accepted: true, points: result.points, selectedOption: result.selected_option, alreadyAnswered: result.already_answered });
}

function answerError(message: string) {
  const status = /time is up|already answered|answers are not open/i.test(message) ? 409 : /session not found|authorization/i.test(message) ? 401 : 500;
  return NextResponse.json({ error: message }, { status });
}
