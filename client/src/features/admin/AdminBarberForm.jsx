import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import './Admin.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminBarberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', username: '', bio: '', phone1: '', phone2: '', email: '', password: '', imageUrl: '',
    startTime: '09:00', endTime: '21:00',
    services: [],
    workingHours: DAYS.map((_, i) => ({ dayOfWeek: i, startTime: '09:00', endTime: '21:00', isActive: i !== 5 })),
  });

  useEffect(() => {
    async function load() {
      try {
        const [sRes] = await Promise.all([api.get('/admin/services')]);
        if (isEdit) {
          const [bRes] = await Promise.all([api.get(`/admin/barbers/${id}`)]);
          const b = bRes.data;
          setForm({
            name: b.name, username: b.username, bio: b.bio || '', phone1: b.phone1, phone2: b.phone2 || '', email: b.email || '', imageUrl: b.imageUrl || '',
            startTime: b.startTime, endTime: b.endTime,
            services: b.services?.map((s) => ({ serviceId: s.serviceId, price: s.price ?? '', duration: s.duration ?? '' })) || [],
            workingHours: b.workingHours?.length > 0
              ? b.workingHours.map((w) => ({ dayOfWeek: w.dayOfWeek, startTime: w.startTime, endTime: w.endTime, isActive: w.isActive }))
              : DAYS.map((_, i) => ({ dayOfWeek: i, startTime: b.startTime, endTime: b.endTime, isActive: i !== 5 })),
          });
        }
        setServices(sRes.data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, [id, isEdit]);

  function toggleService(svc) {
    setForm((prev) => {
      const exists = prev.services.find((s) => s.serviceId === svc.id);
      if (exists) return { ...prev, services: prev.services.filter((s) => s.serviceId !== svc.id) };
      return { ...prev, services: [...prev.services, { serviceId: svc.id, price: svc.price ?? '', duration: svc.duration ?? '' }] };
    });
  }

  function updateServicePrice(serviceId, price) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s) => s.serviceId === serviceId ? { ...s, price } : s),
    }));
  }

  function updateServiceDuration(serviceId, duration) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s) => s.serviceId === serviceId ? { ...s, duration } : s),
    }));
  }

  function updateWorkingHour(index, key, value) {
    setForm((prev) => {
      const w = [...prev.workingHours];
      w[index] = { ...w[index], [key]: value };
      return { ...prev, workingHours: w };
    });
  }

  function isSelected(serviceId) {
    return form.services.some((s) => s.serviceId === serviceId);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const { password, ...base } = form;
      const payload = {
        ...base,
        services: form.services.map((s) => ({
          serviceId: s.serviceId,
          price: s.price ? Number(s.price) : undefined,
          duration: s.duration ? Number(s.duration) : undefined,
        })),
      };
      if (isEdit) await api.put(`/admin/barbers/${id}`, payload);
      else await api.post('/admin/barbers', { ...payload, password });
      navigate('/admin/barbers');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="ad-page container-fluid"><div className="loading-screen"><div className="spinner spinner-lg" /></div></div>;

  return (
    <div className="ad-page container-fluid">
      <div className="ad-header">
        <div>
          <h1>{isEdit ? 'Edit Barber' : 'Add Barber'}</h1>
          <p>{isEdit ? 'Update barber profile and services' : 'Create a new barber profile'}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/barbers')}>Back</button>
      </div>

      <form onSubmit={handleSubmit} className="ad-form" style={{ maxWidth: 720 }}>
        {error && <div className="error-message">{error}</div>}

        <div className="ad-form-row">
          <div className="input-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="input-group"><label>Username</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
        </div>

        <div className="input-group"><label>Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} /></div>

        <div className="input-group">
          <label>Profile Image</label>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const fd = new FormData();
            fd.append('image', file);
            try {
              const res = await api.post('/upload/barber-image', fd);
              setForm({ ...form, imageUrl: res.data.url });
            } catch (err) { setError(err.message); }
          }} />
          {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />}
        </div>

        <div className="ad-form-row">
          <div className="input-group"><label>Phone 1</label><input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} required /></div>
          <div className="input-group"><label>Phone 2</label><input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} /></div>
        </div>

        <div className="ad-form-row">
          <div className="input-group"><label>Email (for login)</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required={!isEdit} /></div>
          {!isEdit && <div className="input-group"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!isEdit} minLength={6} /></div>}
        </div>

        <div className="ad-form-row">
          <div className="input-group"><label>Start Time</label><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required /></div>
          <div className="input-group"><label>End Time</label><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required /></div>
        </div>

        <div className="input-group">
          <label>Services (check to assign, set custom price/duration)</label>
          <div className="ad-cb-group">
            {services.map((svc) => (
              <div key={svc.id} className="ad-cb-row">
                <label className="ad-cb">
                  <input type="checkbox" checked={isSelected(svc.id)} onChange={() => toggleService(svc)} />
                  <span className="ad-cb-name">{svc.name}</span>
                </label>
                {isSelected(svc.id) && (
                  <div className="ad-cb-pricing">
                    <input type="number" step="0.01" placeholder={`Price (${Number(svc.price).toFixed(0)})`}
                      value={form.services.find((s) => s.serviceId === svc.id)?.price ?? ''}
                      onChange={(e) => updateServicePrice(svc.id, e.target.value)} />
                    <input type="number" placeholder={`Min (${svc.duration})`}
                      value={form.services.find((s) => s.serviceId === svc.id)?.duration ?? ''}
                      onChange={(e) => updateServiceDuration(svc.id, e.target.value)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>Working Hours</label>
          {form.workingHours.map((wh, i) => (
            <div key={i} className="ad-wh">
              <label className="ad-cb">
                <input type="checkbox" checked={wh.isActive}
                  onChange={(e) => updateWorkingHour(i, 'isActive', e.target.checked)} />
                {DAYS[i]}
              </label>
              {wh.isActive && (
                <div className="ad-wh-times">
                  <input type="time" value={wh.startTime} onChange={(e) => updateWorkingHour(i, 'startTime', e.target.value)} />
                  <span>to</span>
                  <input type="time" value={wh.endTime} onChange={(e) => updateWorkingHour(i, 'endTime', e.target.value)} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="ad-form-actions" style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <span className="spinner" /> : (isEdit ? 'Update Barber' : 'Create Barber')}
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/admin/barbers')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}