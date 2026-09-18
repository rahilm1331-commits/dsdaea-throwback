import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { makeToken } from "@/lib/game";

export async function POST(req:Request,{params}:{params:Promise<{code:string}>}) {
  const {code}=await params; const body=await req.json().catch(()=>({})); const name=String(body.name||"").trim().slice(0,24);
  if(!name) return NextResponse.json({error:"Enter a player name."},{status:400});
  const db=supabaseAdmin(); const {data:g,error:ge}=await db.from("games").select("id,status").eq("code",code.toUpperCase()).single();
  if(ge||!g) return NextResponse.json({error:"Game not found."},{status:404});
  if(g.status!=="lobby") return NextResponse.json({error:"This game has already started."},{status:409});
  const {data:p,error}=await db.from("players").insert({game_id:g.id,name,player_token:makeToken(32),total_score:0}).select("id,name,player_token,total_score").single();
  if(error||!p) return NextResponse.json({error:"Could not join. Try another name."},{status:400});
  return NextResponse.json({code:code.toUpperCase(),player:p});
}