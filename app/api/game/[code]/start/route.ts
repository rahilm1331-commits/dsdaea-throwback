import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req:Request,{params}:{params:Promise<{code:string}>}) {
  const {code}=await params; const body=await req.json().catch(()=>({})); const token=String(body.hostToken||"");
  const db=supabaseAdmin(); const {data:g,error}=await db.from("games").select("id,host_token,status").eq("code",code.toUpperCase()).single();
  if(error||!g||g.host_token!==token) return NextResponse.json({error:"Host authorization failed."},{status:403});
  if(g.status==="finished") return NextResponse.json({error:"Game is finished."},{status:409});
  const now=new Date().toISOString();
  const {error:ue}=await db.from("games").update({status:"question",current_round:0,question_started_at:now}).eq("id",g.id);
  if(ue) return NextResponse.json({error:ue.message},{status:500});
  return NextResponse.json({ok:true});
}