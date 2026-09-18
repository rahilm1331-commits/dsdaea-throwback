import Link from "next/link";

export default function Home() {
  return <main className="tb-shell"><div className="tb-wrap">
    <div className="tb-brand"><div className="tb-logo">THROW<span>BACK</span></div><div className="tb-pill">AVIATION × SPACE HISTORY</div></div>
    <section className="tb-hero">
      <h1>THROW<span>BACK</span></h1>
      <p>Can you place aviation and spaceflight history on the timeline? See the image. Guess the year. The closer you are, the more you score.</p>
      <div className="tb-actions">
        <Link className="tb-btn primary big" href="/host">HOST A GAME</Link>
        <Link className="tb-btn big" href="/join">JOIN A GAME</Link>
      </div>
    </section>
  </div></main>;
}