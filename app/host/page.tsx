 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Host() {
  const router=useRouter(); const [busy,setBusy]=useState(false); const [err,setErr]=useState("");
  async function create(){setBusy(true);setErr("");try{const res=await fetch("/api/host/create",{method:"POST"});const data=await res.json();if(!res.ok)throw new Error(data.error||"Could not create game.");sessionStorage.setItem("throwback_host",JSON.stringify({code:data.code,token:data.hostToken}));router.push(`/host/${data.code}`)}catch(x:any){setErr(x.message)}finally{setBusy(false)}}
  return <main className="tb-shell"><div className="tb-wrap"><div className="tb-brand"><a className="tb-logo" href="/">THROW<span>BACK</span></a></div><div className="tb-card tb-form tb-center"><h1 className="tb-title">Host a game</h1><p className="tb-sub">Create a room and put the game code on the big screen. Players join from their phones.</p><button className="tb-btn primary big" onClick={create} disabled={busy}>{busy?"CREATING…":"CREATE GAME"}</button>{err&&<p style={{color:"var(--danger)"}}>{err}</p>}</div></div></main>;
}