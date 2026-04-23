import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const typeOptions = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Laboratory' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
];

const getInitialFormState = (initialData) => ({
  name: initialData?.name ?? '',
  type: initialData?.type ?? 'LECTURE_HALL',
  capacity: initialData?.capacity ?? '',
  location: initialData?.location ?? '',
  availabilityWindows: initialData?.availabilityWindows ?? '',
  description: initialData?.description ?? '',
});

function ResourceForm({ initialData, onSubmit, isLoading, submitLabel }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => getInitialFormState(initialData));
  const [errors, setErrors] = useState({});

  const resolvedSubmitLabel = useMemo(() => submitLabel || 'Create Resource', [submitLabel]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const validationErrors = {};
    if (!formData.name.trim()) {
      validationErrors.name = 'Name is required.';
    }
    if (!formData.location.trim()) {
      validationErrors.location = 'Location is required.';
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      location: formData.location.trim(),
      availabilityWindows: formData.availabilityWindows.trim(),
      description: formData.description.trim(),
      capacity: formData.capacity === '' ? null : Number(formData.capacity),
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(71, 85, 105, 0.8)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '680px',
        margin: '0 auto',
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          <label
            htmlFor="name"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#cbd5e1',
              letterSpacing: '0.02em',
            }}
          >
            Resource Name <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.6)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter resource name"
            required
          />
          {errors.name && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{errors.name}</p>}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          <label
            htmlFor="type"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#cbd5e1',
              letterSpacing: '0.02em',
            }}
          >
            Resource Type <span style={{ color: '#f87171' }}>*</span>
          </label>
          <select
            id="type"
            name="type"
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.6)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            value={formData.type}
            onChange={handleChange}
            required
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          <label
            htmlFor="capacity"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#cbd5e1',
              letterSpacing: '0.02em',
            }}
          >
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.6)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            value={formData.capacity}
            onChange={handleChange}
            placeholder="e.g. 30"
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          <label
            htmlFor="location"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#cbd5e1',
              letterSpacing: '0.02em',
            }}
          >
            Location <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.6)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
            required
          />
          {errors.location && (
            <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{errors.location}</p>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginBottom: '20px',
        }}
      >
        <label
          htmlFor="availabilityWindows"
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#cbd5e1',
            letterSpacing: '0.02em',
          }}
        >
          Availability Windows
        </label>
        <input
          id="availabilityWindows"
          name="availabilityWindows"
          type="text"
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(71, 85, 105, 0.6)',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          value={formData.availabilityWindows}
          onChange={handleChange}
          placeholder="e.g. Mon-Fri 8AM-6PM"
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginBottom: '20px',
        }}
      >
        <label
          htmlFor="description"
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#cbd5e1',
            letterSpacing: '0.02em',
          }}
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(71, 85, 105, 0.6)',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontSize: '14px',
            minHeight: '100px',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional resource notes"
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(71, 85, 105, 0.4)',
        }}
      >
  <button
    type="button"
    style={{
      padding: '10px 24px',
      borderRadius: '8px',
      border: '1px solid rgba(71, 85, 105, 0.6)',
      backgroundColor: 'transparent',
      color: '#94a3b8',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
    }}
    onClick={() => navigate('/resources')}
    disabled={isLoading}
  >
    Cancel
  </button>

  <button
    type="submit"
    style={{
      padding: '10px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#4f46e5',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.7 : 1,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}
    disabled={isLoading}
  >
    {isLoading ? (
      <>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        Creating...
      </>
    ) : (
      resolvedSubmitLabel
    )}
  </button>
    </div>
    </form>
  );
}

export default ResourceForm;
// ResourceForm component - Member 1
