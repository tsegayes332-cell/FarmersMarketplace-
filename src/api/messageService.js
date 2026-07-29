import apiClient from './apiClient';

const getChatHistory = async (userId) => {
  const response = await apiClient.get(`/messages/${userId}`);
  return response.data;
};

const getConversations = async () => {
  const response = await apiClient.get('/messages/conversations');
  return response.data;
};

export default { getChatHistory, getConversations };
