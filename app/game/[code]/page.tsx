"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Leaderboard, { Player } from "@/components/Leaderboard";
import { EVENTS } from "@/lib/events";
import { GAME_DURATION_SECONDS } from "@/lib/game";

type Game = {
  id: string;
  code: string;
  status: "lobby" | "question" | "finished";
  current_round: number;
  question_started_at: string | null;
};

type Event = {
  id: number;
  image: string;
  description: string;
};

type Reveal = {
  correctYear: number;
  guess: number;
  difference: number;
  points: number;
};

const YEARS = [1800, 1900, 1950, 2000, 2026];

function yearPosition(year: number) {
  return ((year - 1800) / (2026 - 1800)) * 100;
}

export default function GamePage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const router = useRouter();

  const [player, setPlayer] = useState<any>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [guess, setGuess] = useState(1900);
  const [seconds, setSeconds] = useState(GAME_DURATION_SECONDS);
  const [locked, setLocked] = useState(false);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const lastRound = useRef(-1);

  const imageUrls = useMemo(() => EVENTS.map((item) => item.image), []);

  async function refresh() {
    try {
      const response = await fetch(`/api/game/${code}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load game.");

      setGame(data.game);
      setEvent(data.event);

      if (data.game.current_round !== lastRound.current) {
        lastRound.current = data.game.current_round;
        setLocked(false);
        setReveal(null);
        setGuess(1900);
        setSeconds(GAME_DURATION_SECONDS);
        setImageReady(false);
      }
    } catch (error: any) {
      setErr(error?.message || "Unable to load game.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPlayers() {
    try {
      const response = await fetch(`/api/game/${code}/players`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setPlayers(data.players || []);
    } catch {
      // Polling failure is non-fatal; the next poll will retry.
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("throwback_player");
    if (!raw) {
      router.replace("/join");
      return;
    }

    try {
      setPlayer(JSON.parse(raw));
    } catch {
      sessionStorage.removeItem("throwback_player");
      router.replace("/join");
      return;
    }

    // Preload every Throwback image immediately. Because all 10 images are local
    // static assets, the browser can cache them before later rounds begin.
    let cancelled = false;
    Promise.all(
      imageUrls.map(
        (src) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = src;
          }),
      ),
    ).then(() => {
      if (!cancelled) setImagesReady(true);
    });

    void refresh();
    void loadPlayers();

    const interval = window.setInterval(() => {
      void refresh();
      void loadPlayers();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [code, router, imageUrls]);

  useEffect(() => {
    if (!game || game.status !== "question" || !game.question_started_at || !imageReady) return;

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(game.question_started_at as string).getTime()) / 1000,
      );
      setSeconds(Math.max(0, GAME_DURATION_SECONDS - elapsed));
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timer);
  }, [game, imageReady]);

  async function submit() {
    if (!player || locked || seconds === 0 || submitting) return;

    setErr("");
    setSubmitting(true);
    setLocked(true);

    try {
      const response = await fetch(`/api/game/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerToken: player.player_token,
          guess,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit answer.");

      setReveal(data);
      void loadPlayers();
    } catch (error: any) {
      setLocked(false);
      setErr(error?.message || "Could not submit answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleImageLoad() {
    setImageReady(true);
  }

  if (loading) {
    return (
      <main className="tb-shell">
        <div className="tb-wrap">
          <div className="tb-card tb-center">Loading game…</div>
        </div>
      </main>
    );
  }

  if (err && !game) {
    return (
      <main className="tb-shell">
        <div className="tb-wrap">
          <div className="tb-card tb-center">{err}</div>
        </div>
      </main>
    );
  }

  const finished = game?.status === "finished";
  const lobby = game?.status === "lobby";

  return (
    <main className="tb-shell">
      <div className="tb-wrap">
        <div className="tb-brand">
          <a className="tb-logo" href="/">
            THROW<span>BACK</span>
          </a>
          <div className="tb-pill">GAME {code}</div>
        </div>

        <div className="tb-game-grid">
          <section className="tb-card tb-question">
            {finished ? (
              <div className="tb-reveal">
                <div className="tb-finished">GAME OVER</div>
                <p className="tb-sub">Final leaderboard</p>
                <Leaderboard players={players} me={player?.id} />
                <a className="tb-btn primary" href="/">
                  RETURN HOME
                </a>
              </div>
            ) : lobby ? (
              <div className="tb-reveal">
                <h1 className="tb-title">You&apos;re in!</h1>
                <div className="tb-code">{code}</div>
                <p className="tb-sub">Waiting for the host to start the game.</p>
                {!imagesReady && <p className="tb-note">Preparing the 10 historical images…</p>}
                {imagesReady && <p className="tb-note">Images ready. You&apos;re good to go!</p>}
                <Leaderboard players={players} me={player?.id} />
              </div>
            ) : event && game ? (
              <>
                <div className="tb-image-frame">
                  {!imageReady && (
                    <div className="tb-image-loading" aria-live="polite">
                      <div className="tb-spinner" />
                      <span>Loading image…</span>
                    </div>
                  )}
                  <img
                    src={event.image}
                    alt={event.description}
                    className={imageReady ? "tb-event-image ready" : "tb-event-image"}
                    onLoad={handleImageLoad}
                  />
                </div>

                <div className="tb-qbody">
                  <div className="tb-round">
                    <span>ROUND {game.current_round + 1} / 10</span>
                    <span className="tb-timer">
                      {imageReady ? `${seconds}s` : "READYING"}
                    </span>
                  </div>

                  {reveal ? (
                    <div className="tb-reveal">
                      <div className="tb-sub">CORRECT YEAR</div>
                      <div className="tb-correct">{reveal.correctYear}</div>
                      <div className="tb-points">+{reveal.points} POINTS</div>
                      <div className="tb-diff">
                        You guessed {reveal.guess} · {reveal.difference} year
                        {reveal.difference === 1 ? "" : "s"} away
                      </div>
                    </div>
                  ) : !imageReady ? (
                    <div className="tb-image-wait">
                      <div className="tb-year">—</div>
                      <p className="tb-hint">Your answer timer will start when the image is ready.</p>
                    </div>
                  ) : (
                    <>
                      <div className="tb-year">{guess}</div>
                      <p className="tb-hint">Place the year on the timeline.</p>

                      <div className="tb-slider-wrap">
                        <input
                          className="tb-slider"
                          type="range"
                          min="1800"
                          max="2026"
                          value={guess}
                          disabled={locked || seconds === 0}
                          onChange={(e) => setGuess(Number(e.target.value))}
                          aria-label="Guess the year"
                        />
                        <div className="tb-scale" aria-hidden="true">
                          {YEARS.map((yearMark) => (
                            <span key={yearMark} style={{ left: `${yearPosition(yearMark)}%` }}>
                              {yearMark}
                            </span>
                          ))}
                        </div>
                      </div>

                      {locked || seconds === 0 ? (
                        <div className="tb-locked">
                          {seconds === 0 ? "TIME'S UP" : submitting ? "ANSWER RECEIVED · CALCULATING…" : "ANSWER LOCKED"}
                        </div>
                      ) : (
                        <button
                          className="tb-btn primary tb-submit"
                          onClick={submit}
                          disabled={submitting}
                        >
                          {submitting ? "LOCKING IN…" : `LOCK IN ${guess}`}
                        </button>
                      )}

                      {err && <div className="tb-error">{err}</div>}
                    </>
                  )}
                </div>
              </>
            ) : null}
          </section>

          <aside className="tb-card tb-side">
            <Leaderboard players={players} me={player?.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
