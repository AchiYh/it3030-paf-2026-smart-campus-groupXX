import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import ResourceFilters from '../../components/member2/ResourceFilters';
import ResourceGrid from '../../components/member2/ResourceGrid';
import BookingsList from '../../components/member2/BookingsList';
import './MyBookings.css';

// Mock resources - replace with Member 1's API when ready
const AVAILABLE_RESOURCES = [
  { id: '1', name: 'Lecture Hall A', type: 'Lecture Halls', location: 'Main Building', capacity: 2500, status: 'ACTIVE' },
  { id: '2', name: 'Lecture Hall B', type: 'Lecture Halls', location: 'Main Building', capacity: 2000, status: 'ACTIVE' },
  { id: '3', name: 'Computer Lab A', type: 'Labs', location: 'Tech Wing', capacity: 60, status: 'ACTIVE' },
  { id: '4', name: 'Computer Lab B', type: 'Labs', location: 'Tech Wing', capacity: 55, status: 'ACTIVE' },
  { id: '5', name: 'Meeting Room 1', type: 'Meeting Rooms', location: 'Admin Block', capacity: 10, status: 'ACTIVE' },
  { id: '6', name: 'Meeting Room 2', type: 'Meeting Rooms', location: 'Admin Block', capacity: 8, status: 'ACTIVE' },
  { id: '7', name: 'Conference Room', type: 'Meeting Rooms', location: 'Main Building', capacity: 20, status: 'ACTIVE' },
  { id: '8', name: 'Auditorium', type: 'Lecture Halls', location: 'Main Building', capacity: 3000, status: 'ACTIVE' },
  { id: '9', name: 'Projector', type: 'Equipment', location: 'Media Center', capacity: 1, status: 'ACTIVE' },
  { id: '10', name: 'Camera Kit', type: 'Equipment', location: 'Media Center', capacity: 1, status: 'ACTIVE' },
  { id: '11', name: 'Seminar Hall', type: 'Meeting Rooms', location: 'Science Block', capacity: 100, status: 'ACTIVE' },
  { id: '12', name: 'Electronics Lab', type: 'Labs', location: 'Science Block', capacity: 40, status: 'OUT_OF_SERVICE' },
];

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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

  const refreshBookings = () => {
    loadBookings();
  };

  // Filter resources based on user selections
  const filteredResources = AVAILABLE_RESOURCES.filter(resource => {
    if (filters.category !== 'All' && resource.type !== filters.category) return false;
    if (filters.location !== 'All Locations' && resource.location !== filters.location) return false;
    if (filters.maxCapacity && resource.capacity > parseInt(filters.maxCapacity)) return false;
    if (filters.search && !resource.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

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
          
          <ResourceFilters filters={filters} setFilters={setFilters} />
          
          <ResourceGrid 
            resources={filteredResources} 
            userEmail={user?.email}
            onBookingSuccess={refreshBookings}
            setSuccessMessage={setSuccessMessage}
            setError={setError}
          />
        </div>

        {/* RIGHT COLUMN - My Bookings */}
        <div className="right-column">
          <div className="section-header">
            <h2>📋 My Upcoming Bookings</h2>
            <p>Manage your booking requests</p>
          </div>
          
          <BookingsList 
            bookings={bookings}
            loading={loading}
            userEmail={user?.email}
            onRefresh={refreshBookings}
            setSuccessMessage={setSuccessMessage}
            setError={setError}
          />
        </div>
      </div>
    </div>
  );
}

export default MyBookings;