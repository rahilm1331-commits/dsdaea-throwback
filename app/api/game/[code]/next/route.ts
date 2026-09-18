import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { EVENTS } from "@/lib/events";

export async function POST(req:Request,{params}:{params:Promise<{code:string}>}) {
  const {code}=await params; const body=await req.json().catch(()=>({})); const token=String(body.hostToken||"");
  const db=supabaseAdmin(); const {data:g,error}=await db.from("games").select("id,host_token,current_round").eq("code",code.toUpperCase()).single();
  if(error||!g||g.host_token!==token) return NextResponse.json({error:"Host authorization failed."},{status:403});
  const next=g.current_round+1;
  if(next>=EVENTS.length){await db.from("games").update({status:"finished"}).eq("id",g.id);return NextResponse.json({finished:true});}
  const {error:ue}=await db.from("games").update({status:"question",current_round:next,question_started_at:new Date().toISOString()}).eq("id",g.id);
  if(ue)return NextResponse.json({error:ue.message},{status:500}); return NextResponse.json({ok:true});
}