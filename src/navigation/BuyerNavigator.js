import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from '../screens/buyer/HomeScreen';
import CartScreen from '../screens/buyer/CartScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';
import OrderTrackingScreen from '../screens/buyer/OrderTrackingScreen';
import BuyerOrdersScreen from '../screens/buyer/BuyerOrdersScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useSelector(state => state.messages);
  const { items } = useSelector(state => state.cart);

  // Generous bottom padding to clear Android navigation buttons & gesture bars
  const bottomPadding = Math.max(insets.bottom + 8, Platform.OS === 'android' ? 36 : 20);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'MyOrders') {
          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.85}
              onPress={onPress}
              style={styles.floatingCenterButton}
            >
              <View style={styles.floatingCircle}>
                <Icon name="package-variant-closed" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive, { marginTop: 3 }]}>
                {t('tabs.my_orders')}
              </Text>
            </TouchableOpacity>
          );
        }

        let iconName = 'home';
        let label = t('tabs.home');

        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
          label = t('tabs.home');
        } else if (route.name === 'Trade') {
          iconName = isFocused ? 'cart' : 'cart-outline';
          label = t('tabs.trade');
        } else if (route.name === 'Messages') {
          iconName = isFocused ? 'chat-processing' : 'chat-processing-outline';
          label = t('tabs.messages');
        } else if (route.name === 'Profile') {
          iconName = isFocused ? 'account' : 'account-outline';
          label = t('tabs.profile');
        }

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name={iconName} 
                size={25} 
                color={isFocused ? '#15803D' : '#6B7280'} 
              />
              {route.name === 'Messages' && unreadCount > 0 && (
                <View style={styles.badgeDot} />
              )}
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function BuyerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trade" component={CartScreen} />
      <Tab.Screen name="MyOrders" component={BuyerOrdersScreen} />
      <Tab.Screen name="Messages" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function BuyerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerTabs" component={BuyerTabs} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ 
          headerShown: true, 
          title: 'Product Details',
          headerStyle: { backgroundColor: '#15803D' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' }
        }} 
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{ 
          headerShown: true, 
          title: 'Checkout',
          headerStyle: { backgroundColor: '#15803D' },
          headerTintColor: '#FFFFFF'
        }} 
      />
      <Stack.Screen 
        name="OrderTracking" 
        component={OrderTrackingScreen} 
        options={{ 
          headerShown: true, 
          title: 'Track Order',
          headerStyle: { backgroundColor: '#15803D' },
          headerTintColor: '#FFFFFF'
        }} 
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen} 
        options={{ 
          headerShown: true,
          headerStyle: { backgroundColor: '#15803D' },
          headerTintColor: '#FFFFFF'
        }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          headerShown: true,
          title: 'Notifications',
          headerStyle: { backgroundColor: '#15803D' },
          headerTintColor: '#FFFFFF'
        }} 
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#15803D',
    fontWeight: '800',
  },
  floatingCenterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  floatingCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
