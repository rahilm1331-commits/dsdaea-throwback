import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(_: Request,{params}:{params:Promise<{code:string}>}) {
  const {code}=await params; const db=supabaseAdmin();
  const {data:g,error:ge}=await db.from("games").select("id").eq("code",code.toUpperCase()).single();
  if(ge||!g)return NextResponse.json({error:"Game not found."},{status:404});
  const {data,error}=await db.from("players").select("id,name,total_score").eq("game_id",g.id).order("total_score",{ascending:false}).order("joined_at",{ascending:true});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({players:data||[]});
}