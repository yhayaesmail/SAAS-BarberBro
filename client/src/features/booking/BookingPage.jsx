import { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import './BookingPage.css';

export default function BookingPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedServices, selectedSlot, totalDuration, totalPrice } = state || {};

  const [form, setForm] = useState({ customerPhone: '', customerEmail: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!selectedServices || !selectedSlot) {
    return (
      <div className="bk-page container">
        <div className="empty-state">
          <h3>No booking information found</h3>
          <p>Please select a barber and services first.</p>
          <button className="btn btn-primary" onClick={() => navigate(`/barbers/${id}`)}>Go Back</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/reservations', {
        barberId: id,
        serviceIds: selectedServices.map((s) => s.id),
        startTime: selectedSlot,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || undefined,
        notes: form.notes,
      });
      navigate('/my-reservations', { state: { message: 'Reservation confirmed successfully!' } });
    } catch (err) {
      setError(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bk-page container">
      <h1 className="bk-title">Complete Your Booking</h1>
      <div className="bk-layout">
        <div className="bk-form">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group"><label>Phone Number *</label><input type="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="+20 100 000 0000" required /></div>
            <div className="input-group"><label>Email (optional)</label><input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="you@example.com" /></div>
            <div className="input-group"><label>Notes (optional)</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special requests?" rows={3} /></div>
            <button type="submit" className="btn btn-primary btn-lg bk-btn" disabled={loading}>{loading ? <span className="spinner" /> : 'Confirm Reservation'}</button>
          </form>
        </div>
        <div className="bk-summary card">
          <h3>Booking Summary</h3>
          <div className="bk-summary-details">
            <div className="bk-summary-section"><span>Services ({selectedServices.length})</span>
              <ul>{selectedServices.map((s) => <li key={s.id}>{s.name} <span>{s.duration} min</span></li>)}</ul>
            </div>
            <div className="bk-summary-row"><span>Total Duration</span><strong>{totalDuration} min</strong></div>
            <div className="bk-summary-row"><span>Total Price</span><strong className="bk-price">EGP {Number(totalPrice).toFixed(0)}</strong></div>
            <div className="bk-summary-row"><span>Appointment Time</span><strong>{new Date(selectedSlot).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
