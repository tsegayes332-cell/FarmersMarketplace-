import apiClient from './apiClient';

const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

const markAsRead = async (id) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all');
  return response.data;
};

const registerToken = async (fcmToken) => {
  // If your backend supports storing the FCM token
  try {
    const response = await apiClient.post('/notifications/register-token', { fcmToken });
    return response.data;
  } catch(e) {
    console.log('FCM token reg not implemented on backend');
  }
};

export default { getNotifications, markAsRead, markAllAsRead, registerToken };
