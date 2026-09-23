"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EVENTS } from "@/lib/events";

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("throwback_last_identity") || "null");
      if (saved?.participantId) setParticipantId(saved.participantId);
      if (saved?.name) setName(saved.name);
    } catch {}

    let cancelled = false;
    Promise.all(EVENTS.map((event) => new Promise<void>((resolve) => {
      const image = new window.Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = event.image;
    }))).then(() => { if (!cancelled) setAssetsReady(true); });
    return () => { cancelled = true; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const normalizedCode = code.trim().toUpperCase();
      const normalizedId = participantId.trim();
      const res = await fetch(`/api/game/${normalizedCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: normalizedId, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not join.");
      sessionStorage.setItem("throwback_player", JSON.stringify(data.player));
      localStorage.setItem("throwback_last_identity", JSON.stringify({ participantId: data.player.participant_id, name: data.player.name }));
      router.push(`/game/${data.code}`);
    } catch (x: any) {
      setErr(x.message || "Could not join.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tb-shell">
      <div className="tb-wrap">
        <div className="tb-brand"><a className="tb-logo" href="/">AERO<span>QUEST</span></a><div className="tb-pill">3-ROUND AVIATION CHALLENGE</div></div>
        <form className="tb-card tb-form" onSubmit={submit}>
          <div className="tb-kicker">PLAYER LOGIN</div>
          <h1 className="tb-title">Join the challenge</h1>
          <p className="tb-sub">Enter the room code and your participant ID. Your ID is your key to recovering your score if you disconnect.</p>
          <div className="tb-stack">
            <div><label className="tb-label">Game code</label><input className="tb-input" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} required placeholder="A7K4" /></div>
            <div><label className="tb-label">Participant ID / Roll number</label><input className="tb-input" value={participantId} onChange={e => setParticipantId(e.target.value.replace(/\s+/g, "").slice(0, 32))} required placeholder="23ME104" /></div>
            <div><label className="tb-label">Name <span className="tb-optional">(required only the first time)</span></label><input className="tb-input" value={name} onChange={e => setName(e.target.value.slice(0, 40))} placeholder="Your name" /></div>
          </div>
          {!assetsReady && <div className="tb-note" style={{ marginTop: 16 }}>Preparing the Throwback image set…</div>}
          {err && <div className="tb-error" style={{ marginTop: 16 }}>{err}</div>}
          <button className="tb-btn primary" style={{ marginTop: 18, width: "100%" }} disabled={busy || !assetsReady}>{busy ? "CONNECTING…" : !assetsReady ? "PREPARING…" : "JOIN / RESUME"}</button>
        </form>
      </div>
    </main>
  );
}
