import API from '../../services/api';

const BASE_URL = '/bookings';

const createBooking = async (bookingData) => {
  return API.post(BASE_URL, bookingData);
};

const getMyBookings = async (email) => {
  return API.get(`${BASE_URL}/my/${encodeURIComponent(email)}`);
};

const updateBooking = async (bookingId, bookingData) => {
  return API.put(`${BASE_URL}/${bookingId}`, bookingData);
};

const deleteBooking = async (bookingId) => {
  return API.delete(`${BASE_URL}/${bookingId}`);
};

const cancelBooking = async (bookingId) => {
  return API.delete(`${BASE_URL}/${bookingId}/cancel`);
};

const bookingService = {
  createBooking,
  getMyBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
};

export default bookingService;
