import React, { useState } from 'react';
import BookingCard from './BookingCard';
import EditBookingModal from './EditBookingModal';
import bookingService from '../../services/member2/bookingService';

// Mock resource data - you should get this from Member 1's API
const getResourceDetails = (resourceName) => {
  const resources = {
    'Lecture Hall A': { location: 'Main Building', capacity: 2500 },
    'Lecture Hall B': { location: 'Main Building', capacity: 2000 },
    'Computer Lab A': { location: 'Tech Wing', capacity: 60 },
    'Computer Lab B': { location: 'Tech Wing', capacity: 55 },
    'Meeting Room 1': { location: 'Admin Block', capacity: 10 },
    'Meeting Room 2': { location: 'Admin Block', capacity: 8 },
    'Conference Room': { location: 'Main Building', capacity: 20 },
    'Auditorium': { location: 'Main Building', capacity: 3000 },
    'Projector': { location: 'Media Center', capacity: 1 },
    'Camera Kit': { location: 'Media Center', capacity: 1 },
    'Seminar Hall': { location: 'Science Block', capacity: 100 },
  };
  return resources[resourceName] || { location: 'Main Building', capacity: 100 };
};

function BookingsList({ bookings, loading, userEmail, onRefresh, setSuccessMessage, setError }) {
  const [editingBooking, setEditingBooking] = useState(null);

  const handleEdit = (booking) => {
    // Add resource details to the booking before editing
    const resourceDetails = getResourceDetails(booking.resourceName);
    const bookingWithDetails = {
      ...booking,
      resourceLocation: resourceDetails.location,
      resourceCapacity: resourceDetails.capacity
    };
    setEditingBooking(bookingWithDetails);
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Delete this pending booking? This action cannot be undone.')) return;
    try {
      await bookingService.deleteBooking(bookingId);
      setSuccessMessage('Booking deleted successfully');
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete booking');
    }
  };

  const handleUpdate = async (bookingId, updatedData) => {
    try {
      await bookingService.updateBooking(bookingId, updatedData);
      setSuccessMessage('Booking updated successfully');
      onRefresh();
      setEditingBooking(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update booking';
      setError(message);
      throw new Error(message);
    }
  };

  if (loading) {
    return <div className="loading-skeleton">Loading your bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <p>You have no upcoming bookings.</p>
        <p className="empty-hint">Use the form to create your first booking.</p>
      </div>
    );
  }

  return (
    <>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          isOwner={booking.userEmail === userEmail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={onRefresh}
          setSuccessMessage={setSuccessMessage}
          setError={setError}
        />
      ))}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}

export default BookingsList;