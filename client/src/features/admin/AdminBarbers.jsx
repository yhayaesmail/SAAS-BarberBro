import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import './Admin.css';

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [b] = await Promise.all([api.get('/admin/barbers')]);
      setBarbers(b.data);
    } catch {} finally { setLoading(false); }
  }

  const toggleStatus = async (barberId) => {
    try { await api.patch(`/admin/barbers/${barberId}/toggle`); fetchData(); } catch {}
  };

  if (loading) return <div className="ad-page container"><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="ad-page container">
      <div className="ad-header">
        <div><h1>Barbers</h1><p>Manage barber profiles</p></div>
        <Link to="/admin/barbers/new" className="btn btn-rainbow">Add Barber</Link>
      </div>
      <nav className="ad-nav">
        <Link to="/admin" className="ad-nav-item">Dashboard</Link>
        <Link to="/admin/barbers" className="ad-nav-item active">Barbers</Link>
        <Link to="/admin/services" className="ad-nav-item">Services</Link>
        <Link to="/admin/reservations" className="ad-nav-item">Reservations</Link>
      </nav>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>Name</th><th>Username</th><th>Phone</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{barbers.map((b) => (
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
    </div>
  );
}