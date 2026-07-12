import Link from "next/link";

const capabilities = [
  ["Live dispatch", "See every vehicle, route, and service exception from one operating picture."],
  ["Safer service", "Turn maintenance signals and driver events into fast, accountable action."],
  ["Clear decisions", "Give operations, finance, and safety teams their own focused workspace."],
];

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link href="/" className="landing-brand"><span>◈</span> Transit Ops</Link>
        <div className="landing-links"><a href="#platform">Platform</a><a href="#roles">For teams</a><Link href="/login">Sign in</Link></div>
        <Link className="nav-cta" href="/admin/dashboard">Open command center <span>→</span></Link>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow"><i /> REAL-TIME TRANSIT INTELLIGENCE</p>
          <h1>Move your city with <em>confidence.</em></h1>
          <p className="hero-text">Transit Ops brings service delivery, fleet health, and field teams into one calm, connected command center.</p>
          <div className="hero-actions"><Link href="/admin/dashboard" className="primary-cta">Open command center <span>→</span></Link><Link href="/login" className="secondary-cta">Sign in to Transit Ops</Link></div>
          <div className="trust-row"><span className="trust-avatars"><b>J</b><b>M</b><b>A</b><b>R</b></span><p>Built for the people who keep service moving.</p></div>
        </div>
        <div className="hero-visual" aria-label="Transit network preview">
          <div className="visual-head"><span><i /> Live network</span><small>12:48 PM</small></div>
          <div className="map-surface"><span className="line line-one" /><span className="line line-two" /><span className="line line-three" /><span className="pin pin-one">12</span><span className="pin pin-two">7</span><span className="pin pin-three">24</span><span className="map-label label-one">North terminal</span><span className="map-label label-two">Central interchange</span></div>
          <div className="visual-stats"><div><small>Service performance</small><strong>Live</strong><span>From your operations data</span></div><div><small>Fleet availability</small><strong>Current</strong><span className="neutral">No demo records included</span></div></div>
        </div>
      </section>

      <section className="client-strip"><span>OPERATIONS, NOT SPREADSHEETS</span><div><b>LIVE VEHICLES</b><b>SMART MAINTENANCE</b><b>SAFETY COMMAND</b><b>ROLE-BASED VIEWS</b></div></section>

      <section className="platform" id="platform"><div className="section-heading"><p>ONE PLATFORM, EVERY SHIFT</p><h2>From first dispatch<br />to final report.</h2></div><div className="capabilities">{capabilities.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p><Link href="/admin/dashboard">Open workspace <b>→</b></Link></article>)}</div></section>

      <section className="role-panel" id="roles"><div><p>BUILT AROUND YOUR TEAM</p><h2>The right view<br />for every role.</h2><Link className="primary-cta light" href="/signup">Create your workspace <span>→</span></Link></div><div className="role-list"><Link href="/signup"><span>01</span><b>Drivers</b><i>→</i></Link><Link href="/signup"><span>02</span><b>Financial analysts</b><i>→</i></Link><Link href="/signup"><span>03</span><b>Safety officers</b><i>→</i></Link></div></section>

      <footer className="landing-footer"><Link href="/" className="landing-brand"><span>◈</span> Transit Ops</Link><p>Clarity for every mile.</p><Link href="/login">Sign in →</Link></footer>
    </main>
  );
}
