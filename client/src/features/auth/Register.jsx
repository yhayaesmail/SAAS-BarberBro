import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', passwordConfirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-heading">
            <h1>Create Account</h1>
            <p>Join KM-BARBER and book your next cut</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-row">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ahmed" required />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Hassan" required />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+20 100 000 0000" required />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" required />
            </div>
            <div className="input-group">
              <label htmlFor="passwordConfirm">Confirm Password</label>
              <input id="passwordConfirm" name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} placeholder="Repeat password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>
          <p className="auth-alt">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
      <div className="auth-visual-panel">
        <div className="auth-visual-inner">
          <h2 className="auth-visual-title">
            <span className="auth-visual-accent">Join</span> the Experience<br />Book Smarter
          </h2>
          <p className="auth-visual-desc">
            Create your account in seconds and start booking appointments with the best barbers in your area.
          </p>
          <div className="auth-visual-list">
            {['Free registration', 'Instant booking confirmation', 'Manage all reservations', 'Exclusive offers & rewards'].map((item, i) => (
              <div key={i} className="auth-visual-item"><span className="auth-check">&#10003;</span>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
