import API from '../../services/api';

const BASE_URL = '/api/bookings';

const createBooking = async (bookingData) => {
  return API.post(BASE_URL, bookingData);
};

const getMyBookings = async (email) => {
  return API.get(`${BASE_URL}/my/${encodeURIComponent(email)}`);
};

const cancelBooking = async (bookingId) => {
  return API.delete(`${BASE_URL}/${bookingId}/cancel`);
};

const bookingService = {
  createBooking,
  getMyBookings,
  cancelBooking,
};

export default bookingService;
