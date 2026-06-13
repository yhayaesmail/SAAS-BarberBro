import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import './Admin.css';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/reservations?page=${page}&limit=20`);
        setReservations(res.data);
        setPagination(res.pagination);
      } catch { setReservations([]); } finally { setLoading(false); }
    })();
  }, [page]);

  if (loading) return <div className="ad-page container-fluid"><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="ad-page container-fluid">
      <div className="ad-header"><h1>Reservations</h1><p>All platform reservations</p></div>
      <nav className="ad-nav">
        <Link to="/admin" className="ad-nav-item">Dashboard</Link>
        <Link to="/admin/barbers" className="ad-nav-item">Barbers</Link>
        <Link to="/admin/services" className="ad-nav-item">Services</Link>
        <Link to="/admin/reservations" className="ad-nav-item active">Reservations</Link>
      </nav>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>Customer</th><th>Barber</th><th>Services</th><th>Date & Time</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan={6} className="ad-empty">No reservations found</td></tr>
            ) : reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.customer?.firstName} {r.customer?.lastName}</td>
                <td>{r.barber?.name}</td>
                <td>{(r.services || []).map((s) => s.service?.name).join(', ')}</td>
                <td>{new Date(r.startTime).toLocaleString()}</td>
                <td>EGP {Number(r.totalPrice).toFixed(0)}</td>
                <td><span className={`ad-badge ad-${r.status?.toLowerCase()}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
