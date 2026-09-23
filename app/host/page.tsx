"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Host() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function create() {
    setBusy(true); setErr("");
    try { const res = await fetch("/api/host/create", { method: "POST" }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not create game."); sessionStorage.setItem("throwback_host", JSON.stringify({ code: data.code, token: data.hostToken })); router.push(`/host/${data.code}`); }
    catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }
  return <main className="tb-shell"><div className="tb-wrap"><div className="tb-brand"><a className="tb-logo" href="/">AERO<span>QUEST</span></a></div><div className="tb-card tb-form tb-center"><div className="tb-kicker">EVENT CONTROL</div><h1 className="tb-title">Host the challenge</h1><p className="tb-sub">Create one room for all three rounds. Put the host screen on the projector; participants join on their own devices.</p><div className="tb-round-cards host-rounds"><div className="round-mini throwback-mini"><b>01</b><strong>THROWBACK</strong><span>10 timeline questions</span></div><div className="round-mini ascension-mini"><b>02</b><strong>ASCENSION</strong><span>10 flight-science questions</span></div><div className="round-mini ignition-mini"><b>03</b><strong>IGNITION</strong><span>10 propulsion questions</span></div></div><button className="tb-btn primary big" onClick={create} disabled={busy}>{busy ? "CREATING…" : "CREATE EVENT"}</button>{err && <p className="tb-error">{err}</p>}</div></div></main>;
}
