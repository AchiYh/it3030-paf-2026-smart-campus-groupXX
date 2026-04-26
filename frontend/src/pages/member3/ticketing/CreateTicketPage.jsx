import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/member3/ticketService';
import { suggestPriority } from '../../../utils/ticketUtils';

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const CATEGORY_OPTIONS = [
  { value: 'NETWORK', label: 'NETWORK', icon: '💻' },
  { value: 'ELECTRICAL', label: 'ELECTRICAL', icon: '⚡' },
  { value: 'PLUMBING', label: 'PLUMBING', icon: '🔧' },
  { value: 'HVAC', label: 'HVAC', icon: '❄️' },
  { value: 'FURNITURE', label: 'FURNITURE', icon: '🪑' },
  { value: 'CLEANING', label: 'CLEANING', icon: '🧹' },
  { value: 'SECURITY', label: 'SECURITY', icon: '🔒' },
  { value: 'OTHER', label: 'OTHER', icon: '📋' },
];

const LOCATION_OPTIONS = [
  'Main Building',
  'Lab Complex',
  'Library',
  'Lecture Hall Block',
  'Cafeteria',
  'Hostel Area',
  'Parking Area',
  'Sports Complex',
];

const RESOURCE_OPTIONS_BY_CATEGORY = {
  NETWORK: ['WiFi Access Point', 'Network Switch', 'LAN Port', 'Internet Router'],
  ELECTRICAL: ['Light Fixture', 'Power Outlet', 'Circuit Breaker', 'Generator'],
  PLUMBING: ['Tap', 'Washroom Sink', 'Water Line', 'Drainage'],
  HVAC: ['Air Conditioner', 'Ventilation Fan', 'Thermostat', 'Duct System'],
  FURNITURE: ['Desk', 'Chair', 'Cabinet', 'Whiteboard'],
  CLEANING: ['Restroom', 'Corridor', 'Classroom Floor', 'Waste Bin Area'],
  SECURITY: ['CCTV Camera', 'Door Lock', 'Access Control Panel', 'Alarm Sensor'],
  OTHER: ['Projector', 'Audio System', 'General Facility', 'Other Resource'],
};

function toReporterId(email) {
  const local = (email || '').split('@')[0] || 'usr';
  const normalized = local.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (normalized.length >= 3) return normalized.slice(0, 60);
  return `${normalized}usr`.slice(0, 60);
}

function calculateDueDatePreview(priority) {
  const days = priority === 'CRITICAL' ? 1 : priority === 'HIGH' ? 2 : priority === 'MEDIUM' ? 3 : 5;
  const due = new Date();
  due.setDate(due.getDate() + days);
  return `${due.toLocaleDateString()} (${days} day${days > 1 ? 's' : ''})`;
}

function buildEnrichedDescription(description, location, relatedResource) {
  const metaLines = [];
  if (location) metaLines.push(`Location: ${location}`);
  if (relatedResource) metaLines.push(`Related Resource: ${relatedResource}`);

  if (metaLines.length === 0) {
    return description.trim();
  }

  return `${metaLines.join('\n')}\n\n${description.trim()}`;
}

function CreateTicketPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    relatedResource: '',
    category: '',
    priority: 'MEDIUM',
    reportedBy: toReporterId(user?.email),
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (isAdmin) {
    return <Navigate to="/tickets/list" replace />;
  }

  useEffect(() => {
    return () => {
      images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [images]);

  const imageCountLabel = useMemo(() => `${images.length}/${MAX_IMAGES} images selected`, [images.length]);
  const dueDatePreview = useMemo(() => calculateDueDatePreview(formData.priority), [formData.priority]);
  const relatedResourceOptions = useMemo(
    () => RESOURCE_OPTIONS_BY_CATEGORY[formData.category] || RESOURCE_OPTIONS_BY_CATEGORY.OTHER,
    [formData.category]
  );
  const prioritySuggestion = useMemo(
    () => suggestPriority(formData.description, formData.category),
    [formData.description, formData.category]
  );

  useEffect(() => {
    if (!formData.relatedResource) return;
    if (!relatedResourceOptions.includes(formData.relatedResource)) {
      setFormData((prev) => ({ ...prev, relatedResource: '' }));
    }
  }, [formData.relatedResource, relatedResourceOptions]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      nextErrors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters.';
    }

    if (!formData.location) {
      nextErrors.location = 'Location is required.';
    }

    const enrichedDescription = buildEnrichedDescription(
      formData.description,
      formData.location,
      formData.relatedResource
    );
    if (enrichedDescription.length > 2000) {
      nextErrors.description = 'Description and selected metadata must not exceed 2000 characters.';
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

  const handleCategorySelect = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
    setErrors((prev) => ({ ...prev, category: '' }));
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

    const tooLarge = selectedFiles.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge) {
      setErrors((prev) => ({ ...prev, images: 'Each image must be 5 MB or smaller.' }));
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
      const enrichedDescription = buildEnrichedDescription(
        formData.description,
        formData.location,
        formData.relatedResource
      );

      const payload = {
        title: formData.title.trim(),
        description: enrichedDescription,
        category: formData.category.trim(),
        priority: formData.priority,
        reportedBy: formData.reportedBy.trim(),
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
            <label htmlFor="location">Location *</label>
            <select
              id="location"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="">Select location</option>
              {LOCATION_OPTIONS.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            {errors.location && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.location}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="relatedResource">Related Resource</label>
            <select
              id="relatedResource"
              name="relatedResource"
              className="form-control"
              value={formData.relatedResource}
              onChange={handleChange}
            >
              <option value="">Select resource</option>
              {relatedResourceOptions.map((resource) => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="category">Category *</label>
          <div
            id="category"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '0.35rem',
            }}
          >
            {CATEGORY_OPTIONS.map((option) => {
              const selected = formData.category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleCategorySelect(option.value)}
                  style={{
                    border: selected ? '1px solid rgba(96,165,250,0.9)' : '1px solid var(--border-color)',
                    background: selected ? 'rgba(59,130,246,0.18)' : 'rgba(148,163,184,0.08)',
                    color: selected ? '#bfdbfe' : 'var(--text-secondary)',
                    borderRadius: '999px',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span aria-hidden="true">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
          {errors.category && <p style={{ color: '#fca5a5', marginTop: '0.35rem', fontSize: '0.8rem' }}>{errors.category}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginTop: '0.85rem' }}>
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
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.8rem' }}>
              Due date will be auto-set to: {dueDatePreview}
            </p>

            {prioritySuggestion && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.3)',
                fontSize: '0.85rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.75rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      💡 <strong>Suggested:</strong> {prioritySuggestion.priority}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 0 }}>
                      {prioritySuggestion.reason}
                      {prioritySuggestion.priority === formData.priority ? ' (already selected)' : ''}
                    </p>
                  </div>
                  {prioritySuggestion.priority !== formData.priority && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, priority: prioritySuggestion.priority }))}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        background: 'rgba(59,130,246,0.2)',
                        border: '1px solid rgba(59,130,246,0.4)',
                        color: '#93c5fd',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'rgba(59,130,246,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'rgba(59,130,246,0.2)';
                      }}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
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
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <p style={{ marginBottom: '0.2rem', fontWeight: 600 }}>Attachments</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.6rem', fontSize: '0.8rem' }}>
            Add photos to help illustrate the issue (optional)
          </p>

          <input
            id="images"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif"
            multiple
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              border: '1.5px dashed rgba(96, 165, 250, 0.6)',
              borderRadius: '14px',
              background: 'rgba(148, 163, 184, 0.08)',
              minHeight: '130px',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              padding: '1rem',
            }}
          >
            <div>
              <p style={{ marginBottom: '0.35rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Click to upload images
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                JPG, PNG, GIF - max 5 MB each - up to {MAX_IMAGES} files
              </p>
            </div>
          </button>

          <p style={{ color: 'var(--text-muted)', marginTop: '0.45rem', fontSize: '0.8rem' }}>
            Images ({imageCountLabel})
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
