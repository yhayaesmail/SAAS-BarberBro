import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useFormField, required, minLength, isEmail, isPhone, matchField } from '../../hooks/useFormField.js';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const firstName = useFormField('', [required('First name is required'), minLength(2, 'First name must be at least 2 characters')]);
  const lastName = useFormField('', [required('Last name is required'), minLength(2, 'Last name must be at least 2 characters')]);
  const phone = useFormField('', [required('Phone number is required'), isPhone()]);
  const email = useFormField('', [required(), isEmail()]);
  const password = useFormField('', [required(), minLength(8, 'Password must be at least 8 characters')]);
  const passwordConfirm = useFormField('', [required(), matchField(password.value, 'Passwords do not match')]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = [firstName, lastName, phone, email, password, passwordConfirm].every((f) => !f.validate());
    if (!valid) return;
    setLoading(true);
    try {
      await register({ firstName: firstName.value, lastName: lastName.value, phone: phone.value, email: email.value, password: password.value, passwordConfirm: passwordConfirm.value });
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-row">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={firstName.value} onChange={firstName.onChange} onBlur={firstName.onBlur} placeholder="Ahmed" className={firstName.touched && firstName.error ? 'input-error' : ''} />
                {firstName.touched && firstName.error && <span className="field-error">{firstName.error}</span>}
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={lastName.value} onChange={lastName.onChange} onBlur={lastName.onBlur} placeholder="Hassan" className={lastName.touched && lastName.error ? 'input-error' : ''} />
                {lastName.touched && lastName.error && <span className="field-error">{lastName.error}</span>}
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" type="tel" value={phone.value} onChange={phone.onChange} onBlur={phone.onBlur} placeholder="+20 100 000 0000" className={phone.touched && phone.error ? 'input-error' : ''} />
              {phone.touched && phone.error && <span className="field-error">{phone.error}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={email.value} onChange={email.onChange} onBlur={email.onBlur} placeholder="you@example.com" className={email.touched && email.error ? 'input-error' : ''} />
              {email.touched && email.error && <span className="field-error">{email.error}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={password.value} onChange={password.onChange} onBlur={password.onBlur} placeholder="At least 8 characters" className={password.touched && password.error ? 'input-error' : ''} />
              {password.touched && password.error && <span className="field-error">{password.error}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="passwordConfirm">Confirm Password</label>
              <input id="passwordConfirm" name="passwordConfirm" type="password" value={passwordConfirm.value} onChange={passwordConfirm.onChange} onBlur={passwordConfirm.onBlur} placeholder="Repeat password" className={passwordConfirm.touched && passwordConfirm.error ? 'input-error' : ''} />
              {passwordConfirm.touched && passwordConfirm.error && <span className="field-error">{passwordConfirm.error}</span>}
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
