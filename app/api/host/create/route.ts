import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { makeCode, makeToken } from "@/lib/game";

export async function POST() {
  const db = supabaseAdmin();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const hostToken = makeToken(40);
    const { data, error } = await db.from("games").insert({
      code,
      host_token: hostToken,
      status: "lobby",
      current_round: 0,
      stage: "throwback",
      stage_status: "not_started",
      question_started_at: null,
    }).select("id,code,host_token").single();
    if (!error && data) return NextResponse.json({ code: data.code, hostToken: data.host_token });
  }
  return NextResponse.json({ error: "Could not create a game. Please try again." }, { status: 500 });
}
