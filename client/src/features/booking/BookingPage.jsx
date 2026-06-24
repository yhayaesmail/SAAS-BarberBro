import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFormField, required, isPhone, isEmail } from '../../hooks/useFormField.js';
import './BookingPage.css';

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const serviceIds = searchParams.get('services')?.split(',').filter(Boolean) || [];
  const selectedSlot = searchParams.get('slot') || '';
  const totalDuration = Number(searchParams.get('duration')) || 0;
  const totalPrice = Number(searchParams.get('price')) || 0;

  useEffect(() => {
    if (serviceIds.length === 0 || !selectedSlot) { setLoadingServices(false); return; }
    (async () => {
      try {
        const res = await api.get(`/barbers/${id}`);
        const barber = res.data;
        const matched = (barber.services || [])
          .filter((bs) => serviceIds.includes(bs.service.id))
          .map((bs) => ({
            id: bs.service.id,
            name: bs.service.name,
            price: bs.price || bs.service.price,
            duration: bs.duration || bs.service.duration,
          }));
        setServices(matched);
      } catch {} finally { setLoadingServices(false); }
    })();
  }, [id, serviceIds, selectedSlot]);

  const phone = useFormField('', [required('Phone number is required'), isPhone()]);
  const customerEmail = useFormField('', [isEmail()]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (serviceIds.length === 0 || !selectedSlot) {
    return (
      <div className="bk-page container-fluid">
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
    phone.validate();
    if (phone.error || !phone.value) return;
    setLoading(true);
    try {
      await api.post('/reservations', {
        barberId: id,
        serviceIds,
        startTime: selectedSlot,
        customerPhone: phone.value,
        customerEmail: customerEmail.value || undefined,
        notes,
      });
      toast.success('Reservation confirmed successfully!');
      navigate('/my-reservations');
    } catch (err) {
      toast.error(err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  if (loadingServices) return <div className="bk-page container-fluid"><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="bk-page container-fluid">
      <h1 className="bk-title">Complete Your Booking</h1>
      <div className="bk-layout">
        <div className="bk-form">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Phone Number *</label>
              <input type="tel" value={phone.value} onChange={phone.onChange} onBlur={phone.onBlur} placeholder="+20 100 000 0000" className={phone.touched && phone.error ? 'input-error' : ''} />
              {phone.touched && phone.error && <span className="field-error">{phone.error}</span>}
            </div>
            <div className="input-group">
              <label>Email (optional)</label>
              <input type="email" value={customerEmail.value} onChange={customerEmail.onChange} onBlur={customerEmail.onBlur} placeholder="you@example.com" className={customerEmail.touched && customerEmail.error ? 'input-error' : ''} />
              {customerEmail.touched && customerEmail.error && <span className="field-error">{customerEmail.error}</span>}
            </div>
            <div className="input-group">
              <label>Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests?" rows={3} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg bk-btn" disabled={loading}>{loading ? <span className="spinner" /> : 'Confirm Reservation'}</button>
          </form>
        </div>
        <div className="bk-summary card">
          <h3>Booking Summary</h3>
          <div className="bk-summary-details">
            <div className="bk-summary-section"><span>Services ({services.length})</span>
              <ul>{services.map((s) => <li key={s.id}>{s.name} <span>{s.duration} min</span></li>)}</ul>
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
