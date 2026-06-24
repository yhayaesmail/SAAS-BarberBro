import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client.js';
import '../admin/Admin.css';

export default function BarberDashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      const res = await api.get(`/reservations/barber/mine?${params}`);
      setReservations(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  if (loading && reservations.length === 0) return (
    <div className="ad-page container-fluid">
      <div className="ad-header"><div><h1>My Schedule</h1><p>Your upcoming reservations</p></div></div>
      <div className="loading-screen"><div className="spinner spinner-lg" /></div>
    </div>
  );

  return (
    <div className="ad-page container-fluid">
      <div className="ad-header">
        <div><h1>My Schedule</h1><p>Your upcoming reservations</p></div>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-state">
          <h3>No reservations yet</h3>
          <p>You don't have any upcoming reservations.</p>
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Services</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.customer.firstName} {r.customer.lastName}</td>
                  <td>{r.customer.phone || '-'}</td>
                  <td>{r.services.map((s) => s.service.name).join(', ')}</td>
                  <td>{new Date(r.startTime).toLocaleString()}</td>
                  <td>{r.totalDuration} min</td>
                  <td>EGP {Number(r.totalPrice).toFixed(0)}</td>
                  <td><span className={`ad-badge ${r.status === 'CONFIRMED' ? 'ad-active' : r.status === 'COMPLETED' ? 'ad-active' : r.status === 'CANCELLED' ? 'ad-inactive' : ''}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="ad-pagination">
          <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pagination.totalPages}</span>
          <button className="btn btn-sm btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
