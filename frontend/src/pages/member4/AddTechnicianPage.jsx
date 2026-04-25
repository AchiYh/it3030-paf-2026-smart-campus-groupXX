import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

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
      setError('Name, email, phone, specialization, and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/user/admin/technicians', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization,
        password: formData.password,
      });

      setSuccess('Technician created successfully.');
      setFormData({ fullName: '', email: '', phone: '', specialization: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create technician.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '0.4rem' }}>Add Technician</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create a new technician account with the TECHNICIAN role for ticket assignment.
          </p>
        </div>

        <button className="btn btn-secondary" type="button" onClick={() => navigate('/users')}>
          Back to Users
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 0.9rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(239,68,68,0.3)',
          background: 'rgba(239,68,68,0.12)',
          color: '#fca5a5',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '0.75rem 0.9rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(16,185,129,0.35)',
          background: 'rgba(16,185,129,0.12)',
          color: '#6ee7b7',
          fontSize: '0.875rem',
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ maxWidth: '720px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          <div className="form-group">
            <label htmlFor="fullName">Name</label>
            <input
              id="fullName"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., Chamika Perera"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., tech1@smartcampus.lk"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 0771234567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <select
              id="specialization"
              name="specialization"
              className="form-control"
              value={formData.specialization}
              onChange={handleChange}
            >
              <option value="">Select specialization</option>
              {SPECIALIZATION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a secure password"
            minLength={6}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/users')} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Technician'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTechnicianPage;