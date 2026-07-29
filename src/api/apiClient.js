import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

// Your laptop's LAN IP address - phone connects to this
const LAPTOP_LAN_IP = '192.168.10.221';

// Use LAN IP for physical device, localhost for simulator
const host = __DEV__ && Platform.OS === 'android' ? '10.0.2.2' : LAPTOP_LAN_IP;
export const BASE_URL = `http://${host}:5000/api`;
export const BACKEND_URL = `http://${host}:5000`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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
