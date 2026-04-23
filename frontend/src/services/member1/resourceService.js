import axios from 'axios';

const RESOURCE_BASE_URL = 'http://localhost:8081/api/resources';
const BASE_URL = RESOURCE_BASE_URL;

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

export const deleteResource = (id) =>
  resourceAPI.delete(`/${id}`, getAuthConfig());

export const createResource = (data) =>
  resourceAPI.post('', data, getAuthConfig());

export const updateResource = (id, data) => {
  const token = localStorage.getItem('token');
  return axios.put(`${BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateResourceStatus = (id, status) => {
  const token = localStorage.getItem('token');
  return axios.patch(
    `${BASE_URL}/${id}/status?status=${status}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

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
