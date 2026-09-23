import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { makeToken } from "@/lib/game";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = await req.json().catch(() => ({}));
  const participantId = String(body.participantId || "").trim().slice(0, 32);
  const name = String(body.name || "").trim().slice(0, 40);
  if (!participantId) return NextResponse.json({ error: "Enter your participant ID / roll number." }, { status: 400 });

  const db = supabaseAdmin();
  const { data: game, error: gameError } = await db.from("games").select("id,status").eq("code", code).single();
  if (gameError || !game) return NextResponse.json({ error: "Game not found." }, { status: 404 });
  if (game.status === "finished") return NextResponse.json({ error: "This game has finished." }, { status: 409 });

  const { data: existing } = await db.from("players")
    .select("id,name,participant_id,player_token,total_score")
    .eq("game_id", game.id)
    .ilike("participant_id", participantId)
    .maybeSingle();

  if (existing) {
    // Re-issuing a token lets a disconnected player resume with the same ID.
    const token = makeToken(40);
    const { data: updated, error } = await db.from("players")
      .update({ player_token: token, name: name || existing.name })
      .eq("id", existing.id)
      .select("id,name,participant_id,player_token,total_score")
      .single();
    if (error || !updated) return NextResponse.json({ error: "Could not restore your player session." }, { status: 500 });
    return NextResponse.json({ code, player: updated, resumed: true });
  }

  if (game.status !== "lobby") return NextResponse.json({ error: "This game has already started. Use your participant ID to resume." }, { status: 409 });
  if (!name) return NextResponse.json({ error: "Enter your name the first time you join." }, { status: 400 });

  const { count } = await db.from("players").select("id", { count: "exact", head: true }).eq("game_id", game.id);
  if ((count ?? 0) >= 250) return NextResponse.json({ error: "This room is full." }, { status: 409 });

  const { data: player, error } = await db.from("players").insert({
    game_id: game.id,
    participant_id: participantId,
    name,
    player_token: makeToken(40),
    total_score: 0,
  }).select("id,name,participant_id,player_token,total_score").single();

  if (error || !player) {
    if (error?.code === "23505") return NextResponse.json({ error: "That participant ID is already in this room. Rejoin using the same ID." }, { status: 409 });
    return NextResponse.json({ error: "Could not join. Please try again." }, { status: 400 });
  }
  return NextResponse.json({ code, player, resumed: false });
}
