import API from '../api';

const TICKET_URL = '/member3/tickets';

const ticketService = {
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
