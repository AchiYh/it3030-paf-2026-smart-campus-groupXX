import API from '../api';

const AUTH_URL = '/auth';

const authService = {
  login: (email, password) =>
    API.post(`${AUTH_URL}/login`, { email, password }),

  register: (fullName, email, password) =>
    API.post(`${AUTH_URL}/register`, { fullName, email, password }),

  oauthCallback: (email, fullName, provider, providerId) =>
    API.post(`${AUTH_URL}/oauth2/callback`, { email, fullName, provider, providerId }),

  getCurrentUser: () => API.get(`${AUTH_URL}/me`),

  /**
   * Initiates Google OAuth2 login flow.
   * In a real implementation, this would redirect to the OAuth2 provider.
   */
  loginWithGoogle: () => {
    window.location.href = '/api/oauth2/authorization/google';
  },
};

export default authService;
