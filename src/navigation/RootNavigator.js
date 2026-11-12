import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser, logoutUser } from '../store/slices/authSlice';
import SplashScreen from '../screens/shared/SplashScreen';
import AuthNavigator from './AuthNavigator';
import FarmerNavigator from './FarmerNavigator';
import BuyerNavigator from './BuyerNavigator';
import AdminNavigator from './AdminNavigator';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import useNotifications from '../hooks/useNotifications';

export default function RootNavigator() {
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state) => state.auth);

  useNotifications();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  const role = (user?.role || '').toUpperCase();

  return (
    <NavigationContainer>
      {!token || !user ? (
        <AuthNavigator />
      ) : role === 'FARMER' ? (
        <FarmerNavigator />
      ) : role === 'BUYER' ? (
        <BuyerNavigator />
      ) : role === 'ADMIN' ? (
        <AdminNavigator />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FAFAFA' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
            {role ? `${role} Portal` : 'Portal'}
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
            This role is currently in development. Please sign in as a Buyer or Farmer.
          </Text>
          <TouchableOpacity
            onPress={() => dispatch(logoutUser())}
            style={{ backgroundColor: '#15803D', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </NavigationContainer>
  );
}
