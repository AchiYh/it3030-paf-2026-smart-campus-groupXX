import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import BookingModal from '../../components/member2/BookingModal';
import api from '../../api';
import './FindResources.css';

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
        const transformed = res.data.map(item => ({
          id: item.id,
          name: item.name,
          type: mapTypeToCategory(item.type),
          location: item.location,
          capacity: item.capacity,
          status: item.status === 'AVAILABLE' ? 'ACTIVE' : 'OUT_OF_SERVICE',
          imageUrl: item.imageUrl,
          roomNumber: item.roomNumber || ''
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
    const t = String(type || '').toLowerCase();
    if (t.includes('room') || t.includes('hall')) return 'Lecture Halls';
    if (t.includes('lab')) return 'Labs';
    if (t.includes('meeting')) return 'Meeting Rooms';
    if (t.includes('equip')) return 'Equipment';
    return 'Lecture Halls';
  };

  useEffect(() => {
    let filtered = [...allResources];
    if (filters.category !== 'All') filtered = filtered.filter(r => r.type === filters.category);
    if (filters.location !== 'All Locations') filtered = filtered.filter(r => r.location === filters.location);
    if (filters.status === 'Available') filtered = filtered.filter(r => r.status === 'ACTIVE');
    else if (filters.status === 'Unavailable') filtered = filtered.filter(r => r.status !== 'ACTIVE');
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(s) || r.location?.toLowerCase().includes(s));
    }
    setResources(filtered);
  }, [filters, allResources]);

  const allLocations = ['All Locations', ...new Set(allResources.map(r => r.location).filter(Boolean))];

  const getImageUrlHelper = (url) => {
    if (!url) return 'https://via.placeholder.com/100?text=Asset';
    if (url.startsWith('http') || url.startsWith('blob')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
    return baseUrl.replace('/api', '') + url;
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
      throw new Error(err.response?.data?.message || 'Failed to create booking.');
    }
  };

  const isBookable = (resource) => resource.status === 'ACTIVE';

  return (
    <div className="fr-container">
      <div className="fr-header">
        <div>
          <h1 className="fr-title">🔍 Campus Infrastructure Registry</h1>
          <p className="fr-subtitle">Scan and reserve institutional rooms, labs, and equipment</p>
        </div>
        <button className="fr-back-btn" onClick={() => navigate('/bookings')}>← Back</button>
      </div>

      {successBooking && (
        <div className="fr-success-banner" style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <div style={{ fontWeight: 800, color: '#166534' }}>Booking Created Successfully!</div>
              <div style={{ fontSize: '0.85rem', color: '#15803d' }}>{successBooking.resourceName} protocol initiated.</div>
            </div>
          </div>
          <button className="fr-success-btn-primary" onClick={() => navigate('/bookings/my')} style={{ padding: '10px 20px', borderRadius: '10px', background: '#166534', color: '#fff', border: 0, fontWeight: 800, cursor: 'pointer' }}>View My Bookings</button>
        </div>
      )}

      {error && <div className="fr-error" style={{ background: '#fef2f2', color: '#991b1b', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 600 }}>{error}</div>}

      {/* Filters Section */}
      <div className="fr-filters" style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '20px' }}>
           <input
             className="fr-search"
             type="text"
             placeholder="Search by name or location..."
             value={filters.search}
             onChange={e => setFilters({...filters, search: e.target.value})}
             style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
           />
           <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
             {['All', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Equipment'].map(cat => (
               <button
                 key={cat}
                 onClick={() => setFilters({...filters, category: cat})}
                 style={{
                   padding: '10px 18px',
                   borderRadius: '10px',
                   border: '0',
                   background: filters.category === cat ? CATEGORY_CONFIG[cat].color : '#f8fafc',
                   color: filters.category === cat ? '#fff' : '#64748b',
                   fontWeight: 800,
                   fontSize: '0.75rem',
                   cursor: 'pointer'
                 }}
               >
                 {CATEGORY_CONFIG[cat].icon} {cat}
               </button>
             ))}
           </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
           <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>LOCATION REGISTRY</label>
              <select 
                value={filters.location} 
                onChange={e => setFilters({...filters, location: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}
              >
                {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
           </div>
           <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>AVAILABILITY STATUS</label>
              <select 
                value={filters.status} 
                onChange={e => setFilters({...filters, status: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontWeight: 600 }}
              >
                <option value="All">All Status</option>
                <option value="Available">Available Only</option>
                <option value="Unavailable">Unavailable Only</option>
              </select>
           </div>
           <button 
             onClick={() => setFilters({search: '', category: 'All', location: 'All Locations', status: 'All'})}
             style={{ alignSelf: 'flex-end', padding: '12px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer' }}
           >
             RESET FILTERS
           </button>
        </div>
      </div>

      {/* THE TABLE - ELITE SCANNABLE VERSION */}
      {loading ? (
        <div className="loading-state">Synchronizing registry...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '64px', background: '#fff', borderRadius: '24px' }}>
          <div style={{ fontSize: '3rem' }}>🏫</div>
          <p style={{ fontWeight: 800, color: '#1a2a44' }}>No resources found in the registry.</p>
        </div>
      ) : (
        <div className="info-card" style={{ padding: '0', overflow: 'hidden', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={thStyle}>IDENTITY</th>
                <th style={thStyle}>SPECIFICATIONS</th>
                <th style={thStyle}>REGISTRY LOCATION</th>
                <th style={thStyle}>STATUS</th>
                <th style={thStyle}>PROTOCOL</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => {
                const bookable = isBookable(resource);
                return (
                  <tr key={resource.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                          <img 
                            src={getImageUrlHelper(resource.imageUrl)} 
                            alt={resource.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=Asset'; }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#1a2a44', fontSize: '0.9rem' }}>{resource.name}</div>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>{TYPE_ICONS[resource.type]} {resource.type}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '0.85rem', color: '#1a2a44', fontWeight: 700 }}>{resource.capacity?.toLocaleString()} PAX Capacity</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Operational: 08:00 - 18:00</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>📍 {resource.location}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        fontSize: '0.65rem', 
                        fontWeight: 800,
                        background: bookable ? '#dcfce7' : '#fee2e2',
                        color: bookable ? '#166534' : '#991b1b'
                      }}>
                        {bookable ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => bookable && handleBookNow(resource)}
                        disabled={!bookable}
                        style={{ 
                          padding: '10px 20px', 
                          borderRadius: '10px', 
                          background: bookable ? '#1a2a44' : '#f1f5f9', 
                          color: bookable ? '#fff' : '#94a3b8', 
                          border: '0', 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          cursor: bookable ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {bookable ? 'BOOK NOW' : 'LOCKED'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

const thStyle = { padding: '20px 24px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' };
const tdStyle = { padding: '20px 24px' };

export default FindResources;