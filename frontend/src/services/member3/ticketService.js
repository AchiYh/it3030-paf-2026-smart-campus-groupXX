import API from '../api';

const TICKET_URL = '/member3/tickets';

const cleanParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

const ticketService = {
  getTickets: (params = {}) => API.get(TICKET_URL, { params: cleanParams(params) }),

  getTicketById: (ticketId) => API.get(`${TICKET_URL}/${ticketId}`),

  assignTechnician: (ticketId, payload) => API.patch(`${TICKET_URL}/${ticketId}/assign-technician`, payload),

  resolveTicket: (ticketId, payload) => API.patch(`${TICKET_URL}/${ticketId}/resolve`, payload),

  closeTicket: (ticketId, payload) => API.patch(`${TICKET_URL}/${ticketId}/close`, payload),

  rejectTicket: (ticketId, payload) => API.patch(`${TICKET_URL}/${ticketId}/reject`, payload),

  getComments: (ticketId) => API.get(`${TICKET_URL}/${ticketId}/comments`),

  addComment: (ticketId, payload) => API.post(`${TICKET_URL}/${ticketId}/comments`, payload),

  deleteComment: (ticketId, commentId) => API.delete(`${TICKET_URL}/${ticketId}/comments/${commentId}`),

  createTicket: (payload) => API.post(TICKET_URL, payload),

  uploadTicketImage: (ticketId, file, uploadedBy) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);

    return API.post(`${TICKET_URL}/${ticketId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default ticketService;
