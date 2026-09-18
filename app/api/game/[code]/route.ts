import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { EVENTS } from "@/lib/events";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; const db=supabaseAdmin();
  const { data:g,error }=await db.from("games").select("id,code,status,current_round,question_started_at,created_at").eq("code",code.toUpperCase()).single();
  if(error||!g) return NextResponse.json({error:"Game not found."},{status:404});
  const ev=EVENTS[g.current_round] ?? null;
  return NextResponse.json({game:g,event:ev?{id:ev.id,image:ev.image,description:ev.description}:null});
}