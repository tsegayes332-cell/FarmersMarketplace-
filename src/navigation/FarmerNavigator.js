import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Farmer Screens
import FarmerDashboardScreen from '../screens/farmer/FarmerDashboardScreen';
import AddProductScreen from '../screens/farmer/AddProductScreen';
import MyProductsScreen from '../screens/farmer/MyProductsScreen';
import FarmerOrdersScreen from '../screens/farmer/FarmerOrdersScreen';
import RevenueScreen from '../screens/farmer/RevenueScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function FarmerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'view-dashboard';
          else if (route.name === 'MyProducts') iconName = 'sprout';
          else if (route.name === 'Orders') iconName = 'truck-delivery';
          else if (route.name === 'Messages') iconName = 'message-text';
          else if (route.name === 'Revenue') iconName = 'cash-multiple';
          else if (route.name === 'Profile') iconName = 'account';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={FarmerDashboardScreen} />
      <Tab.Screen name="MyProducts" component={MyProductsScreen} options={{ title: 'My Products' }} />
      <Tab.Screen name="Orders" component={FarmerOrdersScreen} />
      <Tab.Screen name="Messages" component={ChatListScreen} />
      <Tab.Screen name="Revenue" component={RevenueScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function FarmerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FarmerTabs" component={FarmerTabs} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ headerShown: true, title: 'Add New Product' }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}
