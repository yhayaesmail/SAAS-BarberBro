import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../api/client.js';
import './MyReservations.css';

export default function MyReservations() {
  const { state } = useLocation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(state?.message || '');

  useEffect(() => {
    (async () => {
      try { const res = await api.get('/reservations/mine'); setReservations(res.data); }
      catch { setReservations([]); } finally { setLoading(false); }
    })();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'CANCELLED' } : r));
      setMessage('Reservation cancelled');
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="rs-page container-fluid"><h1 className="rs-title">My Reservations</h1><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="rs-page container-fluid">
      <h1 className="rs-title">My Reservations</h1>
      {message && <div className="success-message">{message}</div>}
      {reservations.length === 0 ? (
        <div className="empty-state"><h3>No reservations yet</h3><p>Book your first appointment today.</p></div>
      ) : (
        <div className="rs-list">
          {reservations.map((r) => (
            <div key={r.id} className={`rs-card card ${r.status === 'CANCELLED' ? 'cancelled' : ''}`}>
              <div className="rs-card-header">
                <span className={`rs-status rs-${r.status.toLowerCase()}`}>{r.status}</span>
                <span className="rs-date">{new Date(r.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="rs-card-body">
                <div className="rs-barber">
                  <div className="rs-avatar">{r.barber?.name?.charAt(0) || 'B'}</div>
                  <div>
                    <h3>{r.barber?.name || 'Barber'}</h3>
                    <p className="rs-time">{new Date(r.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(r.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="rs-tags">{(r.services || []).map((rs) => <span key={rs.id} className="rs-tag">{rs.service?.name}</span>)}</div>
                <div className="rs-card-footer">
                  <span className="rs-duration">{r.totalDuration} min</span>
                  <span className="rs-price">EGP {Number(r.totalPrice).toFixed(0)}</span>
                  {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(r.id)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
