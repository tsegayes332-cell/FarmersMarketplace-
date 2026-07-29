import apiClient from './apiClient';

const initiatePayment = async (orderId) => {
  const response = await apiClient.post('/payments/initiate', { orderId });
  return response.data;
};

export default { initiatePayment };
