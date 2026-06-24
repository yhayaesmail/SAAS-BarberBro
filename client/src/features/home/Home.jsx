import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
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

const STEPS = [
  {
    num: '01',
    title: 'Find Your Barber',
    desc: 'Browse our curated list of professional barbers. Check their profiles, services, and availability to find the perfect match for your style.',
    highlights: ['View barber profiles', 'Check available services', 'See real-time availability'],
  },
  {
    num: '02',
    title: 'Book Your Slot',
    desc: 'Select your preferred services, pick a time that works for you, and confirm your appointment in seconds. No phone calls, no waiting.',
    highlights: ['Choose multiple services', 'Pick your preferred time', 'Instant confirmation'],
  },
  {
    num: '03',
    title: 'Get Your Cut',
    desc: 'Show up at your scheduled time and enjoy a premium grooming experience. Walk in, sit down, and leave looking your absolute best.',
    highlights: ['No waiting in queues', 'Premium service', 'Pay at the shop'],
  },
];

function ProcessStep({ step, index }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true';
        } else {
          el.removeAttribute('data-visible');
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="process-row" ref={ref}>
      <div className="process-content">
        <span className="process-number">{step.num}</span>
        <h3 className="process-title">{step.title}</h3>
        <p className="process-desc">{step.desc}</p>
        <ul className="process-list">
          {step.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
      <div className="process-card-wrap">
        <div className="process-card gpu">
          <div className="process-card-inner">
            <div className="process-card-icon">
              {index === 0 && (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
              {index === 1 && (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" />
                </svg>
              )}
              {index === 2 && (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" />
                </svg>
              )}
            </div>
            <div className="process-card-lines">
              <div className="process-card-line" />
              <div className="process-card-line" style={{ width: '60%' }} />
              <div className="process-card-line" style={{ width: '40%' }} />
            </div>
            <div className="process-card-label">{step.title}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
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
              {!user && <Link to="/register" className="btn btn-ghost btn-lg">Join Free</Link>}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrap">
              <img src="/hero.jpg" alt="Barbershop" />
            </div>
          </div>
        </div>
      </section>

      <section className="process">
        <div className="container">
          <div className="section-heading">
            <h2>Three Simple Steps</h2>
            <p>From finding your barber to getting the perfect cut</p>
          </div>
          <div className="process-steps">
            {STEPS.map((step, i) => (
              <ProcessStep key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
