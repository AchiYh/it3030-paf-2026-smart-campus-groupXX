import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import BookingModal from '../../components/member2/BookingModal';
import api from '../../api';
import './FindResources.css';

// ==================== RESOURCE DATA ====================
const RESOURCES_DATA = {
  lectureHalls: [
    { id: 'lh1', name: 'Lecture Hall A', roomNumber: 'A101', type: 'Lecture Halls', location: 'Main Building', capacity: 2500, status: 'ACTIVE' },
    { id: 'lh2', name: 'Lecture Hall B', roomNumber: 'A102', type: 'Lecture Halls', location: 'Main Building', capacity: 2000, status: 'ACTIVE' },
    { id: 'lh3', name: 'Lecture Hall C', roomNumber: 'A103', type: 'Lecture Halls', location: 'Main Building', capacity: 1800, status: 'OUT_OF_SERVICE' },
    { id: 'lh4', name: 'Lecture Hall D', roomNumber: 'A104', type: 'Lecture Halls', location: 'Main Building', capacity: 1600, status: 'ACTIVE' },
    { id: 'lh5', name: 'Lecture Hall E', roomNumber: 'S201', type: 'Lecture Halls', location: 'Science Block', capacity: 1500, status: 'ACTIVE' },
    { id: 'lh6', name: 'Lecture Hall F', roomNumber: 'S202', type: 'Lecture Halls', location: 'Science Block', capacity: 1400, status: 'ACTIVE' },
    { id: 'lh7', name: 'Lecture Hall G', roomNumber: 'S203', type: 'Lecture Halls', location: 'Science Block', capacity: 1300, status: 'OUT_OF_SERVICE' },
    { id: 'lh8', name: 'Engineering Hall 1', roomNumber: 'E101', type: 'Lecture Halls', location: 'Engineering Block', capacity: 1200, status: 'ACTIVE' },
    { id: 'lh9', name: 'Engineering Hall 2', roomNumber: 'E102', type: 'Lecture Halls', location: 'Engineering Block', capacity: 1100, status: 'ACTIVE' },
    { id: 'lh10', name: 'Engineering Hall 3', roomNumber: 'E103', type: 'Lecture Halls', location: 'Engineering Block', capacity: 1000, status: 'ACTIVE' },
    { id: 'lh15', name: 'New Lecture Hall 1', roomNumber: 'N101', type: 'Lecture Halls', location: 'New Building', capacity: 2200, status: 'ACTIVE' },
    { id: 'lh16', name: 'New Lecture Hall 2', roomNumber: 'N102', type: 'Lecture Halls', location: 'New Building', capacity: 2100, status: 'ACTIVE' },
    { id: 'lh17', name: 'New Lecture Hall 3', roomNumber: 'N103', type: 'Lecture Halls', location: 'New Building', capacity: 1900, status: 'ACTIVE' },
  ],
  labs: [
    { id: 'lab1', name: 'Computer Lab A', roomNumber: 'LAB01', type: 'Labs', location: 'Tech Wing', capacity: 150, status: 'ACTIVE' },
    { id: 'lab2', name: 'Computer Lab B', roomNumber: 'LAB02', type: 'Labs', location: 'Tech Wing', capacity: 180, status: 'ACTIVE' },
    { id: 'lab3', name: 'Computer Lab C', roomNumber: 'LAB03', type: 'Labs', location: 'Tech Wing', capacity: 200, status: 'ACTIVE' },
    { id: 'lab4', name: 'Networking Lab', roomNumber: 'LAB06', type: 'Labs', location: 'Tech Wing', capacity: 145, status: 'ACTIVE' },
    { id: 'lab5', name: 'Security Lab', roomNumber: 'LAB07', type: 'Labs', location: 'Tech Wing', capacity: 250, status: 'OUT_OF_SERVICE' },
    { id: 'lab6', name: 'Electronics Lab', roomNumber: 'LAB04', type: 'Labs', location: 'Science Block', capacity: 200, status: 'ACTIVE' },
    { id: 'lab7', name: 'Physics Lab', roomNumber: 'LAB08', type: 'Labs', location: 'Science Block', capacity: 135, status: 'ACTIVE' },
    { id: 'lab8', name: 'Chemistry Lab', roomNumber: 'LAB09', type: 'Labs', location: 'Science Block', capacity: 130, status: 'ACTIVE' },
    { id: 'lab10', name: 'Robotics Lab', roomNumber: 'LAB05', type: 'Labs', location: 'Engineering Block', capacity: 230, status: 'ACTIVE' },
    { id: 'lab13', name: 'AI Lab', roomNumber: 'LAB13', type: 'Labs', location: 'New Building', capacity: 350, status: 'ACTIVE' },
    { id: 'lab14', name: 'Data Science Lab', roomNumber: 'LAB14', type: 'Labs', location: 'New Building', capacity: 600, status: 'ACTIVE' },
    { id: 'lab15', name: 'VR Lab', roomNumber: 'LAB15', type: 'Labs', location: 'New Building', capacity: 250, status: 'ACTIVE' },
  ],
  meetingRooms: [
    { id: 'mr1', name: 'Conference Room', roomNumber: 'CR201', type: 'Meeting Rooms', location: 'Main Building', capacity: 200, status: 'ACTIVE' },
    { id: 'mr2', name: 'Meeting Room 3', roomNumber: 'MR301', type: 'Meeting Rooms', location: 'Main Building', capacity: 120, status: 'ACTIVE' },
    { id: 'mr4', name: 'Seminar Room', roomNumber: 'NR101', type: 'Meeting Rooms', location: 'New Building', capacity: 250, status: 'ACTIVE' },
    { id: 'mr5', name: 'Huddle Room', roomNumber: 'NR102', type: 'Meeting Rooms', location: 'New Building', capacity: 80, status: 'ACTIVE' },
    { id: 'mr8', name: 'Main Auditorium', roomNumber: 'AUD101', type: 'Meeting Rooms', location: 'Auditorium', capacity: 500, status: 'ACTIVE' },
    { id: 'mr9', name: 'Small Auditorium', roomNumber: 'AUD102', type: 'Meeting Rooms', location: 'Auditorium', capacity: 1200, status: 'ACTIVE' },
    { id: 'mr11', name: 'Discussion Pod', roomNumber: 'DP301', type: 'Meeting Rooms', location: 'Library', capacity: 50, status: 'ACTIVE' },
    { id: 'mr12', name: 'Study Group Room', roomNumber: 'SG401', type: 'Meeting Rooms', location: 'Library', capacity: 60, status: 'ACTIVE' },
    { id: 'mr18', name: 'Board Room', roomNumber: 'BR401', type: 'Meeting Rooms', location: 'Admin Block', capacity: 15, status: 'ACTIVE' },
    { id: 'mr19', name: 'Meeting Room 1', roomNumber: 'MR101', type: 'Meeting Rooms', location: 'Admin Block', capacity: 30, status: 'ACTIVE' },
  ],
  equipment: [
    { id: 'eq1', name: 'Projector', type: 'Equipment', location: 'Media Center', totalCount: 20, availableCount: 12, status: 'ACTIVE' },
    { id: 'eq2', name: 'Camera Kit', type: 'Equipment', location: 'Media Center', totalCount: 25, availableCount: 13, status: 'ACTIVE' },
    { id: 'eq3', name: 'Laptop Set', type: 'Equipment', location: 'Tech Wing', totalCount: 100, availableCount: 60, status: 'ACTIVE' },
    { id: 'eq4', name: 'Sound System', type: 'Equipment', location: 'Auditorium', totalCount: 50, availableCount: 22, status: 'ACTIVE' },
    { id: 'eq5', name: 'Wireless Mic', type: 'Equipment', location: 'Media Center', totalCount: 25, availableCount: 12, status: 'ACTIVE' },
    { id: 'eq7', name: 'Whiteboard', type: 'Equipment', location: 'Main Building', totalCount: 20, availableCount: 15, status: 'ACTIVE' },
    { id: 'eq8', name: 'Clicker/Presenter', type: 'Equipment', location: 'Tech Wing', totalCount: 30, availableCount: 20, status: 'ACTIVE' },
    { id: 'eq9', name: 'Document Camera', type: 'Equipment', location: 'Science Block', totalCount: 25, availableCount: 5, status: 'ACTIVE' },
    { id: 'eq12', name: 'Webcam Kit', type: 'Equipment', location: 'Library', totalCount: 15, availableCount: 10, status: 'ACTIVE' },
    { id: 'eq14', name: 'Portable PA System', type: 'Equipment', location: 'Auditorium', totalCount: 3, availableCount: 0, status: 'ACTIVE' },
  ]
};

const ALL_RESOURCES = [
  ...RESOURCES_DATA.lectureHalls,
  ...RESOURCES_DATA.labs,
  ...RESOURCES_DATA.meetingRooms,
  ...RESOURCES_DATA.equipment
];

const CATEGORIES = ['All', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Equipment'];

const CATEGORY_CONFIG = {
  'All':          { icon: '🏫', color: '#6366f1' },
  'Lecture Halls':{ icon: '🏛️', color: '#7c3aed' },
  'Labs':         { icon: '💻', color: '#0891b2' },
  'Meeting Rooms':{ icon: '📚', color: '#059669' },
  'Equipment':    { icon: '📹', color: '#ea580c' },
};

const TYPE_ICONS = {
  'Lecture Halls': '🏛️',
  'Labs': '💻',
  'Meeting Rooms': '📚',
  'Equipment': '📹',
};

function FindResources() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allResources, setAllResources] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    location: 'All Locations',
    status: 'All',
  });

  useEffect(() => {
    const fetchRealResources = async () => {
      try {
        const res = await api.get('/infrastructure');
        // Transform backend Infrastructure objects to match Member 2's UI format
        const transformed = res.data.map(item => ({
          id: item.id,
          name: item.name,
          type: mapTypeToCategory(item.type),
          location: item.location,
          capacity: item.capacity,
          status: item.status === 'AVAILABLE' ? 'ACTIVE' : 'OUT_OF_SERVICE',
          availableCount: item.type === 'Equipment' ? item.capacity : null, // Assuming capacity is count for equipment
          totalCount: item.type === 'Equipment' ? item.capacity : null,
          imageUrl: item.imageUrl
        }));
        setAllResources(transformed);
        setResources(transformed);
      } catch (err) {
        console.error("Failed to fetch infrastructure", err);
        setError("Unable to load institutional assets.");
      } finally {
        setLoading(false);
      }
    };
    fetchRealResources();
  }, []);

  const mapTypeToCategory = (type) => {
    if (type === 'Room' || type === 'Hall') return 'Lecture Halls';
    if (type === 'Laboratory' || type === 'Lab') return 'Labs';
    if (type === 'Meeting Rooms' || type === 'Meeting') return 'Meeting Rooms';
    if (type === 'Equipment') return 'Equipment';
    return 'Lecture Halls'; // Default
  };

  useEffect(() => {
    filterResources();
  }, [filters, allResources]);

  const filterResources = () => {
    let filtered = [...allResources];
    if (filters.category !== 'All') {
      filtered = filtered.filter(r => r.type === filters.category);
    }
    if (filters.location !== 'All Locations') {
      filtered = filtered.filter(r => r.location === filters.location);
    }
    if (filters.status === 'Available') {
      filtered = filtered.filter(r => r.status === 'ACTIVE' && (r.type !== 'Equipment' || r.availableCount > 0));
    } else if (filters.status === 'Unavailable') {
      filtered = filtered.filter(r => r.status !== 'ACTIVE' || (r.type === 'Equipment' && r.availableCount === 0));
    }
    if (filters.search) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.location?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    setResources(filtered);
  };

  const allLocations = ['All Locations', ...new Set(allResources.map(r => r.location).filter(Boolean))];

  const getImageUrlHelper = (url) => {
    if (!url) return 'https://via.placeholder.com/400x200?text=No+Image';
    if (url.startsWith('http') || url.startsWith('blob')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
    const rootUrl = baseUrl.replace('/api', '');
    return rootUrl + url;
  };

  const handleBookNow = (resource) => {
    setSelectedResource(resource);
    setShowBookingModal(true);
    setSuccessBooking(null);
  };

  const handleCreate = async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      setSuccessBooking(response.data);
      setShowBookingModal(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking.';
      throw new Error(message);
    }
  };

  const updateFilter = (key, value) => {
    if (key === 'category') {
      setFilters(prev => ({ ...prev, category: value, location: 'All Locations' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const getAvailabilityInfo = (resource) => {
    if (resource.type === 'Equipment') {
      const pct = resource.totalCount > 0 ? (resource.availableCount / resource.totalCount) * 100 : 0;
      return { pct, label: `${resource.availableCount}/${resource.totalCount} available` };
    }
    return null;
  };

  const isBookable = (resource) => {
    if (resource.status !== 'ACTIVE') return false;
    if (resource.type === 'Equipment' && resource.availableCount === 0) return false;
    return true;
  };

  return (
    <div className="fr-container">
      {/* Page Header */}
      <div className="fr-header">
        <div>
          <h1 className="fr-title">🔍 Find Resources</h1>
          <p className="fr-subtitle">Browse and reserve campus halls, labs, rooms & equipment</p>
        </div>
        <button className="fr-back-btn" onClick={() => navigate('/bookings')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Success Banner */}
      {successBooking && (
        <div className="fr-success-banner">
          <div className="fr-success-content">
            <span className="fr-success-icon">🎉</span>
            <div>
              <div className="fr-success-title">Booking Created Successfully!</div>
              <div className="fr-success-meta">
                {successBooking.resourceName} · {successBooking.date} · {successBooking.startTime} – {successBooking.endTime}
              </div>
            </div>
          </div>
          <div className="fr-success-actions">
            <button className="fr-success-btn-primary" onClick={() => navigate('/bookings/my')}>
              View My Bookings
            </button>
            <button className="fr-success-btn-secondary" onClick={() => setSuccessBooking(null)}>
              Book Another
            </button>
          </div>
        </div>
      )}

      {error && <div className="fr-error">{error}</div>}

      {/* Filters */}
      <div className="fr-filters">
        <input
          className="fr-search"
          type="text"
          placeholder="🔍  Search by name or location..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />

        <div className="fr-category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`fr-cat-tab ${filters.category === cat ? 'active' : ''}`}
              style={filters.category === cat ? { background: CATEGORY_CONFIG[cat].color } : {}}
              onClick={() => updateFilter('category', cat)}
            >
              <span>{CATEGORY_CONFIG[cat].icon}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="fr-filter-row">
          <div className="fr-filter-group">
            <label>📍 Location</label>
            <select
              value={filters.location}
              onChange={e => updateFilter('location', e.target.value)}
              className="fr-select"
            >
              {allLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="fr-filter-group">
            <label>⚡ Status</label>
            <select
              value={filters.status}
              onChange={e => updateFilter('status', e.target.value)}
              className="fr-select"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <button className="fr-clear-btn" onClick={() => setFilters({ search: '', category: 'All', location: 'All Locations', status: 'All' })}>
            Clear All
          </button>
        </div>

        <div className="fr-results-count">
          Showing <strong>{resources.length}</strong> resource{resources.length !== 1 ? 's' : ''}
          {filters.category !== 'All' && ` in ${filters.category}`}
        </div>
      </div>

      {/* Resource Grid */}
      {resources.length === 0 ? (
        <div className="fr-empty">
          <div className="fr-empty-icon">🏫</div>
          <p>No resources match your filters.</p>
          <button onClick={() => setFilters({ search: '', category: 'All', location: 'All Locations', status: 'All' })}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="fr-grid">
          {resources.map(resource => {
            const avail = getAvailabilityInfo(resource);
            const bookable = isBookable(resource);
            return (
              <div key={resource.id} className={`fr-card ${!bookable ? 'fr-card-unavailable' : ''}`}>
                <div className="fr-card-top" style={{ backgroundImage: `url(${getImageUrlHelper(resource.imageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '160px', borderRadius: '18px 18px 0 0', position: 'relative' }}>
                  <div className="fr-card-overlay" style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', borderRadius: '0 0 0 0' }}>
                     <div className="fr-card-icon-wrap" style={{ background: `${CATEGORY_CONFIG[resource.type]?.color}`, padding: '6px', borderRadius: '8px' }}>
                        <span className="fr-card-icon" style={{ fontSize: '1rem' }}>{TYPE_ICONS[resource.type]}</span>
                     </div>
                  </div>
                  <span className={`fr-card-status ${bookable ? 'fr-status-active' : 'fr-status-inactive'}`} style={{ top: '12px', right: '12px', position: 'absolute' }}>
                    {bookable ? '● Active' : '● Unavailable'}
                  </span>
                </div>

                <div className="fr-card-body">
                  <h3 className="fr-card-name">{resource.name}</h3>
                  {resource.roomNumber && (
                    <div className="fr-card-room">🏠 Room {resource.roomNumber}</div>
                  )}
                  <div className="fr-card-location">📍 {resource.location}</div>

                  {resource.type === 'Equipment' ? (
                    <div className="fr-equip-info">
                      <div className="fr-equip-label">
                        <span>Availability</span>
                        <span style={{ color: avail.pct > 50 ? '#059669' : avail.pct > 20 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                          {avail.label}
                        </span>
                      </div>
                      <div className="fr-progress-bar">
                        <div
                          className="fr-progress-fill"
                          style={{
                            width: `${avail.pct}%`,
                            background: avail.pct > 50 ? '#10b981' : avail.pct > 20 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                      {resource.availableCount === 0 && (
                        <div className="fr-out-of-stock">❌ Out of Stock</div>
                      )}
                      {resource.availableCount > 0 && resource.availableCount <= 3 && (
                        <div className="fr-low-stock">⚠️ Only {resource.availableCount} left!</div>
                      )}
                    </div>
                  ) : (
                    <div className="fr-capacity">
                      👥 Capacity: <strong>{resource.capacity?.toLocaleString()}</strong> people
                    </div>
                  )}
                </div>

                <button
                  className={`fr-book-btn ${!bookable ? 'fr-book-btn-disabled' : ''}`}
                  onClick={() => bookable && handleBookNow(resource)}
                  disabled={!bookable}
                >
                  {!bookable ? '❌ Unavailable' : '📅 Book Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showBookingModal && (
        <BookingModal
          resource={selectedResource}
          userEmail={user?.email}
          onClose={() => setShowBookingModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default FindResources;