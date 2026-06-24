import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useFormField, required, isEmail } from '../../hooks/useFormField.js';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const email = useFormField('', [required(), isEmail()]);
  const password = useFormField('', [required()]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    email.validate();
    password.validate();
    if (email.error || password.error) return;
    if (!email.value || !password.value) return;
    setLoading(true);
    try {
      const result = await login(email.value, password.value);
      toast.success('Login successful');
      navigate(result.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-heading">
            <h1>Welcome Back</h1>
            <p>Sign in to your KM-BARBER account</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={email.value} onChange={email.onChange} onBlur={email.onBlur} placeholder="you@example.com" className={email.touched && email.error ? 'input-error' : ''} />
              {email.touched && email.error && <span className="field-error">{email.error}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={password.value} onChange={password.onChange} onBlur={password.onBlur} placeholder="Enter your password" className={password.touched && password.error ? 'input-error' : ''} />
              {password.touched && password.error && <span className="field-error">{password.error}</span>}
              <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>
          <p className="auth-alt">Don&apos;t have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
      <div className="auth-visual-panel">
        <div className="auth-visual-inner">
          <h2 className="auth-visual-title">
            <span className="auth-visual-accent">Premium</span> Grooming,<br /> Zero Waiting
          </h2>
          <p className="auth-visual-desc">
            Join thousands of customers who book their appointments in seconds.
            No queues, no hassle — just premium barber services at your fingertips.
          </p>
          <div className="auth-visual-list">
            {['Book appointments 24/7', 'Choose from top-rated barbers', 'Manage reservations online', 'No more waiting in queues'].map((item, i) => (
              <div key={i} className="auth-visual-item"><span className="auth-check">&#10003;</span>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
