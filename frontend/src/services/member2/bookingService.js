import API from '../../services/api';

const BASE_URL = '/bookings';
const EQUIPMENT_URL = '/equipment';

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

// Admin approve/reject (if not already present)
const approveBooking = async (bookingId) => {
  const response = await API.patch(`${BASE_URL}/${bookingId}/approve`);
  return response;
};

const rejectBooking = async (bookingId, reason) => {
  const response = await API.patch(`${BASE_URL}/${bookingId}/reject`, { reason });
  return response;
};

// Equipment API
const getAllEquipment = async () => {
  const response = await API.get(EQUIPMENT_URL);
  return response;
};

const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getAllEquipment,
};

export default bookingService;