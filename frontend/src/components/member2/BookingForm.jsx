import { useState } from 'react';

const RESOURCE_OPTIONS = [
  { id: 'res-101', name: 'Lecture Hall A', capacity: 2500, location: 'Main Building' },
  { id: 'res-102', name: 'Computer Lab B', capacity: 1500, location: 'Tech Wing' },
  { id: 'res-103', name: 'Meeting Room 1', capacity: 550, location: 'Admin Block' },
  { id: 'res-104', name: 'Auditorium', capacity: 3000, location: 'Main Building' },
];

function BookingForm({ defaultEmail, onCreate }) {
  const [resourceId, setResourceId] = useState(RESOURCE_OPTIONS[0].id);
  const [resourceName, setResourceName] = useState(RESOURCE_OPTIONS[0].name);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const selectedResource = RESOURCE_OPTIONS.find(r => r.id === resourceId);

  const validateForm = () => {
    const errors = {};

    if (!date) errors.date = 'Date is required';
    else if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
      errors.date = 'Date cannot be in the past';
    }

    if (!startTime) errors.startTime = 'Start time is required';
    if (!endTime) errors.endTime = 'End time is required';

    if (startTime && endTime && startTime >= endTime) {
      errors.endTime = 'End time must be after start time';
    }

    if (!purpose.trim()) errors.purpose = 'Purpose is required';
    else if (purpose.trim().length < 3) errors.purpose = 'Purpose must be at least 3 characters';

    if (attendees < 1) errors.attendees = 'At least 1 attendee required';
    else if (selectedResource && attendees > selectedResource.capacity) {
      errors.attendees = `Cannot exceed room capacity (${selectedResource.capacity})`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResourceChange = (event) => {
    const selectedId = event.target.value;
    const selectedResource = RESOURCE_OPTIONS.find((item) => item.id === selectedId);
    setResourceId(selectedId);
    setResourceName(selectedResource?.name || '');
    // Clear attendee error if capacity issue was resolved
    if (fieldErrors.attendees && selectedResource && attendees <= selectedResource.capacity) {
      setFieldErrors(prev => ({ ...prev, attendees: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please correct the highlighted errors');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        resourceId,
        resourceName,
        userEmail: defaultEmail,
        date,
        startTime,
        endTime,
        purpose: purpose.trim(),
        attendees,
      });
      setPurpose('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setAttendees(1);
      setFieldErrors({});
    } catch (createError) {
      const message = createError?.response?.data?.message ||
                     createError?.message ||
                     'Failed to create booking. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📅 Create New Booking
          </h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Reserve a resource for your session or event
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Resource Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              margin: '0 0 1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              📍 Select Resource
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {RESOURCE_OPTIONS.map((resource) => (
                <label
                  key={resource.id}
                  style={{
                    display: 'block',
                    padding: '1rem',
                    border: `2px solid ${resourceId === resource.id ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--border-radius)',
                    background: resourceId === resource.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (resourceId !== resource.id) {
                      e.target.style.borderColor = 'var(--primary-light)';
                      e.target.style.background = 'rgba(99, 102, 241, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (resourceId !== resource.id) {
                      e.target.style.borderColor = 'var(--border-color)';
                      e.target.style.background = 'var(--bg-input)';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="resource"
                    value={resource.id}
                    checked={resourceId === resource.id}
                    onChange={handleResourceChange}
                    style={{ position: 'absolute', opacity: 0 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: resourceId === resource.id ? 'var(--primary)' : 'var(--border-color)',
                      border: '2px solid var(--bg-secondary)',
                      transition: 'var(--transition)'
                    }}></div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {resource.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {resource.location} • Capacity: {resource.capacity}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              margin: '0 0 1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              🕐 Schedule Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  📅 Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="form-control"
                  style={{
                    borderColor: fieldErrors.date ? 'var(--danger)' : undefined,
                    background: fieldErrors.date ? 'rgba(239, 68, 68, 0.1)' : undefined
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                {fieldErrors.date && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    ⚠️ {fieldErrors.date}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  🕐 Start Time *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="form-control"
                  style={{
                    borderColor: fieldErrors.startTime ? 'var(--danger)' : undefined,
                    background: fieldErrors.startTime ? 'rgba(239, 68, 68, 0.1)' : undefined
                  }}
                />
                {fieldErrors.startTime && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    ⚠️ {fieldErrors.startTime}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  🕐 End Time *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="form-control"
                  style={{
                    borderColor: fieldErrors.endTime ? 'var(--danger)' : undefined,
                    background: fieldErrors.endTime ? 'rgba(218, 26, 26, 0.1)' : undefined
                  }}
                />
                {fieldErrors.endTime && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    ⚠️ {fieldErrors.endTime}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  👥 Attendees *
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedResource?.capacity || 1000}
                  value={attendees}
                  onChange={(event) => setAttendees(Number(event.target.value))}
                  className="form-control"
                  style={{
                    borderColor: fieldErrors.attendees ? 'var(--danger)' : undefined,
                    background: fieldErrors.attendees ? 'rgba(239, 68, 68, 0.1)' : undefined
                  }}
                />
                {fieldErrors.attendees && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    ⚠️ {fieldErrors.attendees}
                  </div>
                )}
                {selectedResource && (
                  <div style={{
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    Room capacity: {selectedResource.capacity}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              margin: '0 0 1rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              📝 Booking Details
            </h3>
            <div className="form-group">
              <label style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                🎯 Purpose *
              </label>
              <textarea
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                rows={4}
                placeholder="Describe the purpose of this booking (e.g., Lecture on Data Structures, Team Meeting, Workshop on React)"
                className="form-control"
                style={{
                  borderColor: fieldErrors.purpose ? 'var(--danger)' : undefined,
                  background: fieldErrors.purpose ? 'rgba(239, 68, 68, 0.1)' : undefined,
                  resize: 'vertical',
                  minHeight: '100px'
                }}
              />
              {fieldErrors.purpose && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  ⚠️ {fieldErrors.purpose}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--border-radius)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>❌</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                minWidth: '200px',
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {submitting ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  Creating Booking...
                </>
              ) : (
                <>
                  <span>📅</span>
                  Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

export default BookingForm;
