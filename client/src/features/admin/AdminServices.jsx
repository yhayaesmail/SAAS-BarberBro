import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import Modal from '../../components/ui/Modal.jsx';
import './Admin.css';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    try { const res = await api.get('/admin/services'); setServices(res.data); } catch {} finally { setLoading(false); }
  }

  function openCreate() { setEdit(null); setForm({ name: '', description: '', price: '', duration: '' }); setError(''); setModal(true); }
  function openEdit(s) { setEdit(s); setForm({ name: s.name, description: s.description || '', price: s.price, duration: s.duration }); setError(''); setModal(true); }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (edit) await api.put(`/admin/services/${edit.id}`, form);
      else await api.post('/admin/services', form);
      setModal(false); fetchServices();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="ad-page container-fluid"><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="ad-page container-fluid">
      <div className="ad-header"><div><h1>Services</h1><p>Manage service offerings</p></div></div>
      <nav className="ad-nav">
        <Link to="/admin" className="ad-nav-item">Dashboard</Link>
        <Link to="/admin/barbers" className="ad-nav-item">Barbers</Link>
        <Link to="/admin/services" className="ad-nav-item active">Services</Link>
        <Link to="/admin/reservations" className="ad-nav-item">Reservations</Link>
      </nav>
      <div className="ad-toolbar">
        <button className="btn btn-primary" onClick={openCreate}>Add Service</button>
      </div>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{services.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td><td>{s.description}</td><td>EGP {Number(s.price).toFixed(0)}</td><td>{s.duration} min</td>
              <td><span className={`ad-badge ${s.active ? 'ad-active' : 'ad-inactive'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
              <td className="ad-actions"><button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}>Edit</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? 'Edit Service' : 'Create Service'}>
        <form onSubmit={handleSubmit} className="ad-form">
          {error && <div className="error-message">{error}</div>}
          <div className="input-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="input-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          <div className="ad-form-row">
            <div className="input-group"><label>Price (EGP)</label><input type="number" min="1" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
            <div className="input-group"><label>Duration (min)</label><input type="number" min="5" step="5" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required /></div>
          </div>
          <div className="ad-form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : (edit ? 'Update' : 'Create')}</button></div>
        </form>
      </Modal>
    </div>
  );
}
