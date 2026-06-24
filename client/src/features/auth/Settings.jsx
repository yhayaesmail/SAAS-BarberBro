import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFormField, required, isPhone } from '../../hooks/useFormField.js';
import './Settings.css';

export default function Settings() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const firstName = useFormField(user?.firstName || '', [required()]);
  const lastName = useFormField(user?.lastName || '', [required()]);
  const phone = useFormField(user?.phone || '', [isPhone()]);
  const phone2 = useFormField(user?.phone2 || '', [isPhone()]);
  const currentPassword = useFormField('', []);
  const newPassword = useFormField('', []);
  const passwordConfirm = useFormField('', []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
      } catch {}
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    firstName.validate(); lastName.validate();
    if (firstName.error || lastName.error) return;
    if (newPassword.value) {
      if (!currentPassword.value) {
        toast.error('Current password is required to set a new password');
        return;
      }
      if (newPassword.value !== passwordConfirm.value) {
        toast.error('Passwords do not match');
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        firstName: firstName.value,
        lastName: lastName.value,
        phone: phone.value,
        phone2: phone2.value,
      };
      if (newPassword.value) {
        payload.currentPassword = currentPassword.value;
        payload.password = newPassword.value;
      }
      await api.put('/auth/profile', payload);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="settings-page container-fluid">
      <div className="settings-heading">
        <h1>Settings</h1>
        <p>Manage your account and personal information</p>
      </div>
      <div className="settings-layout">
        <div className="settings-side">
          <div className="settings-avatar">
            {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
          </div>
          <div className="settings-role">
            <span className={`settings-badge ${user?.role?.toLowerCase()}`}>{user?.role}</span>
          </div>
          <div className="settings-info">
            <div className="settings-email">{user?.email}</div>
            <div><span>Member since</span><strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</strong></div>
            {user?.role === 'BARBER' && profile?.barber && (
              <div><span>Barber profile</span><strong>{profile.barber.name}</strong></div>
            )}
          </div>
        </div>
        <div className="settings-main">
          <form onSubmit={handleSubmit}>
            <div className="settings-section">
              <h2>Personal Information</h2>
              <div className="settings-row">
                <div className="input-group"><label>First Name</label><input value={firstName.value} onChange={firstName.onChange} onBlur={firstName.onBlur} className={firstName.touched && firstName.error ? 'input-error' : ''} />{firstName.touched && firstName.error && <span className="field-error">{firstName.error}</span>}</div>
                <div className="input-group"><label>Last Name</label><input value={lastName.value} onChange={lastName.onChange} onBlur={lastName.onBlur} className={lastName.touched && lastName.error ? 'input-error' : ''} />{lastName.touched && lastName.error && <span className="field-error">{lastName.error}</span>}</div>
              </div>
              <div className="settings-row">
                <div className="input-group"><label>Phone</label><input placeholder="Primary" value={phone.value} onChange={phone.onChange} onBlur={phone.onBlur} className={phone.touched && phone.error ? 'input-error' : ''} />{phone.touched && phone.error && <span className="field-error">{phone.error}</span>}</div>
                <div className="input-group"><label>Phone 2</label><input placeholder="Secondary" value={phone2.value} onChange={phone2.onChange} onBlur={phone2.onBlur} className={phone2.touched && phone2.error ? 'input-error' : ''} />{phone2.touched && phone2.error && <span className="field-error">{phone2.error}</span>}</div>
              </div>
            </div>
            <div className="settings-section">
              <h2>Change Password</h2>
              <p className="settings-note">Fill in all three fields to change your password</p>
              <div className="settings-row">
                <div className="input-group"><label>Current Password</label><input type="password" value={currentPassword.value} onChange={currentPassword.onChange} minLength={6} /></div>
                <div className="input-group"><label>New Password</label><input type="password" value={newPassword.value} onChange={newPassword.onChange} minLength={6} /></div>
              </div>
              <div className="settings-row">
                <div className="input-group"><label>Confirm New Password</label><input type="password" value={passwordConfirm.value} onChange={passwordConfirm.onChange} minLength={6} /></div>
              </div>
            </div>
            <div className="settings-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? <span className="spinner" /> : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
