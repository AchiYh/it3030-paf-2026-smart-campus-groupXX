import axios from 'axios';

const RESOURCE_BASE_URL = 'http://localhost:8081/api/resources';

const resourceAPI = axios.create({
  baseURL: RESOURCE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

export const getAllResources = () =>
  resourceAPI.get('', getAuthConfig());

export const getResourceById = (id) =>
  resourceAPI.get(`/${id}`, getAuthConfig());

export const searchResources = (params = {}) => {
  const queryParams = {};

  if (params.type) queryParams.type = params.type;
  if (params.location && params.location.trim()) queryParams.location = params.location.trim();
  if (params.minCapacity !== null && params.minCapacity !== undefined && params.minCapacity !== '') {
    queryParams.minCapacity = params.minCapacity;
  }
  if (params.status) queryParams.status = params.status;

  return resourceAPI.get('/search', {
    ...getAuthConfig(),
    params: queryParams,
  });
};
// Resource API service - Member 1
