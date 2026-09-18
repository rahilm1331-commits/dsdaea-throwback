"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Leaderboard, { Player } from "@/components/Leaderboard";
import { EVENTS } from "@/lib/events";
import { GAME_DURATION_SECONDS } from "@/lib/game";

export default function HostGame() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [seconds, setSeconds] = useState(GAME_DURATION_SECONDS);

  async function load() {
    try {
      const r = await fetch(`/api/game/${code}`, { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setGame(d.game);

      const pr = await fetch(`/api/game/${code}/players`, { cache: "no-store" });
      const pd = await pr.json();
      if (pr.ok) setPlayers(pd.players || []);
    } catch (e: any) {
      setErr(e.message || "Unable to load game.");
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("throwback_host");
    if (!raw) {
      router.replace("/host");
      return;
    }

    try {
      const h = JSON.parse(raw);
      if (h.code !== code) {
        router.replace("/host");
        return;
      }
      setToken(h.token);
    } catch {
      router.replace("/host");
      return;
    }

    void load();
    const iv = window.setInterval(() => void load(), 1000);
    return () => window.clearInterval(iv);
  }, [code, router]);

  useEffect(() => {
    if (!game || game.status !== "question" || !game.question_started_at) {
      setSeconds(GAME_DURATION_SECONDS);
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(game.question_started_at).getTime()) / 1000,
      );
      setSeconds(Math.max(0, GAME_DURATION_SECONDS - elapsed));
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timer);
  }, [game?.status, game?.question_started_at, game?.current_round]);

  async function action(path: string) {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`/api/game/${code}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostToken: token }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      await load();
    } catch (e: any) {
      setErr(e.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  const round = game?.current_round ?? 0;
  const ev = EVENTS[round];
  const isLobby = game?.status === "lobby";
  const isFinished = game?.status === "finished";
  const answerRevealed = game?.status === "question" && seconds === 0;

  return (
    <main className="tb-shell">
      <div className="tb-wrap">
        <div className="tb-brand">
          <a className="tb-logo" href="/">
            THROW<span>BACK</span>
          </a>
          <div className="tb-pill">HOST · {code}</div>
        </div>

        <div className="tb-hostgrid">
          <section className="tb-card tb-center">
            <div className="tb-label">GAME CODE</div>
            <div className="tb-code">{code}</div>

            {isLobby ? (
              <>
                <h1 className="tb-title">Waiting for players</h1>
                <div className="tb-stat">{players.length}</div>
                <p className="tb-sub">
                  Players can join at the game URL using this code.
                </p>
                <button
                  className="tb-btn primary big"
                  onClick={() => action("start")}
                  disabled={busy || players.length === 0}
                >
                  {busy ? "STARTING…" : "START GAME"}
                </button>
              </>
            ) : isFinished ? (
              <>
                <div className="tb-finished">GAME OVER</div>
                <p className="tb-sub">Final scores</p>
                <Leaderboard players={players} />
                <a className="tb-btn primary" href="/host">
                  NEW GAME
                </a>
              </>
            ) : (
              <>
                <div className="tb-status">
                  Round {round + 1} / 10 · {game?.status}
                </div>

                <img
                  src={ev.image}
                  alt={ev.description}
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                    background: "#03060c",
                    marginTop: 16,
                    borderRadius: 12,
                  }}
                />

                {/* The event title is always visible on the projector. */}
                <h2 style={{ fontSize: 22, margin: "18px 0 5px" }}>
                  {ev.title}
                </h2>

                {/* The correct year is intentionally hidden during the 30-second
                    guessing window and revealed only when the server-synced timer
                    reaches zero. */}
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 950,
                    color: "var(--accent)",
                    minHeight: 58,
                  }}
                >
                  {answerRevealed ? ev.year : "?"}
                </div>

                <div className="tb-timer" style={{ marginTop: 8 }}>
                  {answerRevealed ? "ANSWER REVEALED" : `${seconds}s`}
                </div>

                <p className="tb-note">
                  {answerRevealed
                    ? "Correct year revealed. Review the leaderboard, then continue to the next round."
                    : "Keep this screen on the projector. The correct year will appear only after the 30-second guessing period."}
                </p>

                {round < 9 ? (
                  <button
                    className="tb-btn primary big"
                    onClick={() => action("next")}
                    disabled={busy || !answerRevealed}
                  >
                    {busy ? "LOADING…" : "NEXT ROUND"}
                  </button>
                ) : (
                  <button
                    className="tb-btn primary big"
                    onClick={() => action("next")}
                    disabled={busy || !answerRevealed}
                  >
                    {busy ? "ENDING…" : "END GAME"}
                  </button>
                )}
              </>
            )}
          </section>

          <aside className="tb-card">
            <Leaderboard players={players} />
            <div style={{ marginTop: 22 }}>
              <h3>Players</h3>
              <div className="tb-players">
                {players.map((p) => (
                  <div className="tb-player" key={p.id}>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
            {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
          </aside>
        </div>

        <div className="tb-card" style={{ marginTop: 18 }}>
          <h3>How to run the event</h3>
          <p className="tb-note">
            1. Put this host page on the projector. 2. Tell everyone to open
            your Vercel URL and choose JOIN A GAME. 3. Display the code above.
            4. Start when everyone is in. 5. The correct year stays hidden for
            30 seconds, then appears automatically. 6. Press NEXT ROUND after
            the answer is revealed.
          </p>
        </div>
      </div>
    </main>
  );
}
