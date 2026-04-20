import API from '../../services/api';

const BASE_URL = '/bookings';

const createBooking = async (bookingData) => {
  const response = await API.post(BASE_URL, bookingData);
  return response;
};

const getMyBookings = async (email) => {
  const response = await API.get(`${BASE_URL}/my/${encodeURIComponent(email)}`);
  return response;
};

const getBookingById = async (id) => {
  const response = await API.get(`${BASE_URL}/${id}`);
  return response;
};

const updateBooking = async (bookingId, bookingData) => {
  const response = await API.put(`${BASE_URL}/${bookingId}`, bookingData);
  return response;
};

const deleteBooking = async (bookingId) => {
  const response = await API.delete(`${BASE_URL}/${bookingId}`);
  return response;
};

const cancelBooking = async (bookingId) => {
  const response = await API.delete(`${BASE_URL}/${bookingId}/cancel`);
  return response;
};

const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
};

export default bookingService;