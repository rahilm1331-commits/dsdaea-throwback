import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { makeCode, makeToken } from "@/lib/game";

export async function POST() {
  const db=supabaseAdmin();
  for(let i=0;i<10;i++){
    const code=makeCode(4), token=makeToken(40);
    const {data,error}=await db.from("games").insert({code,host_token:token,status:"lobby",current_round:0}).select("id,code").single();
    if(!error&&data) return NextResponse.json({code,hostToken:token});
  }
  return NextResponse.json({error:"Could not create a unique room. Try again."},{status:500});
}