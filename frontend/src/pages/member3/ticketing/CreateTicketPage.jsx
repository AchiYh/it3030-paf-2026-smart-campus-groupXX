import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/member3/ticketService';

const MAX_IMAGES = 3;

function toReporterId(email) {
  const local = (email || '').split('@')[0] || 'usr';
  const normalized = local.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (normalized.length >= 3) return normalized.slice(0, 60);
  return `${normalized}usr`.slice(0, 60);
}

function CreateTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    reportedBy: toReporterId(user?.email),
    assignedTo: '',
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    return () => {
      images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [images]);

  const imageCountLabel = useMemo(() => `${images.length}/${MAX_IMAGES} images selected`, [images.length]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      nextErrors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters.';
    }

    if (!formData.category || formData.category.trim().length < 2) {
      nextErrors.category = 'Category must be at least 2 characters.';
    }

    if (!formData.priority) {
      nextErrors.priority = 'Priority is required.';
    }

    if (!/^[a-zA-Z0-9_-]{3,60}$/.test(formData.reportedBy || '')) {
      nextErrors.reportedBy = 'Reporter ID must be 3-60 chars using letters, numbers, _ or -.';
    }

    if (formData.assignedTo && !/^[a-zA-Z0-9_-]{3,60}$/.test(formData.assignedTo)) {
      nextErrors.assignedTo = 'Assignee must be 3-60 chars using letters, numbers, _ or -.';
    }

    if (images.length > MAX_IMAGES) {
      nextErrors.images = `You can upload up to ${MAX_IMAGES} images.`;
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setApiError('');

    const invalid = selectedFiles.find((file) => !file.type.startsWith('image/'));
    if (invalid) {
      setErrors((prev) => ({ ...prev, images: 'Only image files are allowed.' }));
      event.target.value = '';
      return;
    }

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setErrors((prev) => ({ ...prev, images: `You can upload up to ${MAX_IMAGES} images.` }));
      event.target.value = '';
      return;
    }

    const mapped = selectedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
    }));

    setImages((prev) => [...prev, ...mapped]);
    setErrors((prev) => ({ ...prev, images: '' }));
    event.target.value = '';
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    setSuccessMessage('');

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        priority: formData.priority,
        reportedBy: formData.reportedBy.trim(),
        assignedTo: formData.assignedTo.trim(),
      };

      const createResponse = await ticketService.createTicket(payload);
      const createdTicket = createResponse.data;

      if (images.length > 0 && createdTicket?.id) {
        for (const item of images) {
          await ticketService.uploadTicketImage(createdTicket.id, item.file, payload.reportedBy);
        }
      }

      setSuccessMessage('Ticket created successfully. Redirecting to details...');
      setTimeout(() => {
        navigate(`/tickets/${createdTicket.id}`);
      }, 700);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create ticket. Please try again.';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card fade-in">
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Create Ticket</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Submit a new request and optionally attach up to 3 images for better context.
        </p>
      </div>

      {apiError && (
        <div style={{
          padding: '0.75rem 0.9rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(239,68,68,0.3)',
          background: 'rgba(239,68,68,0.12)',
          color: '#fca5a5',
          fontSize: '0.875rem',
        }}>
          {apiError}
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: '0.75rem 0.9rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(16,185,129,0.35)',
          background: 'rgba(16,185,129,0.12)',
          color: '#6ee7b7',
          fontSize: '0.875rem',
        }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            placeholder="E.g., AC not cooling in Lab 3"
            maxLength={120}
          />
          {errors.title && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue with useful details..."
            maxLength={2000}
            rows={5}
          />
          {errors.description && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.description}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              placeholder="Electrical / Plumbing / Network"
              maxLength={60}
            />
            {errors.category && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.category}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              className="form-control"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            {errors.priority && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.priority}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginTop: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="reportedBy">Reporter ID</label>
            <input
              id="reportedBy"
              name="reportedBy"
              className="form-control"
              value={formData.reportedBy}
              onChange={handleChange}
              placeholder="your_user_id"
              maxLength={60}
            />
            {errors.reportedBy && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.reportedBy}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="assignedTo">Assigned Technician ID (optional)</label>
            <input
              id="assignedTo"
              name="assignedTo"
              className="form-control"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="tech_001"
              maxLength={60}
            />
            {errors.assignedTo && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.assignedTo}</p>}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label htmlFor="images">Images ({imageCountLabel})</label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="form-control"
          />
          <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.8rem' }}>
            You can add up to {MAX_IMAGES} images. Only image files are allowed.
          </p>
          {errors.images && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.images}</p>}
        </div>

        {images.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            {images.map((item) => (
              <div key={item.id} style={{
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                overflow: 'hidden',
              }}>
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '0.6rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    {item.file.name}
                  </p>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => removeImage(item.id)}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/tickets/list')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicketPage;
