import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import './MyReservations.css';

function ReservationSkeleton() {
  return (
    <div className="rs-card card" style={{ opacity: 0.6 }}>
      <div className="rs-card-header">
        <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 100 }} />
        <div className="skeleton" style={{ width: 120, height: 18 }} />
      </div>
      <div className="rs-card-body">
        <div className="rs-barber">
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '50%', height: 18, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: '35%', height: 14 }} />
          </div>
        </div>
        <div className="rs-tags">
          <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 100, display: 'inline-block' }} />
          <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 100, display: 'inline-block' }} />
        </div>
      </div>
    </div>
  );
}

export default function MyReservations() {
  const { state } = useLocation();
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    (async () => {
      try { const res = await api.get('/reservations/mine'); setReservations(res.data); }
      catch { setReservations([]); } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (state?.message) toast.success(state.message);
  }, [state, toast]);

  const handleCancel = useCallback(async () => {
    if (!cancelId) return;
    try {
      await api.patch(`/reservations/${cancelId}/cancel`, { reason: cancelReason });
      setReservations((prev) => prev.map((r) => r.id === cancelId ? { ...r, status: 'CANCELLED' } : r));
      toast.success('Reservation cancelled');
    } catch (err) { toast.error(err.message); }
    finally { setCancelId(null); setCancelReason(''); }
  }, [cancelId, cancelReason, toast]);

  if (loading) return (
    <div className="rs-page container-fluid">
      <h1 className="rs-title">My Reservations</h1>
      <div className="rs-list">
        {Array.from({ length: 3 }).map((_, i) => <ReservationSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="rs-page container-fluid">
      <h1 className="rs-title">My Reservations</h1>
      {reservations.length === 0 ? (
        <div className="empty-state">
          <h3>No reservations yet</h3>
          <p>Book your first appointment today and experience a premium grooming session.</p>
          <Link to="/barbers" className="btn btn-primary btn-lg">Browse Barbers</Link>
        </div>
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
                    <button className="btn btn-sm btn-danger" onClick={() => setCancelId(r.id)}>Cancel</button>
                  )}
                  {r.cancellationReason && r.status === 'CANCELLED' && (
                    <p className="rs-cancel-reason">Reason: {r.cancellationReason}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={!!cancelId}
        onConfirm={handleCancel}
        onCancel={() => { setCancelId(null); setCancelReason(''); }}
        title="Cancel Reservation?"
        message="This action cannot be undone. Your appointment slot will be released."
        confirmText="Yes, Cancel"
      >
        <div className="input-group" style={{ marginTop: 16 }}>
          <label>Reason (optional)</label>
          <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} placeholder="Tell us why you're cancelling..." />
        </div>
      </ConfirmDialog>
    </div>
  );
}
