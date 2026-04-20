import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import BookingCard from '../../components/member2/BookingCard';
import BookingModal from '../../components/member2/BookingModal';
import EditBookingModal from '../../components/member2/EditBookingModal';
import './MyBookings.css';

// Complete Resource Data with Room Numbers and Equipment Availability
const RESOURCES_DATA = {
  lectureHalls: [
    { id: 'lh1', name: 'Lecture Hall A', roomNumber: 'A101', type: 'Lecture Halls', location: 'Main Building', capacity: 2500, status: 'ACTIVE' },
    { id: 'lh2', name: 'Lecture Hall B', roomNumber: 'A102', type: 'Lecture Halls', location: 'Main Building', capacity: 2000, status: 'ACTIVE' },
    { id: 'lh3', name: 'Lecture Hall C', roomNumber: 'B101', type: 'Lecture Halls', location: 'Science Block', capacity: 1500, status: 'ACTIVE' },
    { id: 'lh4', name: 'Lecture Hall D', roomNumber: 'B102', type: 'Lecture Halls', location: 'Science Block', capacity: 1200, status: 'OUT_OF_SERVICE' },
    { id: 'lh5', name: 'Seminar Hall', roomNumber: 'C101', type: 'Lecture Halls', location: 'Admin Block', capacity: 500, status: 'ACTIVE' },
  ],
  labs: [
    { id: 'lab1', name: 'Computer Lab A', roomNumber: 'LAB01', type: 'Labs', location: 'Tech Wing', capacity: 60, status: 'ACTIVE' },
    { id: 'lab2', name: 'Computer Lab B', roomNumber: 'LAB02', type: 'Labs', location: 'Tech Wing', capacity: 55, status: 'ACTIVE' },
    { id: 'lab3', name: 'Computer Lab C', roomNumber: 'LAB03', type: 'Labs', location: 'Tech Wing', capacity: 50, status: 'ACTIVE' },
    { id: 'lab4', name: 'Electronics Lab', roomNumber: 'LAB04', type: 'Labs', location: 'Science Block', capacity: 40, status: 'ACTIVE' },
    { id: 'lab5', name: 'Robotics Lab', roomNumber: 'LAB05', type: 'Labs', location: 'Engineering Block', capacity: 30, status: 'OUT_OF_SERVICE' },
    { id: 'lab6', name: 'Networking Lab', roomNumber: 'LAB06', type: 'Labs', location: 'Tech Wing', capacity: 45, status: 'ACTIVE' },
  ],
  meetingRooms: [
    { id: 'mr1', name: 'Meeting Room 1', roomNumber: 'MR101', type: 'Meeting Rooms', location: 'Admin Block', capacity: 10, status: 'ACTIVE' },
    { id: 'mr2', name: 'Meeting Room 2', roomNumber: 'MR102', type: 'Meeting Rooms', location: 'Admin Block', capacity: 8, status: 'ACTIVE' },
    { id: 'mr3', name: 'Conference Room', roomNumber: 'CR201', type: 'Meeting Rooms', location: 'Main Building', capacity: 20, status: 'ACTIVE' },
    { id: 'mr4', name: 'Discussion Pod', roomNumber: 'DP301', type: 'Meeting Rooms', location: 'Library', capacity: 6, status: 'ACTIVE' },
    { id: 'mr5', name: 'Board Room', roomNumber: 'BR401', type: 'Meeting Rooms', location: 'Admin Block', capacity: 15, status: 'OUT_OF_SERVICE' },
  ],
  equipment: [
    { id: 'eq1', name: 'Projector', type: 'Equipment', location: 'Media Center', totalCount: 20, availableCount: 8, status: 'ACTIVE' },
    { id: 'eq2', name: 'Camera Kit', type: 'Equipment', location: 'Media Center', totalCount: 10, availableCount: 3, status: 'ACTIVE' },
    { id: 'eq3', name: 'Laptop Set', type: 'Equipment', location: 'Tech Wing', totalCount: 15, availableCount: 6, status: 'ACTIVE' },
    { id: 'eq4', name: 'Sound System', type: 'Equipment', location: 'Auditorium', totalCount: 5, availableCount: 2, status: 'ACTIVE' },
    { id: 'eq5', name: 'Wireless Mic', type: 'Equipment', location: 'Media Center', totalCount: 25, availableCount: 12, status: 'ACTIVE' },
    { id: 'eq6', name: 'Tripod', type: 'Equipment', location: 'Media Center', totalCount: 15, availableCount: 10, status: 'OUT_OF_SERVICE' },
  ]
};

const ALL_RESOURCES = [
  ...RESOURCES_DATA.lectureHalls,
  ...RESOURCES_DATA.labs,
  ...RESOURCES_DATA.meetingRooms,
  ...RESOURCES_DATA.equipment
];

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState(ALL_RESOURCES);
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

  useEffect(() => {
    if (!user?.email) return;
    loadBookings();
  }, [user]);

  useEffect(() => {
    filterResources();
  }, [filters]);

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

  const filterResources = () => {
    let filtered = [...ALL_RESOURCES];
    
    if (filters.category !== 'All') {
      filtered = filtered.filter(r => r.type === filters.category);
    }
    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(r => r.location === filters.location);
    }
    if (filters.maxCapacity) {
      filtered = filtered.filter(r => r.capacity <= parseInt(filters.maxCapacity));
    }
    if (filters.search) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    
    setResources(filtered);
  };

  const handleCreate = async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      setBookings((current) => [response.data, ...current]);
      setSuccessMessage('Booking request created successfully!');
      setShowBookingModal(false);
      
      if (selectedResource?.type === 'Equipment') {
        const updatedResources = resources.map(r => {
          if (r.id === selectedResource.id) {
            return { ...r, availableCount: r.availableCount - (bookingData.quantity || 1) };
          }
          return r;
        });
        setResources(updatedResources);
      }
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

  const handleBookNow = (resource) => {
    setSelectedResource(resource);
    setShowBookingModal(true);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const CATEGORIES = ['All', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Equipment'];
  const LOCATIONS = ['All Locations', 'Main Building', 'Tech Wing', 'Admin Block', 'Science Block', 'Media Center', 'Library', 'Engineering Block', 'Auditorium'];

  return (
    <div className="dashboard-container">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="dashboard-grid">
        <div className="left-column">
          <div className="section-header">
            <h2>🔍 Find a Resource</h2>
            <p>Search and book available campus resources</p>
          </div>

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

          {resources.length === 0 ? (
            <div className="empty-resources">
              <p>No resources match your filters.</p>
              <p className="hint">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="resource-grid">
              {resources.map(resource => (
                <div key={resource.id} className="resource-card">
                  <div className="resource-icon">
                    {resource.type === 'Lecture Halls' && '🏛️'}
                    {resource.type === 'Labs' && '💻'}
                    {resource.type === 'Meeting Rooms' && '📚'}
                    {resource.type === 'Equipment' && '📹'}
                  </div>
                  <div className="resource-info">
                    <h3>{resource.name}</h3>
                    {resource.roomNumber && (
                      <p className="resource-room">🏠 Room: {resource.roomNumber}</p>
                    )}
                    <p className="resource-location">📍 {resource.location}</p>
                    <p className="resource-capacity">👥 Capacity: {resource.capacity} people</p>
                    
                    {/* Equipment Availability - Enhanced with UNAVAILABLE state */}
                    {resource.type === 'Equipment' && (
                      <div className={`equipment-availability ${resource.status !== 'ACTIVE' ? 'unavailable' : ''}`}>
                        {resource.status === 'ACTIVE' ? (
                          <>
                            <p>📊 Available: {resource.availableCount} out of {resource.totalCount}</p>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${(resource.availableCount / resource.totalCount) * 100}%` }}
                              ></div>
                            </div>
                            {resource.availableCount <= 3 && resource.availableCount > 0 && (
                              <div className="low-stock-warning">⚠️ Only {resource.availableCount} items left!</div>
                            )}
                            {resource.availableCount === 0 && (
                              <div className="out-of-stock-warning">❌ Out of Stock - Currently Unavailable</div>
                            )}
                          </>
                        ) : (
                          <>
                            <p>❌ UNAVAILABLE</p>
                            <p className="unavailable-reason">This equipment is currently out of service.</p>
                          </>
                        )}
                      </div>
                    )}
                    
                    {/* Status Badge - Only show for non-equipment resources */}
                    {resource.type !== 'Equipment' && (
                      <p className="resource-status">
                        <span className={`status-dot ${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}></span>
                        {resource.status}
                      </p>
                    )}
                  </div>
                  <button 
                    className="book-now-btn"
                    onClick={() => handleBookNow(resource)}
                    disabled={resource.status !== 'ACTIVE' || (resource.type === 'Equipment' && resource.availableCount === 0)}
                  >
                    {resource.status !== 'ACTIVE' ? '❌ Unavailable' : '📅 Book Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

      {showBookingModal && (
        <BookingModal
          resource={selectedResource}
          userEmail={user?.email}
          onClose={() => setShowBookingModal(false)}
          onCreate={handleCreate}
        />
      )}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default MyBookings;