"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Leaderboard, { Player } from "@/components/Leaderboard";
import { EVENTS } from "@/lib/events";
import { GAME_DURATION_SECONDS } from "@/lib/game";
import { ASCENSION_QUESTIONS, IGNITION_QUESTIONS, RoundKey, ROUND_DEFINITIONS } from "@/lib/rounds";

type Game = { id: string; code: string; status: "lobby" | "question" | "finished"; current_round: number; question_started_at: string | null; stage: RoundKey; stage_status: "not_started" | "question" | "finished" };

type Content = any;
type Reveal = any;

export default function HostGame() {
  const { code } = useParams<{ code: string }>(); const router = useRouter();
  const [token, setToken] = useState(""); const [game, setGame] = useState<Game | null>(null); const [players, setPlayers] = useState<Player[]>([]); const [content, setContent] = useState<Content>(null); const [reveal, setReveal] = useState<Reveal>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [seconds, setSeconds] = useState(GAME_DURATION_SECONDS);

  async function load() {
    try {
      const r = await fetch(`/api/game/${code}`, { cache: "no-store", headers: token ? { "x-host-token": token } : {} }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to load game.");
      setGame(d.game); setContent(d.content); setReveal(d.reveal); setPlayers(d.players || []);
    } catch (e: any) { setErr(e.message || "Unable to load game."); }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("throwback_host"); if (!raw) { router.replace("/host"); return; }
    try { const h = JSON.parse(raw); if (h.code !== code) { router.replace("/host"); return; } setToken(h.token); } catch { router.replace("/host"); return; }
  }, [code, router]);

  useEffect(() => {
    if (!token) return;
    void load();
    const iv = window.setInterval(() => void load(), 2000);
    return () => window.clearInterval(iv);
  }, [token, code]);

  useEffect(() => {
    if (!game?.question_started_at || game.stage_status !== "question") { setSeconds(GAME_DURATION_SECONDS); return; }
    const update = () => setSeconds(Math.max(0, GAME_DURATION_SECONDS - Math.floor((Date.now() - new Date(game.question_started_at as string).getTime()) / 1000)));
    update(); const timer = window.setInterval(update, 250); return () => window.clearInterval(timer);
  }, [game?.question_started_at, game?.stage_status, game?.current_round]);

  async function action(path: "start" | "next") {
    setBusy(true); setErr("");
    try { const r = await fetch(`/api/game/${code}/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hostToken: token }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Action failed."); await load(); }
    catch (e: any) { setErr(e.message || "Action failed."); } finally { setBusy(false); }
  }

  const stage = game?.stage || "throwback"; const def = ROUND_DEFINITIONS[stage]; const q = game?.current_round ? game.current_round % 10 : 0; const isQuestion = game?.status === "question" && game.stage_status === "question"; const expired = seconds === 0; const lastQuestion = q === 9;
  const roundQuestions = stage === "ascension" ? ASCENSION_QUESTIONS : IGNITION_QUESTIONS;
  const quizQuestion = stage === "throwback" ? null : roundQuestions[q];
  const finished = game?.status === "finished";
  const waitingToStart = game?.status === "lobby" && game?.stage_status === "not_started";

  return <main className={`tb-shell ${def.themeClass}`}>
    <div className="tb-wrap">
      <div className="tb-brand"><a className="tb-logo" href="/">AERO<span>QUEST</span></a><div className="tb-pill">HOST · {code} · {def.name}</div></div>
      <div className="tb-hosttop"><div><div className="tb-label">PARTICIPANTS</div><div className="host-count">{players.length}</div></div><div><div className="tb-label">CUMULATIVE LEADERBOARD</div><div className="tb-note">Scores carry across all 30 questions.</div></div><div className="host-code-small"><span>ROOM</span><strong>{code}</strong></div></div>
      <div className="tb-hostgrid">
        <section className="tb-card host-main">
          {finished ? <><div className="tb-kicker">EVENT COMPLETE</div><h1 className="tb-finished">FINAL LEADERBOARD</h1><Leaderboard players={players}/><a className="tb-btn primary big" href="/host">NEW EVENT</a></> : waitingToStart ? <><div className="round-number">ROUND {stage === "throwback" ? "01" : stage === "ascension" ? "02" : "03"}</div><h1 className="tb-title">{def.name}</h1><p className="tb-sub">{def.subtitle}</p><div className="tb-wait">{stage === "throwback" ? "READY TO BEGIN" : "READY FOR NEXT ROUND"}</div><p className="tb-note">The leaderboard is preserved. Start this round only when the room is ready.</p><button className="tb-btn primary big" onClick={() => action("start")} disabled={busy || players.length === 0}>{busy ? "STARTING…" : `START ${def.name}`}</button></> : isQuestion && content ? <>
            <div className="tb-round"><span>{def.name} · QUESTION {q + 1} / 10</span><span className="tb-timer">{expired ? "TIME'S UP" : `${seconds}s`}</span></div>
            {content.type === "throwback" ? <><img src={content.image} alt={content.description} className="host-event-image"/><h1 className="host-event-title">{content.title}</h1><div className="host-answer">{reveal ? reveal.correctYear : "?"}</div></> : <><div className="quiz-question-number">QUESTION {q + 1}</div><h1 className="quiz-question host-question">{content.question}</h1><div className="host-options">{content.options.map((option: string, i: number) => <div className={`host-option ${reveal && i === reveal.correctOption ? "correct" : ""}`} key={option}><span>{String.fromCharCode(65 + i)}</span>{option}</div>)}</div>{reveal && <div className="quiz-reveal host-reveal"><strong>CORRECT: {reveal.correctText}</strong><p>{reveal.explanation}</p></div>}</>}
            <div className="host-controls"><div className="tb-note">{reveal ? "Answer revealed. Review the leaderboard, then advance." : "The answer stays hidden until the 30-second timer ends."}</div><button className="tb-btn primary big" onClick={() => action("next")} disabled={busy || !expired}>{busy ? "MOVING…" : lastQuestion ? (stage === "ignition" ? "END IGNITION" : `FINISH ${def.name}`) : "NEXT QUESTION"}</button></div>
          </> : null}
          {err && <div className="tb-error">{err}</div>}
        </section>
        <aside className="tb-card host-side"><Leaderboard players={players}/><div style={{marginTop:22}}><h3>Players</h3><div className="tb-players">{players.map(p => <div className="tb-player" key={p.id}><strong>{p.name}</strong><small>{p.participant_id || "legacy"}</small></div>)}</div></div></aside>
      </div>
    </div>
  </main>;
}
