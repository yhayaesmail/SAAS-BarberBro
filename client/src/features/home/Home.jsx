import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <p className="hero-label">Premium Barbershop Experience</p>
            <h1 className="hero-title">
              Your Style,{' '}
              <span className="hero-accent">On Your Time</span>
            </h1>
            <p className="hero-desc">
              No more waiting in queues. Book your appointment with the best barbers in town
              in seconds. Walk in, sit down, and leave looking your best.
            </p>
            <div className="hero-actions">
              <Link to="/barbers" className="btn btn-primary btn-lg">Book Your Cut</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Join Free</Link>
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
              <div key={i} className="feature-card card fade-in">
                <div className="feature-num">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-content">
          <h2 className="cta-title">Ready to Transform Your Look?</h2>
          <p className="cta-text">Join thousands of customers who never wait in line again.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
        </div>
      </section>
    </div>
  );
}