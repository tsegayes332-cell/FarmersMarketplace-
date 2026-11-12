import { useEffect } from 'react';
import notificationService from '../api/notificationService';
import { useSelector } from 'react-redux';
import { Alert } from 'react-native';

export default function useNotifications() {
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (!token) return;

    let unsubscribe = null;

    const setupNotifications = async () => {
      try {
        const messaging = require('@react-native-firebase/messaging').default;
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            notificationService.registerToken(fcmToken).catch(console.log);
          }
        }

        unsubscribe = messaging().onMessage(async remoteMessage => {
          Alert.alert(
            remoteMessage.notification?.title || 'New Notification', 
            remoteMessage.notification?.body || ''
          );
        });
      } catch (error) {
        console.warn('Firebase notifications unavailable (google-services not configured):', error?.message || error);
      }
    };

    setupNotifications();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [token]);
}
