import apiClient from './apiClient';

const placeOrder = async (data) => {
  const response = await apiClient.post('/orders', data);
  return response.data;
};

const getMyOrders = async () => {
  const response = await apiClient.get('/orders/my');
  return response.data;
};

const getFarmerOrders = async () => {
  const response = await apiClient.get('/orders/farmer');
  return response.data;
};

const updateOrderStatus = async (id, status) => {
  const response = await apiClient.put(`/orders/${id}/status`, { status });
  return response.data;
};

const trackOrder = async (id) => {
  const response = await apiClient.get(`/orders/${id}/track`);
  return response.data;
};

export default { placeOrder, getMyOrders, getFarmerOrders, updateOrderStatus, trackOrder };
