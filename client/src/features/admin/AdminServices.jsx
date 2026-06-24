import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/ui/Modal.jsx';
import './Admin.css';

export default function AdminServices() {
  const toast = useToast();
  const [toggling, setToggling] = useState(null);

  const toggleStatus = async (s) => {
    setToggling(s.id);
    try {
      await api.patch(`/admin/services/${s.id}/toggle`);
      toast.success(s.active ? 'Service deactivated' : 'Service activated');
      fetchServices();
    } catch (err) { toast.error(err.message); }
    finally { setToggling(null); }
  };
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '' });
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/admin/services?${params}`);
      setServices(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  function openCreate() { setEdit(null); setForm({ name: '', description: '', price: '', duration: '' }); setModal(true); }
  function openEdit(s) { setEdit(s); setForm({ name: s.name, description: s.description || '', price: s.price, duration: s.duration }); setModal(true); }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (edit) await api.put(`/admin/services/${edit.id}`, form);
      else await api.post('/admin/services', form);
      setModal(false);
      toast.success(edit ? 'Service updated' : 'Service created');
      fetchServices();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading && services.length === 0) return (
    <div className="ad-page container-fluid">
      <div className="ad-header"><div><h1>Services</h1><p>Manage service offerings</p></div></div>
      <nav className="ad-nav">
        <Link to="/admin" className="ad-nav-item">Dashboard</Link>
        <Link to="/admin/barbers" className="ad-nav-item">Barbers</Link>
        <Link to="/admin/services" className="ad-nav-item active">Services</Link>
        <Link to="/admin/reservations" className="ad-nav-item">Reservations</Link>
      </nav>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{Array.from({ length: 4 }).map((_, i) => (
            <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
              <td key={j}><div className="skeleton" style={{ height: 18, width: j === 0 ? 120 : 70 }} /></td>
            ))}</tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );

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
        <input type="text" className="ad-search" placeholder="Search services..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <button className="btn btn-primary" onClick={openCreate}>Add Service</button>
      </div>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{services.length === 0 ? (
            <tr><td colSpan={6} className="ad-empty">{search ? 'No services match your search' : 'No services yet'}</td></tr>
          ) : services.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td><td>{s.description}</td><td>EGP {Number(s.price).toFixed(0)}</td><td>{s.duration} min</td>
              <td><span className={`ad-badge ${s.active ? 'ad-active' : 'ad-inactive'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
              <td className="ad-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}>Edit</button>
                <button className={`btn btn-sm ${s.active ? 'btn-secondary' : 'btn-primary'}`} disabled={toggling === s.id} onClick={() => toggleStatus(s)}>
                  {toggling === s.id ? <span className="spinner" /> : (s.active ? 'Deactivate' : 'Activate')}
                </button>
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title={edit ? 'Edit Service' : 'Create Service'}>
        <form onSubmit={handleSubmit} className="ad-form">
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
