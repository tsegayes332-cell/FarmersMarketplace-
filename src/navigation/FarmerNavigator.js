import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

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

function CustomFarmerTabBar({ state, descriptors, navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useSelector(state => state.messages);
  const bottomPadding = Math.max(insets.bottom + 8, Platform.OS === 'android' ? 36 : 20);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
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

        if (route.name === 'AddProductTab') {
          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AddProduct')}
              style={styles.tabItem}
            >
              <View style={styles.addIconCircle}>
                <Icon name="plus" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.tabLabel, { color: '#15803D', fontWeight: '700' }]} numberOfLines={1}>
                {t('tabs.add_item')}
              </Text>
            </TouchableOpacity>
          );
        }

        let iconName = 'view-dashboard';
        let label = t('tabs.dashboard');

        if (route.name === 'Dashboard') {
          iconName = isFocused ? 'view-dashboard' : 'view-dashboard-outline';
          label = t('tabs.dashboard');
        } else if (route.name === 'MyProducts') {
          iconName = isFocused ? 'sprout' : 'sprout-outline';
          label = t('tabs.my_crops');
        } else if (route.name === 'Orders') {
          iconName = isFocused ? 'truck-delivery' : 'truck-delivery-outline';
          label = t('tabs.orders');
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
                size={22} 
                color={isFocused ? '#15803D' : '#6B7280'} 
              />
              {route.name === 'Messages' && unreadCount > 0 && (
                <View style={styles.badgeDot} />
              )}
            </View>
            <Text 
              style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Dummy placeholder for center tab trigger
const DummyAdd = () => <View />;

function FarmerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomFarmerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={FarmerDashboardScreen} />
      <Tab.Screen name="MyProducts" component={MyProductsScreen} />
      <Tab.Screen name="AddProductTab" component={DummyAdd} />
      <Tab.Screen name="Orders" component={FarmerOrdersScreen} />
      <Tab.Screen name="Messages" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function FarmerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FarmerTabs" component={FarmerTabs} />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{ 
          headerShown: true, 
          title: 'Add New Crop / Produce',
          headerStyle: { backgroundColor: '#15803D' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' }
        }} 
      />
      <Stack.Screen 
        name="Revenue" 
        component={RevenueScreen} 
        options={{ 
          headerShown: true, 
          title: 'Earnings & Revenue',
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
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          headerShown: true,
          title: 'Farmer Profile',
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
    paddingHorizontal: 2,
  },
  iconContainer: {
    position: 'relative',
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
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
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
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
