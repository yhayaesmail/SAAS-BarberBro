import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import './Admin.css';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminReservations() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/admin/reservations?${params}`);
      setReservations(res.data);
      setPagination(res.pagination);
    } catch { setReservations([]); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/reservations/${id}/status`, { status });
      toast.success(`Reservation ${status.toLowerCase()}`);
      fetchData();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="ad-page container-fluid">
      <div className="ad-header"><h1>Reservations</h1><p>All platform reservations</p></div>
      <nav className="ad-nav">
        <Link to="/admin" className="ad-nav-item">Dashboard</Link>
        <Link to="/admin/barbers" className="ad-nav-item">Barbers</Link>
        <Link to="/admin/services" className="ad-nav-item">Services</Link>
        <Link to="/admin/reservations" className="ad-nav-item active">Reservations</Link>
      </nav>
      <div className="ad-toolbar" style={{ gap: 12 }}>
        <input type="text" className="ad-search" placeholder="Search customer or barber..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="ad-filter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>Customer</th><th>Barber</th><th>Services</th><th>Date & Time</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}><div className="skeleton" style={{ height: 18, width: j === 3 ? 140 : 80 }} /></td>
                ))}</tr>
              ))
            ) : reservations.length === 0 ? (
              <tr><td colSpan={7} className="ad-empty">No reservations found</td></tr>
            ) : reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.customer?.firstName} {r.customer?.lastName}</td>
                <td>{r.barber?.name}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(r.services || []).map((s) => s.service?.name).join(', ')}
                </td>
                <td>{new Date(r.startTime).toLocaleString()}</td>
                <td>EGP {Number(r.totalPrice).toFixed(0)}</td>
                <td><span className={`ad-badge ad-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                <td className="ad-actions">
                  {r.status === 'PENDING' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r.id, 'CONFIRMED')}>Confirm</button>}
                  {r.status === 'CONFIRMED' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r.id, 'COMPLETED')}>Complete</button>}
                  {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                    <button className="btn btn-sm btn-danger" onClick={() => updateStatus(r.id, 'CANCELLED')}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="ad-pagination">
          <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-sm btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
