import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const res = await api.get('/admin/dashboard'); setStats(res.data); }
      catch { setStats(null); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="ad-page container-fluid"><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="ad-page container-fluid">
      <div className="ad-header"><h1>Dashboard</h1><p>Platform overview and statistics</p></div>
      <nav className="ad-nav">
        <Link to="/admin" className="ad-nav-item active">Dashboard</Link>
        <Link to="/admin/barbers" className="ad-nav-item">Barbers</Link>
        <Link to="/admin/services" className="ad-nav-item">Services</Link>
        <Link to="/admin/reservations" className="ad-nav-item">Reservations</Link>
      </nav>
      <div className="ad-stats">
        {[
          { label: 'Total Barbers', value: stats?.totalBarbers || 0 },
          { label: 'Active Barbers', value: stats?.activeBarbers || 0 },
          { label: 'Total Reservations', value: stats?.totalReservations || 0 },
          { label: "Today's Reservations", value: stats?.todayReservations || 0 },
          { label: 'Total Revenue', value: `EGP ${Number(stats?.totalRevenue || 0).toLocaleString()}` },
          { label: 'Revenue (This Month)', value: `EGP ${Number(stats?.monthlyRevenue || 0).toLocaleString()}` },
        ].map((s, i) => (
          <div key={i} className="ad-stat-card card">
            <span className="ad-stat-val">{s.value}</span>
            <span className="ad-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="ad-sections">
        <div className="ad-section">
          <h2>Recent Reservations</h2>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>Customer</th><th>Barber</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {(stats?.recentReservations || []).slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td>{r.customer?.firstName} {r.customer?.lastName}</td>
                    <td>{r.barber?.name}</td>
                    <td>{new Date(r.startTime).toLocaleString()}</td>
                    <td><span className={`ad-badge ad-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                  </tr>
                ))}
                {(!stats?.recentReservations || stats.recentReservations.length === 0) && <tr><td colSpan={4} className="ad-empty">No reservations yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="ad-section">
          <h2>Top Services</h2>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>Service</th><th>Bookings</th></tr></thead>
              <tbody>
                {(stats?.topServices || []).map((s, i) => (
                  <tr key={i}><td>{s.name}</td><td>{s.count}</td></tr>
                ))}
                {(!stats?.topServices || stats.topServices.length === 0) && <tr><td colSpan={2} className="ad-empty">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
