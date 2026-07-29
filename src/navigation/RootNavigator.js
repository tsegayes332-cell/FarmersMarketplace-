import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';
import SplashScreen from '../screens/shared/SplashScreen';
import AuthNavigator from './AuthNavigator';
import FarmerNavigator from './FarmerNavigator';
import BuyerNavigator from './BuyerNavigator';
import AdminNavigator from './AdminNavigator';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import useNotifications from '../hooks/useNotifications';
import { useSocketGlobal } from '../hooks/useSocket';

export default function RootNavigator() {
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state) => state.auth);

  useNotifications();
  useSocketGlobal();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!token || !user ? (
        <AuthNavigator />
      ) : user.role === 'FARMER' ? (
        <FarmerNavigator />
      ) : user.role === 'BUYER' ? (
        <BuyerNavigator />
      ) : user.role === 'ADMIN' ? (
        <AdminNavigator />
      ) : (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
           <Text>Role not supported yet</Text>
        </View>
      )}
    </NavigationContainer>
  );
}
