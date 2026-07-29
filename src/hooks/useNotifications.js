import { useEffect } from 'react';
import notificationService from '../api/notificationService';
import { useSelector } from 'react-redux';
import { Alert } from 'react-native';

let messaging = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
  console.log('Firebase not available, notifications disabled');
}

export default function useNotifications() {
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (!token || !messaging) return;

    const requestUserPermission = async () => {
      try {
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
      } catch (e) {
        console.log('Firebase permission error:', e);
      }
    };

    requestUserPermission();

    let unsubscribe = () => {};
    try {
      unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert(
          remoteMessage.notification?.title || 'New Notification', 
          remoteMessage.notification?.body || ''
        );
      });
    } catch (e) {
      console.log('Firebase onMessage error:', e);
    }

    return unsubscribe;
  }, [token]);
}
