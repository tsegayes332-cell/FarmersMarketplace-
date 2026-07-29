import apiClient from './apiClient';

const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

const register = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

const updateProfile = async (data) => {
  const response = await apiClient.put('/auth/profile', data);
  return response.data;
};

export default { login, register, getProfile, updateProfile };
