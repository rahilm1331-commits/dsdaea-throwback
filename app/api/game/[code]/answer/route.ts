import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { EVENTS } from "@/lib/events";
import { scoreFor } from "@/lib/game";

export async function POST(req:Request,{params}:{params:Promise<{code:string}>}) {
  const {code}=await params; const body=await req.json().catch(()=>({})); const playerToken=String(body.playerToken||""); const guess=Number(body.guess);
  if(!Number.isInteger(guess)||guess<1800||guess>2026)return NextResponse.json({error:"Invalid year."},{status:400});
  const db=supabaseAdmin();
  const {data:p,error:pe}=await db.from("players").select("id,game_id,name,total_score").eq("player_token",playerToken).single();
  if(pe||!p)return NextResponse.json({error:"Player session not found."},{status:401});
  const {data:g,error:ge}=await db.from("games").select("id,code,status,current_round,question_started_at").eq("id",p.game_id).single();
  if(ge||!g||g.code!==code.toUpperCase())return NextResponse.json({error:"Game not found."},{status:404});
  if(g.status!=="question")return NextResponse.json({error:"Answers are not open."},{status:409});
  const ev=EVENTS[g.current_round]; if(!ev)return NextResponse.json({error:"Round not found."},{status:404});
  const started=new Date(g.question_started_at).getTime(); const elapsed=(Date.now()-started)/1000;
  if(elapsed>16)return NextResponse.json({error:"Time is up."},{status:409});
  const {data:existing}=await db.from("answers").select("id").eq("player_id",p.id).eq("round",g.current_round).maybeSingle();
  if(existing)return NextResponse.json({error:"You already answered."},{status:409});
  const points=scoreFor(guess,ev.year);
  const {error:ae}=await db.from("answers").insert({game_id:g.id,player_id:p.id,round:g.current_round,guessed_year:guess,correct_year:ev.year,points});
  if(ae)return NextResponse.json({error:ae.message},{status:500});
  const {error:ue}=await db.from("players").update({total_score:p.total_score+points}).eq("id",p.id);
  if(ue)return NextResponse.json({error:ue.message},{status:500});
  return NextResponse.json({points,correctYear:ev.year,guess,difference:Math.abs(guess-ev.year),title:ev.title});
}