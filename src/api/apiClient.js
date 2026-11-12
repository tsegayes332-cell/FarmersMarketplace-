import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

export const BASE_URL = 'https://spas-serve-mechanical-presents.trycloudflare.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        config.headers.Authorization = `Bearer ${credentials.password}`;
      }
    } catch (error) {
      console.error('Error fetching token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
