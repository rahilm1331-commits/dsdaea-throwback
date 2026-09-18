import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { EVENTS } from "@/lib/events";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const playerToken = String(body.playerToken || "");
  const guess = Number(body.guess);

  if (!Number.isInteger(guess) || guess < 1800 || guess > 2026) {
    return NextResponse.json({ error: "Invalid year." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: gameData, error: gameError } = await db
    .from("games")
    .select("id,current_round")
    .eq("code", code.toUpperCase())
    .single();

  if (gameError || !gameData) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const ev = EVENTS[gameData.current_round];
  if (!ev) return NextResponse.json({ error: "Round not found." }, { status: 404 });

  // The database function performs the authorization, time-window, duplicate-answer,
  // scoring, insert, and score update in one transaction. This avoids the several
  // sequential database round trips that made the old Lock In button feel slow.
  const { data, error } = await db.rpc("submit_throwback_answer", {
    p_player_token: playerToken,
    p_code: code.toUpperCase(),
    p_guess: guess,
    p_correct_year: ev.year,
    p_title: ev.title,
  });

  if (error) {
    const message = error.message || "Could not submit answer.";
    const status = /time is up/i.test(message) || /already answered/i.test(message) || /answers are not open/i.test(message) ? 409 : /authorization|session not found/i.test(message) ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) return NextResponse.json({ error: "No answer result returned." }, { status: 500 });

  return NextResponse.json({
    points: result.points,
    correctYear: result.correct_year,
    guess: result.guessed_year,
    difference: result.difference,
    title: result.title,
  });
}
