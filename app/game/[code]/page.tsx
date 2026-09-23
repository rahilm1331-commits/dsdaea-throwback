"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Leaderboard, { Player } from "@/components/Leaderboard";
import { EVENTS } from "@/lib/events";
import { GAME_DURATION_SECONDS } from "@/lib/game";
import { ROUND_DEFINITIONS, RoundKey } from "@/lib/rounds";

type Game = {
  id: string; code: string; status: "lobby" | "question" | "finished"; current_round: number;
  question_started_at: string | null; stage: RoundKey; stage_status: "not_started" | "question" | "finished";
};

type Content =
  | { type: "throwback"; id: number; title: string; image: string; description: string }
  | { type: "quiz"; id: number; question: string; options: string[] };

type Reveal =
  | { type: "throwback"; correctYear: number; title: string }
  | { type: "quiz"; correctOption: number; correctText: string; explanation: string };

type MyAnswer = { points: number; guessedYear: number | null; selectedOption: number | null };
const YEARS = [1800, 1900, 1950, 2000, 2026];
function yearPosition(year: number) { return ((year - 1800) / 226) * 100; }

export default function GamePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [myAnswer, setMyAnswer] = useState<MyAnswer | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [guess, setGuess] = useState(1900);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(GAME_DURATION_SECONDS);
  const [loading, setLoading] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const lastRound = useRef(-1);
  const imageUrls = useMemo(() => EVENTS.map(e => e.image), []);

  async function refresh() {
    try {
      const response = await fetch(`/api/game/${code}`, { cache: "no-store", headers: player?.player_token ? { "x-player-token": player.player_token } : {} });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load game.");
      setGame(data.game); setContent(data.content); setReveal(data.reveal); setMyAnswer(data.myAnswer);
      if (data.game.current_round !== lastRound.current) {
        lastRound.current = data.game.current_round;
        setGuess(1900); setSelected(null); setSubmitting(false); setImageReady(false); setSeconds(GAME_DURATION_SECONDS);
        void refreshLeaderboard();
      }
    } catch (error: any) { setErr(error?.message || "Unable to load game."); }
    finally { setLoading(false); }
  }

  async function refreshLeaderboard() {
    try {
      const response = await fetch(`/api/game/${code}/leaderboard`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load leaderboard.");
      setPlayers(data.players || []);
    } catch (error: any) { setErr(error?.message || "Unable to load leaderboard."); }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("throwback_player");
    if (!raw) { router.replace("/join"); return; }
    try { setPlayer(JSON.parse(raw)); } catch { sessionStorage.removeItem("throwback_player"); router.replace("/join"); return; }
    let cancelled = false;
    Promise.all(imageUrls.map(src => new Promise<void>(resolve => { const image = new window.Image(); image.onload = () => resolve(); image.onerror = () => resolve(); image.src = src; }))).then(() => { if (!cancelled) setImagesReady(true); });
    return () => { cancelled = true; };
  }, [code, router, imageUrls]);

  useEffect(() => { if (player) { void refresh(); void refreshLeaderboard(); } }, [player]);
  useEffect(() => {
    if (!player) return;
    const iv = window.setInterval(() => void refresh(), 2500);
    const lb = window.setInterval(() => void refreshLeaderboard(), 5000);
    return () => { window.clearInterval(iv); window.clearInterval(lb); };
  }, [player, code]);

  useEffect(() => {
    if (!game || game.status !== "question" || !game.question_started_at) return;
    const duration = game.stage === "throwback" ? 30 : 30;
    const update = () => setSeconds(Math.max(0, duration - Math.floor((Date.now() - new Date(game.question_started_at as string).getTime()) / 1000)));
    update(); const timer = window.setInterval(update, 250); return () => window.clearInterval(timer);
  }, [game?.status, game?.question_started_at, game?.current_round, game?.stage]);

  async function submitAnswer(answer: number) {
    if (!player || submitting || myAnswer || seconds === 0 || game?.status !== "question") return;
    setErr(""); setSubmitting(true); setSelected(answer);
    try {
      const response = await fetch(`/api/game/${code}/answer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerToken: player.player_token, answer }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit answer.");
      setMyAnswer({ points: data.points, guessedYear: game.stage === "throwback" ? answer : null, selectedOption: game.stage === "throwback" ? null : answer });
      void refreshLeaderboard();
    } catch (error: any) { setSelected(null); setErr(error?.message || "Could not submit answer."); }
    finally { setSubmitting(false); }
  }

  if (loading) return <main className="tb-shell"><div className="tb-wrap"><div className="tb-card tb-center">Connecting to event…</div></div></main>;
  if (err && !game) return <main className="tb-shell"><div className="tb-wrap"><div className="tb-card tb-center">{err}</div></div></main>;

  const stage = game?.stage || "throwback";
  const currentRound = game?.current_round ?? 0;
  const def = ROUND_DEFINITIONS[stage];
  const isQuestion = game?.status === "question" && game.stage_status === "question";
  const isLobby = game?.status === "lobby" || game?.stage_status === "not_started";
  const expired = seconds === 0;
  const showReveal = Boolean(reveal);
  const answered = Boolean(myAnswer);

  return <main className={`tb-shell ${def.themeClass}`}>
    <div className="tb-wrap">
      <div className="tb-brand"><a className="tb-logo" href="/">AERO<span>QUEST</span></a><div className="tb-pill">{def.name} · {code}</div></div>
      <div className="tb-game-grid">
        <section className="tb-card tb-question">
          {game?.status === "finished" ? <div className="tb-reveal"><div className="tb-kicker">EVENT COMPLETE</div><div className="tb-finished">FINAL LEADERBOARD</div><Leaderboard players={players} me={player?.id} /><a className="tb-btn primary" href="/">RETURN HOME</a></div> : isLobby ? <div className="tb-reveal"><div className="round-number">ROUND {stage === "throwback" ? "01" : stage === "ascension" ? "02" : "03"}</div><h1 className="tb-title">{def.name}</h1><p className="tb-sub">{def.subtitle}</p><div className="tb-wait">WAITING FOR HOST</div><p className="tb-note">Stay on this screen. Your score is saved to <strong>{player?.participant_id}</strong>, so you can reconnect with the same ID if your connection drops.</p><Leaderboard players={players} me={player?.id} /></div> : content ? <>
            {content.type === "throwback" ? <>
              <div className="tb-image-frame">{!imageReady && <div className="tb-image-loading"><div className="tb-spinner"/><span>Loading image…</span></div>}<img src={content.image} alt={content.description} className={imageReady ? "tb-event-image ready" : "tb-event-image"} onLoad={() => setImageReady(true)} /></div>
              <div className="tb-qbody">
                <div className="tb-round"><span>THROWBACK · {currentRound + 1} / 10</span><span className="tb-timer">{imageReady ? `${seconds}s` : "READYING"}</span></div>
                {showReveal ? <RevealBlock reveal={reveal!} myAnswer={myAnswer} /> : answered || expired ? <div className="tb-locked">{expired ? "TIME'S UP · WAITING FOR REVEAL" : "ANSWER LOCKED"}</div> : <><div className="tb-year">{guess}</div><p className="tb-hint">Place the year on the timeline.</p><div className="tb-slider-wrap"><input className="tb-slider" type="range" min="1800" max="2026" value={guess} disabled={!isQuestion || submitting} onChange={e => setGuess(Number(e.target.value))}/><div className="tb-scale">{YEARS.map(y => <span key={y} style={{left:`${yearPosition(y)}%`}}>{y}</span>)}</div></div><button className="tb-btn primary tb-submit" disabled={submitting || !isQuestion || seconds === 0} onClick={() => submitAnswer(guess)}>{submitting ? "LOCKING IN…" : `LOCK IN ${guess}`}</button></>}
                {err && <div className="tb-error">{err}</div>}
              </div>
            </> : <div className="quiz-body">
              <div className="tb-round"><span>{def.name} · {currentRound % 10 + 1} / 10</span><span className="tb-timer">{seconds}s</span></div>
              <div className="quiz-question-number">QUESTION {currentRound % 10 + 1}</div>
              <h1 className="quiz-question">{content.question}</h1>
              <div className="quiz-options">{content.options.map((option, index) => <button key={option} className={`quiz-option ${selected === index ? "selected" : ""} ${answered ? "answered" : ""}`} disabled={!isQuestion || answered || submitting || seconds === 0} onClick={() => submitAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
              {showReveal ? <RevealBlock reveal={reveal!} myAnswer={myAnswer} selected={selected}/>: answered || expired ? <div className="tb-locked">{expired ? "TIME'S UP · ANSWER REVEALING…" : "ANSWER LOCKED · WAIT FOR REVEAL"}</div> : <p className="tb-note quiz-hint">Choose one answer. Faster correct answers score more points.</p>}
              {err && <div className="tb-error">{err}</div>}
            </div>}
          </> : null}
        </section>
        <aside className="tb-card tb-side"><div className="round-side-badge">{def.name}</div><Leaderboard players={players} me={player?.id}/><div className="tb-note side-note">Your cumulative score carries through all three rounds.</div></aside>
      </div>
    </div>
  </main>;
}

function RevealBlock({ reveal, myAnswer, selected }: { reveal: Reveal; myAnswer: MyAnswer | null; selected?: number | null }) {
  if (reveal.type === "throwback") return <div className="tb-reveal"><div className="tb-sub">CORRECT YEAR</div><div className="tb-correct">{reveal.correctYear}</div>{myAnswer ? <><div className="tb-points">+{myAnswer.points} POINTS</div><div className="tb-diff">You guessed {myAnswer.guessedYear}</div></> : <div className="tb-diff">No answer submitted.</div>}</div>;
  const chosen = myAnswer?.selectedOption ?? selected ?? null;
  const correct = chosen === reveal.correctOption;
  return <div className="quiz-reveal"><div className="tb-sub">CORRECT ANSWER</div><div className="quiz-correct">{String.fromCharCode(65 + reveal.correctOption)} · {reveal.correctText}</div><p>{reveal.explanation}</p><div className={correct ? "tb-points" : "tb-diff"}>{myAnswer ? (correct ? `+${myAnswer.points} POINTS` : "0 POINTS") : "No answer submitted."}</div></div>;
}
