import apiClient from './apiClient';

const placeOrder = async (data) => {
  const response = await apiClient.post('/orders', data);
  return response.data;
};

const getMyOrders = async () => {
  const response = await apiClient.get('/orders/my');
  return response.data;
};

const trackOrder = async (id) => {
  const response = await apiClient.get(`/orders/${id}/track`);
  return response.data;
};

export default { placeOrder, getMyOrders, trackOrder };
