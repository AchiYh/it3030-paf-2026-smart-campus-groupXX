import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import BookingForm from '../../components/member2/BookingForm';
import BookingCard from '../../components/member2/BookingCard';
import EditBookingModal from '../../components/member2/EditBookingModal';

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await bookingService.getMyBookings(user.email);
      setBookings(response.data);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (bookingData) => {
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await bookingService.createBooking(bookingData);
      setBookings((current) => [response.data, ...current]);
      setSuccessMessage('Booking request created successfully.');
    } catch (createError) {
      if (createError.response) {
        const message = createError.response.data?.message || createError.response.data || 'Failed to create booking.';
        throw new Error(message);
      }
      throw new Error(createError.message || 'Failed to create booking.');
    }
  };

  const handleCancel = async (bookingId) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await bookingService.cancelBooking(bookingId);
      setBookings((current) => current.map((booking) => (
        booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking
      )));
      setSuccessMessage('Booking cancelled successfully.');
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  const handleEditClick = (booking) => {
    setError(null);
    setSuccessMessage(null);
    setEditingBooking(booking);
  };

  const handleUpdate = async (bookingId, updatedBookingData) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await bookingService.updateBooking(bookingId, updatedBookingData);
      await loadBookings();
      setSuccessMessage('Booking updated successfully.');
      setEditingBooking(null);
    } catch (updateError) {
      const message = updateError.response?.data?.message || updateError.message || 'Unable to update booking.';
      setError(message);
      throw new Error(message);
    }
  };

  const handleDelete = async (bookingId) => {
    setError(null);
    setSuccessMessage(null);

    const confirmed = window.confirm('Delete this pending booking? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await bookingService.deleteBooking(bookingId);
      await loadBookings();
      setSuccessMessage('Booking deleted successfully.');
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete booking.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem' }}>My Bookings</h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Manage your booking requests and cancel approved reservations.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', background: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', background: '#dcfce7', color: '#166534' }}>
          {successMessage}
        </div>
      )}

      <BookingForm defaultEmail={user?.email} onCreate={handleCreate} />

      <section>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Your Bookings</h2>

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p style={{ color: '#64748b' }}>You currently have no bookings. Create one using the form above.</p>
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
      </section>

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
