import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import BookingCard from '../../components/member2/BookingCard';
import EditBookingModal from '../../components/member2/EditBookingModal';
import './MyBookings.css';

// Resource data - replace with Member 1's API later
const AVAILABLE_RESOURCES = [
  { id: '1', name: 'Lecture Hall A', type: 'Lecture Halls', location: 'Main Building', capacity: 2500, status: 'ACTIVE' },
  { id: '2', name: 'Computer Lab B', type: 'Labs', location: 'Tech Wing', capacity: 1500, status: 'ACTIVE' },
  { id: '3', name: 'Meeting Room 1', type: 'Meeting Rooms', location: 'Admin Block', capacity: 550, status: 'ACTIVE' },
  { id: '4', name: 'Auditorium', type: 'Lecture Halls', location: 'Main Building', capacity: 3000, status: 'ACTIVE' },
  { id: '5', name: 'Projector Room', type: 'Equipment', location: 'Media Center', capacity: 200, status: 'ACTIVE' },
  { id: '6', name: 'Seminar Hall', type: 'Meeting Rooms', location: 'Science Block', capacity: 100, status: 'ACTIVE' },
  { id: '7', name: 'Conference Room', type: 'Meeting Rooms', location: 'Admin Block', capacity: 50, status: 'ACTIVE' },
  { id: '8', name: 'Small Auditorium', type: 'Lecture Halls', location: 'New Building', capacity: 500, status: 'ACTIVE' },
];

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    location: 'All Locations',
    maxCapacity: ''
  });

  // Filter resources based on user selections
  const filteredResources = AVAILABLE_RESOURCES.filter(resource => {
    if (filters.category !== 'All' && resource.type !== filters.category) return false;
    if (filters.location !== 'All Locations' && resource.location !== filters.location) return false;
    if (filters.maxCapacity && resource.capacity > parseInt(filters.maxCapacity)) return false;
    if (filters.search && !resource.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (!user?.email) return;
    loadBookings();
  }, [user]);

  useEffect(() => {
    if (!successMessage && !error) return;
    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [successMessage, error]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings(user.email);
      setBookings(response.data || []);
    } catch (err) {
      setError('Unable to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      setBookings((current) => [response.data, ...current]);
      setSuccessMessage('Booking request created successfully.');
      setShowBookingModal(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking.';
      throw new Error(message);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
      setSuccessMessage('Booking cancelled successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
  };

  const handleUpdate = async (bookingId, updatedBookingData) => {
    try {
      await bookingService.updateBooking(bookingId, updatedBookingData);
      await loadBookings();
      setSuccessMessage('Booking updated successfully.');
      setEditingBooking(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update booking.';
      setError(message);
      throw new Error(message);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Delete this pending booking?')) return;
    try {
      await bookingService.deleteBooking(bookingId);
      await loadBookings();
      setSuccessMessage('Booking deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete booking.');
    }
  };

  const getIcon = (type) => {
    if (type === 'Lecture Halls') return '🏛️';
    if (type === 'Labs') return '💻';
    if (type === 'Meeting Rooms') return '📚';
    return '📹';
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const CATEGORIES = ['All', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Equipment'];
  const LOCATIONS = ['All Locations', 'Main Building', 'Tech Wing', 'Admin Block', 'Science Block', 'Media Center', 'New Building'];

  return (
    <div className="dashboard-container">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="dashboard-grid">
        {/* LEFT COLUMN - Find Resources */}
        <div className="left-column">
          <div className="section-header">
            <h2>🔍 Find a Resource</h2>
            <p>Search and book available campus resources</p>
          </div>

          {/* Filters */}
          <div className="resource-filters">
            <div className="filter-search">
              <input
                type="text"
                placeholder="🔍 Search by resource name or type..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-categories">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => updateFilter('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>📍 LOCATION</label>
                <select 
                  value={filters.location} 
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="filter-select"
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>📊 MAX CAPACITY (UP TO)</label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  value={filters.maxCapacity}
                  onChange={(e) => updateFilter('maxCapacity', e.target.value)}
                  className="filter-input"
                />
              </div>

              <button 
                className="clear-filters"
                onClick={() => setFilters({ search: '', category: 'All', location: 'All Locations', maxCapacity: '' })}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <div className="empty-resources">
              <p>No resources match your filters.</p>
              <p className="hint">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="resource-grid">
              {filteredResources.map(resource => (
                <div key={resource.id} className="resource-card">
                  <div className="resource-icon">{getIcon(resource.type)}</div>
                  <div className="resource-info">
                    <h3>{resource.name}</h3>
                    <p className="resource-location">📍 {resource.location}</p>
                    <p className="resource-capacity">👥 Capacity: {resource.capacity} people</p>
                    <p className="resource-status">
                      <span className={`status-dot ${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}></span>
                      {resource.status}
                    </p>
                  </div>
                  <button 
                    className="book-now-btn"
                    onClick={() => {
                      setSelectedResource(resource);
                      setShowBookingModal(true);
                    }}
                    disabled={resource.status !== 'ACTIVE'}
                  >
                    📅 Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - My Bookings */}
        <div className="right-column">
          <div className="section-header">
            <h2>📋 My Upcoming Bookings</h2>
            <p>Manage your booking requests</p>
          </div>

          {loading ? (
            <div className="loading-skeleton">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <p>You have no upcoming bookings.</p>
              <p className="empty-hint">Use the form to create your first booking.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isOwner={booking.userEmail === user?.email}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedResource && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Book {selectedResource.name}</h2>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const bookingData = {
                resourceId: selectedResource.id,
                resourceName: selectedResource.name,
                userEmail: user?.email,
                date: formData.get('date'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                purpose: formData.get('purpose'),
                attendees: parseInt(formData.get('attendees'))
              };
              try {
                await handleCreate(bookingData);
              } catch (err) {
                alert(err.message);
              }
            }}>
              <div className="modal-field">
                <label>📍 Location</label>
                <input type="text" value={selectedResource.location} disabled className="disabled-input" />
              </div>
              <div className="modal-field">
                <label>👥 Capacity</label>
                <input type="text" value={`${selectedResource.capacity} people`} disabled className="disabled-input" />
              </div>
              <div className="modal-field">
                <label>📅 Date *</label>
                <input type="date" name="date" required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>🕐 Start Time *</label>
                  <input type="time" name="startTime" required />
                </div>
                <div className="modal-field">
                  <label>🕐 End Time *</label>
                  <input type="time" name="endTime" required />
                </div>
              </div>
              <div className="modal-field">
                <label>👥 Attendees *</label>
                <input type="number" name="attendees" min="1" max={selectedResource.capacity} required defaultValue="1" />
              </div>
              <div className="modal-field">
                <label>📝 Purpose *</label>
                <textarea name="purpose" required rows="3" placeholder="Describe the purpose of this booking..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBooking && (
        <div className="modal-overlay" onClick={() => setEditingBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Booking</h2>
              <button className="modal-close" onClick={() => setEditingBooking(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedData = {
                resourceId: editingBooking.resourceId,
                resourceName: editingBooking.resourceName,
                userEmail: editingBooking.userEmail,
                date: formData.get('date'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                purpose: formData.get('purpose'),
                attendees: parseInt(formData.get('attendees'))
              };
              try {
                await handleUpdate(editingBooking.id, updatedData);
              } catch (err) {
                alert(err.message);
              }
            }}>
              <div className="modal-field">
                <label>📅 Date *</label>
                <input type="date" name="date" defaultValue={editingBooking.date} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>🕐 Start Time *</label>
                  <input type="time" name="startTime" defaultValue={editingBooking.startTime} required />
                </div>
                <div className="modal-field">
                  <label>🕐 End Time *</label>
                  <input type="time" name="endTime" defaultValue={editingBooking.endTime} required />
                </div>
              </div>
              <div className="modal-field">
                <label>👥 Attendees *</label>
                <input type="number" name="attendees" defaultValue={editingBooking.attendees} min="1" required />
              </div>
              <div className="modal-field">
                <label>📝 Purpose *</label>
                <textarea name="purpose" required rows="3" defaultValue={editingBooking.purpose} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingBooking(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;