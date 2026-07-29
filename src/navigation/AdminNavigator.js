import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
