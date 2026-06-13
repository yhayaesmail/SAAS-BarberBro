import { Link } from 'react-router-dom';
import './Home.css';

function waveD(y, amp, dir) {
  const a = amp * dir;
  return `M0,${y} C180,${y - a} 360,${y + a * 0.6} 540,${y} C720,${y - a * 0.8} 900,${y + a} 1200,${y}`;
}

const WAVES = Array.from({ length: 12 }, (_, i) => ({
  y: 30 + i * 62,
  amp: 70 + (i % 3) * 20,
  dir: i % 2 === 0 ? -1 : 1,
  w: 1.2 + (i % 5) * 0.8,
  o: 0.12 + (i % 4) * 0.07,
}));

function WaveSVG({ color }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {WAVES.map((w, i) => (
        <path
          key={i}
          d={waveD(w.y, w.amp, w.dir)}
          fill="none"
          stroke={color}
          strokeWidth={w.w}
          opacity={w.o}
        />
      ))}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-dark" />
        <div className="hero-green" />

        <div className="hero-waves" aria-hidden="true">
          <div className="wave-side wave-left">
            <div className="wave-track gpu">
              <WaveSVG color="rgba(255,255,255,0.7)" />
              <WaveSVG color="rgba(255,255,255,0.7)" />
            </div>
          </div>
          <div className="wave-side wave-right">
            <div className="wave-track gpu">
              <WaveSVG color="rgba(0,0,0,0.55)" />
              <WaveSVG color="rgba(0,0,0,0.55)" />
            </div>
          </div>
        </div>

        <div className="hero-content container">
          <div className="hero-text">
            <p className="hero-label">Premium Barbershop Experience</p>
            <h1 className="hero-title">
              <span className="hero-title-main">Your Style,</span>{' '}
              <span className="hero-accent">On Your Time</span>
            </h1>
            <p className="hero-desc">
              No more waiting in queues. Book your appointment with the best barbers in town
              in seconds. Walk in, sit down, and leave looking your best.
            </p>
            <div className="hero-actions">
              <Link to="/barbers" className="btn-hero-cta">
                <span>Book Your Cut</span>
                <span className="cta-circle">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
              <Link to="/register" className="btn btn-ghost btn-lg">Join Free</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrap">
              <img src="/hero.jpg" alt="Barbershop" />
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-heading">
            <h2>Feel Your Smooth Salon Experience</h2>
            <p>Three simple steps to get the perfect cut</p>
          </div>
          <div className="features-grid">
            {[
              { num: '01', title: 'Find Your Barber', desc: 'Browse our curated list of professional barbers. Check their profiles, services, and availability.' },
              { num: '02', title: 'Book Your Slot', desc: 'Select your services, pick a time that works for you, and confirm your appointment instantly.' },
              { num: '03', title: 'Get Your Cut', desc: 'Show up at your scheduled time and enjoy a premium grooming experience. No waiting, no hassle.' },
            ].map((f, i) => (
              <div key={i} className="feature-card fade-in">
                <div className="feature-num">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-glow gpu" />
        <div className="cta-ring gpu" />
        <div className="container cta-content">
          <div className="cta-top">
            <h2 className="cta-title">Ready to Transform Your Look?</h2>
            <p className="cta-text">Skip the queue. Book your barber in seconds and get the perfect cut, every time.</p>
          </div>
          <div className="cta-bottom">
            <Link to="/register" className="btn btn-white btn-lg cta-btn">Get Started Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
