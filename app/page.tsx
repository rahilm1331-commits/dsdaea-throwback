import Link from "next/link";

export default function Home() {
  return <main className="tb-shell home-shell"><div className="tb-wrap">
    <div className="tb-brand"><div className="tb-logo">AERO<span>QUEST</span></div><div className="tb-pill">AVIATION × SPACE CHALLENGE</div></div>
    <section className="tb-hero">
      <div className="tb-kicker">ONE WEBSITE · THREE ROUNDS · ONE LEADERBOARD</div>
      <h1>READY FOR<br/><span>FLIGHT?</span></h1>
      <p>History. Aerodynamics. Propulsion. Three live rounds designed for a room full of competitors.</p>
      <div className="tb-round-cards">
        <div className="round-mini throwback-mini"><b>01</b><strong>THROWBACK</strong><span>Place aviation history on the timeline.</span></div>
        <div className="round-mini ascension-mini"><b>02</b><strong>ASCENSION</strong><span>Test the science of fixed-wing flight.</span></div>
        <div className="round-mini ignition-mini"><b>03</b><strong>IGNITION</strong><span>Test aircraft & rocket propulsion.</span></div>
      </div>
      <div className="tb-actions">
        <Link className="tb-btn primary big" href="/host">HOST EVENT</Link>
        <Link className="tb-btn big" href="/join">JOIN EVENT</Link>
      </div>
    </section>
  </div></main>;
}
