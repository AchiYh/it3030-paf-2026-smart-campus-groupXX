import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import BookingCard from '../../components/member2/BookingCard';
import EditBookingModal from '../../components/member2/EditBookingModal';
import './MyBookings.css';

const ALL_RESOURCES = [
  // Lecture Halls
  { id: 'lh1', name: 'Lecture Hall A', roomNumber: 'A101', type: 'Lecture Halls', location: 'Main Building', capacity: 2500, status: 'ACTIVE' },
  { id: 'lh2', name: 'Lecture Hall B', roomNumber: 'A102', type: 'Lecture Halls', location: 'Main Building', capacity: 2000, status: 'ACTIVE' },
  { id: 'lh8', name: 'Engineering Hall 1', roomNumber: 'E101', type: 'Lecture Halls', location: 'Engineering Block', capacity: 1200, status: 'ACTIVE' },
  { id: 'lh15', name: 'New Lecture Hall 1', roomNumber: 'N101', type: 'Lecture Halls', location: 'New Building', capacity: 2200, status: 'ACTIVE' },
  // Labs
  { id: 'lab1', name: 'Computer Lab A', roomNumber: 'LAB01', type: 'Labs', location: 'Tech Wing', capacity: 150, status: 'ACTIVE' },
  { id: 'lab13', name: 'AI Lab', roomNumber: 'LAB13', type: 'Labs', location: 'New Building', capacity: 350, status: 'ACTIVE' },
  // Meeting Rooms
  { id: 'mr1', name: 'Conference Room', roomNumber: 'CR201', type: 'Meeting Rooms', location: 'Main Building', capacity: 200, status: 'ACTIVE' },
  { id: 'mr8', name: 'Main Auditorium', roomNumber: 'AUD101', type: 'Meeting Rooms', location: 'Auditorium', capacity: 500, status: 'ACTIVE' },
  // Equipment
  { id: 'eq1', name: 'Projector', type: 'Equipment', location: 'Media Center', totalCount: 20, availableCount: 12, status: 'ACTIVE' },
  { id: 'eq2', name: 'Camera Kit', type: 'Equipment', location: 'Media Center', totalCount: 25, availableCount: 13, status: 'ACTIVE' },
  { id: 'eq3', name: 'Laptop Set', type: 'Equipment', location: 'Tech Wing', totalCount: 100, availableCount: 60, status: 'ACTIVE' },
];

const TABS = [
  { label: 'All', value: 'ALL', icon: '📦' },
  { label: 'Pending', value: 'PENDING', icon: '⏳' },
  { label: 'Approved', value: 'APPROVED', icon: '✅' },
  { label: 'Rejected', value: 'REJECTED', icon: '❌' },
  { label: 'Cancelled', value: 'CANCELLED', icon: '🚫' },
];

function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [editingBooking, setEditingBooking] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

  const sortedBookings = [...bookings].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const filteredBookings = activeTab === 'ALL'
    ? sortedBookings
    : sortedBookings.filter(b => b.status === activeTab);

  const getTabCount = (status) => {
    if (status === 'ALL') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  // Cancel an APPROVED booking (existing endpoint DELETE /bookings/{id}/cancel)
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this approved booking?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
      setSuccessMessage('Booking cancelled successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  // Cancel a PENDING booking (new endpoint PATCH /bookings/{id}/cancel-pending)
  const handleCancelPending = async (bookingId) => {
    if (!window.confirm('Cancel this pending booking? It will be moved to Cancelled.')) return;
    try {
      await bookingService.cancelPendingBooking(bookingId);
      await loadBookings();
      setSuccessMessage('Booking cancelled successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel pending booking.');
    }
  };

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

  return (
    <div className="mb-container">
      {/* Page Header */}
      <div className="mb-header">
        <div>
          <h1 className="mb-title">📋 My Bookings</h1>
          <p className="mb-subtitle">View and manage all your booking requests</p>
        </div>
        <div className="mb-header-actions">
          <button className="mb-new-btn" onClick={() => navigate('/bookings/find')}>
            ➕ New Booking
          </button>
          <button className="mb-back-btn" onClick={() => navigate('/bookings')}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="mb-error">{error}</div>}
      {successMessage && <div className="mb-success">{successMessage}</div>}

      {/* Tabs */}
      <div className="mb-tabs">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={`mb-tab ${activeTab === tab.value ? 'mb-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            <span className="mb-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`mb-tab-count ${activeTab === tab.value ? 'mb-tab-count-active' : ''}`}>
              {getTabCount(tab.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mb-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-skeleton" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="mb-empty">
          <div className="mb-empty-icon">
            {activeTab === 'ALL' ? '📭' : TABS.find(t => t.value === activeTab)?.icon || '📭'}
          </div>
          <p>
            {activeTab === 'ALL'
              ? "You haven't made any bookings yet."
              : `No ${activeTab.toLowerCase()} bookings found.`}
          </p>
          {activeTab === 'ALL' && (
            <button className="mb-empty-cta" onClick={() => navigate('/bookings/find')}>
              Browse Resources →
            </button>
          )}
        </div>
      ) : (
        <div className="mb-list">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isOwner={booking.userEmail === user?.email}
              onEdit={handleEditClick}
              onDelete={handleCancelPending}   // For PENDING bookings, this will cancel (soft delete)
              onCancel={handleCancel}          // For APPROVED bookings, this will cancel
            />
          ))}
        </div>
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