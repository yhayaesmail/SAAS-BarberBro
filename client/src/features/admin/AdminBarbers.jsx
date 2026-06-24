import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import './Admin.css';

function BarbersSkeleton() {
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead><tr><th>Name</th><th>Username</th><th>Phone</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{Array.from({ length: 5 }).map((_, i) => (
          <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
            <td key={j}><div className="skeleton" style={{ height: 18, width: j === 0 ? 120 : 80 }} /></td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/admin/barbers?${params}`);
      setBarbers(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleStatus = async (barberId) => {
    try { await api.patch(`/admin/barbers/${barberId}/toggle`); fetchData(); } catch {}
  };

  return (
    <div className="ad-page container-fluid">
      <div className="ad-header">
        <div><h1>Barbers</h1><p>Manage barber profiles</p></div>
        <Link to="/admin/barbers/new" className="btn btn-primary">Add Barber</Link>
      </div>
      <nav className="ad-nav">
        <Link to="/admin" className="ad-nav-item">Dashboard</Link>
        <Link to="/admin/barbers" className="ad-nav-item active">Barbers</Link>
        <Link to="/admin/services" className="ad-nav-item">Services</Link>
        <Link to="/admin/reservations" className="ad-nav-item">Reservations</Link>
      </nav>
      <div className="ad-toolbar">
        <input type="text" className="ad-search" placeholder="Search barbers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      {loading ? <BarbersSkeleton /> : (
        <>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>Name</th><th>Username</th><th>Phone</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{barbers.length === 0 ? (
                <tr><td colSpan={6} className="ad-empty">{search ? 'No barbers match your search' : 'No barbers yet'}</td></tr>
              ) : barbers.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td><td>@{b.username}</td><td>{b.phone1}</td><td>{b.startTime} - {b.endTime}</td>
                  <td><span className={`ad-badge ${b.active ? 'ad-active' : 'ad-inactive'}`}>{b.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="ad-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/admin/barbers/${b.id}/edit`)}>Edit</button>
                    <button className={`btn btn-sm ${b.active ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleStatus(b.id)}>{b.active ? 'Disable' : 'Enable'}</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="ad-pagination">
              <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {pagination.totalPages} ({pagination.total} total)</span>
              <button className="btn btn-sm btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}