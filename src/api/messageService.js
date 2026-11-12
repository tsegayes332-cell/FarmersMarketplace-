import apiClient from './apiClient';

const getChatHistory = async (userId) => {
  const response = await apiClient.get(`/messages/${userId}`);
  return response.data;
};

const getConversations = async () => {
  // Try to hit an endpoint if it exists, otherwise return dummy data
  try {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  } catch(e) {
    return [
      { 
        id: '1', 
        partner: { id: 2, name: 'Abebe Farmer' }, 
        lastMessage: 'Your order is ready.', 
        timestamp: new Date().toISOString(), 
        unreadCount: 1 
      }
    ];
  }
};

export default { getChatHistory, getConversations };
