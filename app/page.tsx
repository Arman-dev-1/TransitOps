"use client";

import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const capabilities = [
  ["Live dispatch", "See every vehicle, route, and service exception from one operating picture.", "https://img.icons8.com/ios-filled/50/2264de/delivery.png"],
  ["Safer service", "Turn maintenance signals and driver events into fast, accountable action.", "https://img.icons8.com/ios-filled/50/2264de/protection.png"],
  ["Clear decisions", "Give operations, finance, and safety teams their own focused workspace.", "https://img.icons8.com/ios-filled/50/2264de/combo-chart.png"],
];

const testimonials = [
  { name: "Sarah Johnson", role: "Fleet Manager at MetroTransit", text: "Transit Ops has transformed how we manage our fleet. We've reduced maintenance downtime by 35%!", avatar: "SJ" },
  { name: "Mike Chen", role: "Safety Officer at CityLink", text: "The real-time driver tracking and safety alerts have made our operations much safer and more efficient.", avatar: "MC" },
  { name: "Emily Rodriguez", role: "Financial Analyst at TransitCo", text: "The finance dashboard gives us perfect visibility into our costs and helps us make data-driven decisions.", avatar: "ER" },
];

const pricingPlans = [
  { name: "Starter", price: "$49", period: "/month", features: ["Up to 10 vehicles", "Basic tracking", "Email support", "Standard reports"], popular: false },
  { name: "Professional", price: "$149", period: "/month", features: ["Up to 50 vehicles", "Advanced tracking", "Priority support", "Custom reports", "API access"], popular: true },
  { name: "Enterprise", price: "$399", period: "/month", features: ["Unlimited vehicles", "Full feature set", "Dedicated account manager", "Custom integrations", "On-premise option"], popular: false },
];

const faqs = [
  { question: "How long does it take to set up Transit Ops?", answer: "You can get started in less than 10 minutes! Just sign up, add your vehicles, and you're ready to go." },
  { question: "Can I integrate Transit Ops with my existing systems?", answer: "Yes! Our Professional and Enterprise plans include full API access for seamless integration with your existing tools." },
  { question: "Is my data secure?", answer: "Absolutely! We use bank-level encryption, and your data is stored in secure, SOC 2 compliant data centers." },
  { question: "Do you offer a free trial?", answer: "Yes, we offer a 14-day free trial on all plans with no credit card required!" },
];

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link href="/" className="landing-brand"><span>◈</span> Transit Ops</Link>
        <div className="landing-links">
          <a href="#platform">Platform</a>
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <Link href="/login">Sign in</Link>
        </div>
        <Link className="nav-cta" href="/signup">Get started <span>→</span></Link>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow"><i /> REAL-TIME TRANSIT INTELLIGENCE</p>
          <h1>Move your city with <em>confidence.</em></h1>
          <p className="hero-text">Transit Ops brings service delivery, fleet health, and field teams into one calm, connected command center.</p>
          <div className="hero-actions">
            <Link href="/signup" className="primary-cta">Start free trial <span>→</span></Link>
            <Link href="/login" className="secondary-cta">View demo</Link>
          </div>
          <div className="trust-row">
            <span className="trust-avatars">
              <b>SJ</b><b>MC</b><b>ER</b><b>JD</b>
            </span>
            <p>Trusted by 500+ transit teams worldwide</p>
          </div>
        </div>
        <div className="hero-visual" aria-label="Transit network preview">
          <div className="visual-head"><span><i /> Live network</span><small>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div>
          <div className="map-surface">
            <MapContainer center={[40.7128, -74.006]} zoom={13} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[40.7128, -74.006]}>
                <Popup>Central Station</Popup>
              </Marker>
              <Marker position={[40.7306, -73.9352]}>
                <Popup>Airport Terminal 2</Popup>
              </Marker>
              <Marker position={[40.7484, -73.9857]}>
                <Popup>Tech Park</Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="visual-stats">
            <div><small>Service performance</small><strong>Live</strong><span>From your operations data</span></div>
            <div><small>Fleet availability</small><strong>Current</strong><span className="neutral">Real-time updates</span></div>
          </div>
        </div>
      </section>

      <section className="client-strip">
        <span>OPERATIONS, NOT SPREADSHEETS</span>
        <div><b>LIVE VEHICLES</b><b>SMART MAINTENANCE</b><b>SAFETY COMMAND</b><b>ROLE-BASED VIEWS</b><b>API ACCESS</b></div>
      </section>

      <section className="platform" id="platform">
        <div className="section-heading"><p>ONE PLATFORM, EVERY SHIFT</p><h2>From first dispatch<br />to final report.</h2></div>
        <div className="capabilities">{capabilities.map(([title, text, icon], index) => (
          <article key={title}>
            <img src={icon} alt={title} style={{ width: "48px", height: "48px", marginBottom: "16px" }} />
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <Link href="/admin/dashboard">Open workspace <b>→</b></Link>
          </article>
        ))}</div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading" style={{ textAlign: "center" }}>
          <p>POWERFUL FEATURES</p>
          <h2>Everything you need to run your fleet</h2>
        </div>
        <div className="features-grid">
          {[
            { icon: "🗺️", title: "Real-time tracking", desc: "Track all your vehicles in real-time on an interactive map." },
            { icon: "🛠️", title: "Predictive maintenance", desc: "Get alerts before issues become major problems." },
            { icon: "📊", title: "Advanced analytics", desc: "Make data-driven decisions with powerful reports and dashboards." },
            { icon: "👥", title: "Team management", desc: "Manage drivers, dispatchers, and other team members easily." },
            { icon: "📱", title: "Mobile app", desc: "Access Transit Ops from anywhere with our mobile-friendly interface." },
            { icon: "🔗", title: "API integrations", desc: "Connect with your existing tools using our powerful API." },
          ].map((feature, i) => (
            <article key={i} className="feature-card">
              <span style={{ fontSize: "40px" }}>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="role-panel" id="testimonials">
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p>WHAT OUR CUSTOMERS SAY</p>
          <h2 style={{ color: "white" }}>Loved by transit teams everywhere</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, i) => (
            <article key={i} className="testimonial-card">
              <div className="testimonial-avatar"><b>{testimonial.avatar}</b></div>
              <p>"{testimonial.text}"</p>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <small>{testimonial.role}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="section-heading" style={{ textAlign: "center" }}>
          <p>SIMPLE PRICING</p>
          <h2>Choose the perfect plan for your team</h2>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan, i) => (
            <article key={i} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <div className="pricing-price">
                <span>{plan.price}</span>
                <small>{plan.period}</small>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feat, j) => <li key={j}>✓ {feat}</li>)}
              </ul>
              <Link href="/signup" className="pricing-cta">
                {plan.popular ? 'Start free trial' : 'Get started'}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="section-heading" style={{ textAlign: "center" }}>
          <p>FAQ</p>
          <h2>Got questions? We've got answers.</h2>
        </div>
        <div className="faq-container">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaqIndex === i ? 'open' : ''}`}>
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              >
                <span>{faq.question}</span>
                <span style={{ fontSize: "24px" }}>{openFaqIndex === i ? '−' : '+'}</span>
              </button>
              {openFaqIndex === i && <p className="faq-answer">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Link href="/" className="landing-brand"><span>◈</span> Transit Ops</Link>
            <p>Clarity for every mile.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <Link href="#features">Features</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="/admin/dashboard">Dashboard</Link>
            </div>
            <div>
              <h4>Company</h4>
              <Link href="/">About</Link>
              <Link href="/">Blog</Link>
              <Link href="/">Careers</Link>
            </div>
            <div>
              <h4>Support</h4>
              <Link href="#faq">FAQ</Link>
              <Link href="/">Contact</Link>
              <Link href="/">Help Center</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Transit Ops. All rights reserved.</p>
          <div className="footer-legal">
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
