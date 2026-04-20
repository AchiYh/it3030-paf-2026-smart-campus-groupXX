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

// ============ CATEGORY-SPECIFIC FILTER CONFIGURATIONS ============

// Location options for each category
const CATEGORY_LOCATIONS = {
  'Lecture Halls': ['All Locations', 'Main Building', 'New Building', 'Science Block', 'Engineering Block'],
  'Labs': ['All Locations', 'Tech Wing', 'Science Block', 'Engineering Block', 'New Building'],
  'Meeting Rooms': ['All Locations', 'Main Building', 'New Building', 'Auditorium', 'Library', 'Media Center', 'Admin Block'],
  'Equipment': [], // No location dropdown for equipment
  'All': [] // No location dropdown for All
};

// Room/Lab/Meeting Room mapping for each category and location
const CATEGORY_ROOM_MAPPING = {
  'Lecture Halls': {
    'Main Building': [
      { id: 'room_a101', name: 'A101', capacity: 2500, resourceId: 'lh1' },
      { id: 'room_a102', name: 'A102', capacity: 2000, resourceId: 'lh2' },
      { id: 'room_a103', name: 'A103', capacity: 1800, resourceId: null },
      { id: 'room_a104', name: 'A104', capacity: 1600, resourceId: null },
    ],
    'New Building': [
      { id: 'room_n101', name: 'N101', capacity: 2200, resourceId: null },
      { id: 'room_n102', name: 'N102', capacity: 2100, resourceId: null },
      { id: 'room_n103', name: 'N103', capacity: 1900, resourceId: null },
    ],
    'Science Block': [
      { id: 'room_s201', name: 'S201', capacity: 1500, resourceId: 'lh3' },
      { id: 'room_s202', name: 'S202', capacity: 1400, resourceId: null },
      { id: 'room_s203', name: 'S203', capacity: 1300, resourceId: null },
    ],
    'Engineering Block': [
      { id: 'room_e301', name: 'E301', capacity: 1200, resourceId: null },
      { id: 'room_e302', name: 'E302', capacity: 1100, resourceId: null },
    ],
  },
  'Labs': {
    'Tech Wing': [
      { id: 'lab_lab01', name: 'LAB01 - Computer Lab A', capacity: 60, resourceId: 'lab1' },
      { id: 'lab_lab02', name: 'LAB02 - Computer Lab B', capacity: 55, resourceId: 'lab2' },
      { id: 'lab_lab03', name: 'LAB03 - Computer Lab C', capacity: 50, resourceId: 'lab3' },
      { id: 'lab_lab06', name: 'LAB06 - Networking Lab', capacity: 45, resourceId: 'lab6' },
    ],
    'Science Block': [
      { id: 'lab_lab04', name: 'LAB04 - Electronics Lab', capacity: 40, resourceId: 'lab4' },
      { id: 'lab_lab07', name: 'LAB07 - Physics Lab', capacity: 35, resourceId: null },
    ],
    'Engineering Block': [
      { id: 'lab_lab05', name: 'LAB05 - Robotics Lab', capacity: 30, resourceId: 'lab5' },
      { id: 'lab_lab08', name: 'LAB08 - Mechanical Lab', capacity: 25, resourceId: null },
    ],
    'New Building': [
      { id: 'lab_lab09', name: 'LAB09 - AI Lab', capacity: 65, resourceId: null },
      { id: 'lab_lab10', name: 'LAB10 - Data Science Lab', capacity: 60, resourceId: null },
    ],
  },
  'Meeting Rooms': {
    'Main Building': [
      { id: 'mr_cr201', name: 'CR201 - Conference Room', capacity: 20, resourceId: 'mr3' },
      { id: 'mr_mr301', name: 'MR301 - Meeting Room 3', capacity: 12, resourceId: null },
    ],
    'New Building': [
      { id: 'mr_nr101', name: 'NR101 - Seminar Room', capacity: 25, resourceId: null },
      { id: 'mr_nr102', name: 'NR102 - Huddle Room', capacity: 8, resourceId: null },
    ],
    'Auditorium': [
      { id: 'mr_aud101', name: 'AUD101 - Main Auditorium', capacity: 500, resourceId: null },
      { id: 'mr_aud102', name: 'AUD102 - Small Auditorium', capacity: 200, resourceId: null },
    ],
    'Library': [
      { id: 'mr_dp301', name: 'DP301 - Discussion Pod', capacity: 6, resourceId: 'mr4' },
      { id: 'mr_sg401', name: 'SG401 - Study Group Room', capacity: 10, resourceId: null },
    ],
    'Media Center': [
      { id: 'mr_mc101', name: 'MC101 - Media Studio', capacity: 15, resourceId: null },
      { id: 'mr_mc102', name: 'MC102 - Recording Room', capacity: 5, resourceId: null },
    ],
    'Admin Block': [
      { id: 'mr_br401', name: 'BR401 - Board Room', capacity: 15, resourceId: 'mr5' },
      { id: 'mr_mr101', name: 'MR101 - Meeting Room 1', capacity: 10, resourceId: 'mr1' },
      { id: 'mr_mr102', name: 'MR102 - Meeting Room 2', capacity: 8, resourceId: 'mr2' },
    ],
  },
  'Equipment': {}, // No room mapping for equipment
  'All': {} // No room mapping for All
};

// Equipment list for Equipment category
const EQUIPMENT_LIST = [
  { id: 'eq1', name: 'Projector', available: 8, total: 20 },
  { id: 'eq2', name: 'Camera Kit', available: 3, total: 10 },
  { id: 'eq3', name: 'Laptop Set', available: 6, total: 15 },
  { id: 'eq4', name: 'Sound System', available: 2, total: 5 },
  { id: 'eq5', name: 'Wireless Mic', available: 12, total: 25 },
  { id: 'eq6', name: 'Tripod', available: 10, total: 15 },
  { id: 'eq7', name: 'Whiteboard', available: 15, total: 20 },
  { id: 'eq8', name: 'Clicker/Presenter', available: 20, total: 30 },
];

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
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    location: 'All Locations',
    selectedRoom: 'All',
    selectedEquipment: 'All',
    maxCapacity: ''
  });

  useEffect(() => {
    if (!user?.email) return;
    loadBookings();
  }, [user]);

  useEffect(() => {
    filterResources();
  }, [filters, showAvailableOnly]);

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
    
    if (filters.category === 'Equipment' && filters.selectedEquipment !== 'All') {
      filtered = filtered.filter(r => r.id === filters.selectedEquipment);
    }
    
    if (filters.category !== 'Equipment' && filters.category !== 'All') {
      if (filters.location !== 'All Locations') {
        filtered = filtered.filter(r => r.location === filters.location);
      }
      
      if (filters.selectedRoom !== 'All' && filters.location !== 'All Locations') {
        const roomInfo = CATEGORY_ROOM_MAPPING[filters.category]?.[filters.location]?.find(r => r.id === filters.selectedRoom);
        if (roomInfo && roomInfo.resourceId) {
          filtered = filtered.filter(r => r.id === roomInfo.resourceId);
        } else if (roomInfo && !roomInfo.resourceId) {
          filtered = [];
        }
      }
    }
    
    if (filters.maxCapacity && (filters.category === 'All' || filters.category === 'Equipment')) {
      filtered = filtered.filter(r => r.capacity <= parseInt(filters.maxCapacity));
    }
    
    if (filters.search) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    
    if (filters.category === 'Equipment' && showAvailableOnly) {
      filtered = filtered.filter(r => r.availableCount > 0);
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

  // UPDATED: Attach resourceDetails to the booking being edited
  const handleEditClick = (booking) => {
    const resource = ALL_RESOURCES.find(r => r.id === booking.resourceId);
    if (resource) {
      setEditingBooking({ ...booking, resourceDetails: resource });
    } else {
      setEditingBooking(booking);
    }
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
    if (key === 'category') {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        location: 'All Locations',
        selectedRoom: 'All',
        selectedEquipment: 'All',
        maxCapacity: ''
      }));
      setShowAvailableOnly(false);
    } else if (key === 'location') {
      setFilters(prev => ({ ...prev, [key]: value, selectedRoom: 'All' }));
    } else if (key === 'selectedEquipment') {
      setFilters(prev => ({ ...prev, [key]: value }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const CATEGORIES = ['All', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Equipment'];
  
  const locationOptions = CATEGORY_LOCATIONS[filters.category] || [];
  const showLocationDropdown = locationOptions.length > 0 && filters.category !== 'All';
  
  const roomMapping = CATEGORY_ROOM_MAPPING[filters.category];
  const roomNumbers = (roomMapping && filters.location !== 'All Locations' && roomMapping[filters.location]) 
    ? roomMapping[filters.location] 
    : [];
  const showRoomNumbers = showLocationDropdown && filters.location !== 'All Locations' && roomNumbers.length > 0;
  
  const showEquipmentList = filters.category === 'Equipment';
  const showMaxCapacity = filters.category === 'All' || filters.category === 'Equipment';

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

            {showLocationDropdown && (
              <div className="filter-row">
                <div className="filter-group">
                  <label>📍 SELECT LOCATION</label>
                  <select 
                    value={filters.location} 
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="filter-select"
                  >
                    {locationOptions.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {showRoomNumbers && (
              <div className="room-numbers-section">
                <div className="room-numbers-title">
                  🏠 {filters.category === 'Lecture Halls' ? 'ROOM NUMBERS' : filters.category === 'Labs' ? 'LAB NUMBERS' : 'MEETING ROOMS'} ({filters.location})
                </div>
                <div className="room-chips">
                  <button
                    className={`room-chip ${filters.selectedRoom === 'All' ? 'active' : ''}`}
                    onClick={() => updateFilter('selectedRoom', 'All')}
                  >
                    All
                  </button>
                  {roomNumbers.map(room => (
                    <button
                      key={room.id}
                      className={`room-chip ${filters.selectedRoom === room.id ? 'active' : ''}`}
                      onClick={() => updateFilter('selectedRoom', room.id)}
                    >
                      {room.name} {room.capacity ? `(Capacity: ${room.capacity})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showEquipmentList && (
              <div className="equipment-list-section">
                <div className="equipment-list-header">
                  <div className="equipment-list-title">📹 EQUIPMENT LIST</div>
                  <label className="available-only-toggle">
                    <input
                      type="checkbox"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    />
                    Show Available Only
                  </label>
                </div>
                <div className="equipment-chips">
                  <button
                    className={`equipment-chip ${filters.selectedEquipment === 'All' ? 'active' : ''}`}
                    onClick={() => updateFilter('selectedEquipment', 'All')}
                  >
                    All
                  </button>
                  {EQUIPMENT_LIST.map(equipment => (
                    <button
                      key={equipment.id}
                      className={`equipment-chip ${filters.selectedEquipment === equipment.id ? 'active' : ''} ${equipment.available === 0 ? 'disabled' : ''}`}
                      onClick={() => equipment.available > 0 && updateFilter('selectedEquipment', equipment.id)}
                      disabled={equipment.available === 0}
                    >
                      {equipment.name} ({equipment.available} available)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showMaxCapacity && (
              <div className="filter-row">
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
              </div>
            )}

            <div className="filter-row" style={{ marginTop: '1rem' }}>
              <button 
                className="clear-filters"
                onClick={() => {
                  setFilters({ search: '', category: 'All', location: 'All Locations', selectedRoom: 'All', selectedEquipment: 'All', maxCapacity: '' });
                  setShowAvailableOnly(false);
                }}
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