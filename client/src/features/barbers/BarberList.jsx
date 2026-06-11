import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import './BarberList.css';

export default function BarberList() {
  const [params] = useSearchParams();
  const search = params.get('search') || '';
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await api.get(`/barbers${q}`);
        setBarbers(res.data);
      } catch { setBarbers([]); } finally { setLoading(false); }
    })();
  }, [search]);

  if (loading) return (
    <div className="bl-page container">
      <h1 className="bl-title">{search ? `Results for "${search}"` : 'Our Barbers'}</h1>
      <div className="bl-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card"><div className="skeleton" style={{ height: 200, marginBottom: 16 }} /><div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 8 }} /><div className="skeleton" style={{ height: 16, width: '80%' }} /></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bl-page container">
      <h1 className="bl-title">{search ? `Results for "${search}"` : 'Our Barbers'}</h1>
      {barbers.length === 0 ? (
        <div className="empty-state">
          <h3>No barbers found</h3>
          <p>{search ? 'Try a different search term.' : 'No barbers are currently available.'}</p>
          {search && <Link to="/barbers" className="btn btn-outline">View All</Link>}
        </div>
      ) : (
        <div className="bl-grid">
          {barbers.map((b) => (
            <Link to={`/barbers/${b.id}`} key={b.id} className="bl-card card">
              <div className="bl-card-img"><div className="bl-avatar">{b.name.charAt(0)}</div></div>
              <div className="bl-card-body">
                <h3>{b.name}</h3>
                <p className="bl-username">@{b.username}</p>
                <p className="bl-bio">{b.bio || 'Professional barber'}</p>
                <div className="bl-card-footer">
                  <span>{b.startTime} - {b.endTime}</span>
                  <span>{b._count?.services || 0} services</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
