import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import "./Dashboard.css";

const SPECIALIZATION_OPTIONS = [
  'Electrical',
  'Plumbing',
  'Networking',
  'Hardware',
  'Software',
  'Facilities',
  'Other',
];

function AddTechnicianPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.specialization || !formData.password.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await API.post('/user/admin/technicians', formData);
      setSuccess('Technician created successfully.');
      setFormData({ fullName: '', email: '', phone: '', specialization: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create technician.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content-only">
        <section className="command-banner">
            <div className="command-info">
            <h2>New Technician Protocol</h2>
            <div className="command-status">
                <span>Institutional Security</span>
                <span>IDENTITY PROVISIONING</span>
            </div>
            </div>
        </section>

        <div className="info-card" style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3>Provisioning Form</h3>
            <Link to="/users" className="cancel-btn" style={{ textDecoration: 'none', padding: '8px 16px' }}>BACK TO DIRECTORY</Link>
            </div>

            {error && <div className="message error" style={{ marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="message success" style={{ marginBottom: '1rem', background: '#f0fdf4', color: '#10b981', padding: '12px', borderRadius: '8px' }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="edit-input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>FULL NAME</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Kasun Kalhara" style={{ width: '100%', marginTop: '4px' }} />
                </div>
                <div className="edit-input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>EMAIL ADDRESS</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g. kasun@sliit.lk" style={{ width: '100%', marginTop: '4px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="edit-input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>PHONE NUMBER</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="e.g. 0771234567" style={{ width: '100%', marginTop: '4px' }} />
                </div>
                <div className="edit-input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>SPECIALIZATION</label>
                <select name="specialization" value={formData.specialization} onChange={handleChange} style={{ width: '100%', marginTop: '4px', background: '#eff3f9', border: '0', padding: '8px', borderRadius: '4px' }}>
                    <option value="">Select Protocol...</option>
                    {SPECIALIZATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                </div>
            </div>

            <div className="edit-input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>TEMPORARY PASSWORD</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" style={{ width: '100%', marginTop: '4px' }} />
            </div>

            <button type="submit" className="save-btn" style={{ padding: '12px', marginTop: '12px' }} disabled={loading}>
                {loading ? 'PROVISIONING...' : 'INITIATE PROVISIONING'}
            </button>
            </form>
        </div>
    </div>
  );
}

export default AddTechnicianPage;