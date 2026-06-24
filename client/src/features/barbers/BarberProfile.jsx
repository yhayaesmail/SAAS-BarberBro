import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './BarberProfile.css';

export default function BarberProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    (async () => {
      try { const res = await api.get(`/barbers/${id}`); setBarber(res.data); }
      catch { setBarber(null); } finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    if (!barber || selected.length === 0) { setSlots([]); return; }
    (async () => {
      setSlotsLoading(true);
      try {
        const ids = selected.map((s) => s.id).join(',');
        const res = await api.get(`/barbers/${id}/slots?date=${date}&serviceIds=${ids}`);
        setSlots(res.data);
      } catch { setSlots([]); } finally { setSlotsLoading(false); }
    })();
  }, [barber, selected, date, id]);

  const toggleService = (svc) => {
    setSelected((prev) => prev.find((s) => s.id === svc.id) ? prev.filter((s) => s.id !== svc.id) : [...prev, svc]);
    setSelectedSlot(null);
  };

  const totalDuration = selected.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selected.reduce((sum, s) => sum + Number(s.price), 0);

  if (loading) return <div className="bp-page container-fluid"><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;
  if (!barber) return <div className="bp-page container-fluid"><div className="empty-state"><h3>Barber not found</h3><Link to="/barbers" className="btn btn-outline">Browse Barbers</Link></div></div>;

  return (
    <div className="bp-page container-fluid">
      <div className="bp-header">
        <div className="bp-avatar-lg">{barber.name.charAt(0)}</div>
        <div>
          <h1>{barber.name}</h1>
          <p className="bp-username">@{barber.username}</p>
          <p className="bp-bio">{barber.bio || 'Professional barber'}</p>
          <div className="bp-meta"><span>{barber.phone1}</span>{barber.phone2 && <span>{barber.phone2}</span>}</div>
          <p className="bp-hours">Hours: {barber.startTime} - {barber.endTime}</p>
        </div>
      </div>

      <div className="bp-body">
        <div className="bp-services">
          <h2>Select Services</h2>
          <div className="bp-service-list">
            {(barber.services || []).map((bs) => {
              const svc = { id: bs.service.id, name: bs.service.name, description: bs.service.description, price: bs.price || bs.service.price, duration: bs.duration || bs.service.duration };
              const isSelected = selected.find((s) => s.id === svc.id);
              return (
                <button key={bs.service.id} className={`bp-service-card card ${isSelected ? 'selected' : ''}`} onClick={() => toggleService(svc)}>
                  {isSelected && <span className="bp-check-mark">&#10003;</span>}
                  <div className="bp-card-body"><h4>{bs.service.name}</h4>{bs.service.description && <p>{bs.service.description}</p>}</div>
                  <div className="bp-service-meta"><span className="bp-price">EGP {Number(svc.price).toFixed(0)}</span><span className="bp-duration">{svc.duration} min</span></div>
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div className="bp-date-picker">
              <div className="input-group"><label>Select Date</label><input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }} min={new Date().toISOString().split('T')[0]} /></div>
            </div>
          )}

          {selected.length > 0 && (
            <div className="bp-slots-section">
              <h3>Available Times</h3>
              {slotsLoading ? (
                <div className="bp-slots-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 6 }} />)}</div>
              ) : slots.slots?.length > 0 ? (
                <div className="bp-slots-grid">
                  {slots.slots.filter((s) => s.available).map((slot, i) => (
                    <button key={i} className={`bp-slot-btn ${selectedSlot?.startMin === slot.startMin ? 'selected' : ''}`}
                      onClick={() => {
                        const [h, m] = slot.startTime.split(':').map(Number);
                        const d = new Date(date); d.setHours(h, m, 0, 0);
                        setSelectedSlot({ ...slot, dateTime: d.toISOString() });
                      }}
                    >{slot.startTime}</button>
                  ))}
                </div>
              ) : (
                <p className="bp-no-slots">No available slots for this date.</p>
              )}
            </div>
          )}
        </div>

        <div className="bp-summary card">
          <h3>Reservation Summary</h3>
          {selected.length === 0 ? <p className="bp-summary-empty">Select services to see the summary</p> : (
            <>
              <div className="bp-summary-services">
                {selected.map((s) => <div key={s.id} className="bp-summary-row"><span>{s.name}</span><span>{s.duration} min</span><span>EGP {Number(s.price).toFixed(0)}</span></div>)}
              </div>
              <div className="bp-summary-totals">
                <div className="bp-summary-row"><span>Total Duration</span><strong>{totalDuration} min</strong></div>
                <div className="bp-summary-row"><span>Total Price</span><strong className="bp-total-price">EGP {totalPrice.toFixed(0)}</strong></div>
                {selectedSlot && <div className="bp-summary-row"><span>Selected Time</span><strong>{selectedSlot.startTime}</strong></div>}
              </div>
              {user ? (
                <Link to={`/barbers/${id}/book?services=${selected.map((s) => s.id).join(',')}&slot=${selectedSlot?.dateTime || ''}&duration=${totalDuration}&price=${totalPrice}&date=${date}`}
                  className={`btn btn-primary btn-lg bp-cta ${!selectedSlot ? 'disabled' : ''}`} onClick={(e) => { if (!selectedSlot) e.preventDefault(); }}>Proceed to Checkout</Link>
              ) : (
                <Link to={`/login?redirect=/barbers/${id}`} className="btn btn-primary btn-lg bp-cta">Sign In to Book</Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
