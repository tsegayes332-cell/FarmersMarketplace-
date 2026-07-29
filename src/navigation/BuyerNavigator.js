import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { View, Text } from 'react-native';

// Buyer Screens
import HomeScreen from '../screens/buyer/HomeScreen';
import CartScreen from '../screens/buyer/CartScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';
import OrderTrackingScreen from '../screens/buyer/OrderTrackingScreen';
import BuyerOrdersScreen from '../screens/buyer/BuyerOrdersScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stub screens
const SearchStub = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Search</Text></View>;

function BuyerTabs() {
  const { items } = useSelector(state => state.cart);
  const { unreadCount } = useSelector(state => state.messages);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Messages') iconName = 'message-text';
          else if (route.name === 'Cart') iconName = 'cart';
          else if (route.name === 'Orders') iconName = 'format-list-bulleted';
          else if (route.name === 'Profile') iconName = 'account';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Messages" 
        component={ChatListScreen} 
        options={{ tabBarBadge: unreadCount > 0 ? unreadCount : null }} 
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ tabBarBadge: items.length > 0 ? items.length : null }} 
      />
      <Tab.Screen name="Orders" component={BuyerOrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function BuyerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerTabs" component={BuyerTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, title: 'Product Details' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout' }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ headerShown: true, title: 'Track Order' }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}
