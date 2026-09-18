"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EVENTS } from "@/lib/events";

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      EVENTS.map(
        (event) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = event.image;
          }),
      ),
    ).then(() => {
      if (!cancelled) setAssetsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`/api/game/${code.trim().toUpperCase()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not join.");
      sessionStorage.setItem("throwback_player", JSON.stringify(data.player));
      router.push(`/game/${data.code}`);
    } catch (x: any) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tb-shell">
      <div className="tb-wrap">
        <div className="tb-brand"><a className="tb-logo" href="/">THROW<span>BACK</span></a></div>
        <form className="tb-card tb-form" onSubmit={submit}>
          <h1 className="tb-title">Join a game</h1>
          <p className="tb-sub">Enter the room code shown by the host.</p>
          <div><label className="tb-label">Game code</label><input className="tb-input" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} required placeholder="A7K4" /></div>
          <div><label className="tb-label">Player name</label><input className="tb-input" value={name} onChange={e=>setName(e.target.value.slice(0, 24))} required placeholder="Your name" /></div>
          {!assetsReady && <div className="tb-note">Preparing the 10 historical images…</div>}
          {err && <div style={{color:"var(--danger)"}}>{err}</div>}
          <button className="tb-btn primary" disabled={busy || !assetsReady}>{busy ? "JOINING…" : !assetsReady ? "PREPARING…" : "JOIN GAME"}</button>
        </form>
      </div>
    </main>
  );
}
