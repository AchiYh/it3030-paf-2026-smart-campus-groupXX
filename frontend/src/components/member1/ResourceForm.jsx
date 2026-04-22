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
      className="rounded-xl border border-indigo-500/20 bg-slate-800/70 p-6 shadow-xl backdrop-blur-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="form-group">
          <label htmlFor="name">Resource Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter resource name"
            required
          />
          {errors.name && <p className="mt-2 text-sm text-red-300">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Resource Type</label>
          <select
            id="type"
            name="type"
            className="form-control"
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

        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            className="form-control"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            className="form-control"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
            required
          />
          {errors.location && <p className="mt-2 text-sm text-red-300">{errors.location}</p>}
        </div>
      </div>

      <div className="mt-5 form-group">
        <label htmlFor="availabilityWindows">Availability Windows</label>
        <input
          id="availabilityWindows"
          name="availabilityWindows"
          type="text"
          className="form-control"
          value={formData.availabilityWindows}
          onChange={handleChange}
          placeholder="e.g. Mon-Fri 8AM-6PM"
        />
      </div>

      <div className="mt-5 form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional resource notes"
        />
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => navigate('/resources')}
    disabled={isLoading}
  >
    Cancel
  </button>

  <button
    type="submit"
    className="btn btn-primary"
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
