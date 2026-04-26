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
      setError('All protocol fields are mandatory.');
      return;
    }
    setLoading(true);
    try {
      await API.post('/user/admin/technicians', formData);
      setSuccess('Technician provisioned successfully. Credentials active.');
      setFormData({ fullName: '', email: '', phone: '', specialization: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate provisioning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content-only">
        <section className="command-banner">
            <div className="command-info">
              <div className="welcome-tag">SYSTEM ADMINISTRATION</div>
              <h2>New Technician Protocol</h2>
              <div className="command-status">
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Institutional Security</span>
                  <span style={{ background: '#f9b824', color: '#1a2a44' }}>IDENTITY PROVISIONING</span>
              </div>
            </div>
        </section>

        <div className="info-card" style={{ marginTop: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Provisioning Registry</h3>
              <Link to="/users" className="card-link" style={{ margin: 0 }}>← BACK TO DIRECTORY</Link>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #fee2e2' }}>{error}</div>}
            {success && <div style={{ background: '#f0fdf4', color: '#10b981', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #dcfce7' }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Full Identity Name</label>
                    <input 
                      name="fullName" 
                      className="form-control" 
                      value={formData.fullName} 
                      onChange={handleChange} 
                      placeholder="e.g. Kasun Kalhara" 
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Institutional Email</label>
                    <input 
                      name="email" 
                      type="email" 
                      className="form-control" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="e.g. kasun@sliit.lk" 
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} 
                    />
                  </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Primary Contact</label>
                    <input 
                      name="phone" 
                      type="tel" 
                      className="form-control" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder="e.g. 0771234567" 
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Service Specialization</label>
                    <select 
                      name="specialization" 
                      className="form-control" 
                      value={formData.specialization} 
                      onChange={handleChange} 
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', appearance: 'none', background: '#fff' }}
                    >
                        <option value="">Select Protocol...</option>
                        {SPECIALIZATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
              </div>

              <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Security Access Key (Password)</label>
                  <input 
                    name="password" 
                    type="password" 
                    className="form-control" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Minimum 6 characters required" 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem' }} 
                  />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                <button type="submit" className="save-btn" style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#1a2a44', color: '#fff', fontWeight: 800, border: '0', cursor: 'pointer', transition: 'all 0.3s' }} disabled={loading}>
                    {loading ? 'PROVISIONING...' : 'INITIATE SYSTEM PROVISIONING'}
                </button>
                <Link to="/users" style={{ padding: '16px 24px', borderRadius: '12px', background: '#f8fafc', color: '#64748b', fontWeight: 800, border: '1px solid #e2e8f0', textDecoration: 'none', textAlign: 'center' }}>CANCEL</Link>
              </div>
            </form>
        </div>
    </div>
  );
}

export default AddTechnicianPage;