import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const db = supabaseAdmin();
  const { data: game, error: gameError } = await db.from("games").select("id").eq("code", code).single();
  if (gameError || !game) return NextResponse.json({ error: "Game not found." }, { status: 404 });

  const { data, error } = await db.from("players")
    .select("id,name,participant_id,total_score")
    .eq("game_id", game.id)
    .order("total_score", { ascending: false })
    .order("joined_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { players: data || [] },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=2, stale-while-revalidate=5" } }
  );
}
