import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../api/apiClient';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversations } from '../../store/slices/messageSlice';
import { useTranslation } from 'react-i18next';

export default function FarmerDashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.messages);
  const [stats, setStats] = useState({ products: 0, pendingOrders: 0, revenue: 0, unreadMsgs: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        apiClient.get('/products?limit=1'),
        apiClient.get('/orders/farmer').catch(() => ({ data: [] })),
        dispatch(fetchConversations()).catch(() => {})
      ]);

      const totalProducts = parseInt(productsRes?.data?.pagination?.total || 0, 10);
      const orders = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
      const pending = orders.filter(o => o.status === 'PENDING').length;
      const revenue = orders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
      const recent = orders.slice(0, 5);

      setStats({ products: totalProducts, pendingOrders: pending, revenue, unreadMsgs: unreadCount, recentOrders: recent });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#15803D" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#15803D']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>{t('farmer_dashboard.welcome_back')}</Text>
          <Text style={styles.userName}>{user?.name || 'Farmer Demo'}</Text>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity 
            style={styles.messageHeaderBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Messages')}
          >
            <Icon name="chat-processing-outline" size={24} color="#15803D" />
            {unreadCount > 0 && (
              <View style={styles.unreadHeaderBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileBadge}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image
              source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Welcome Banner */}
      <View style={styles.heroBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroBadge}>{t('farmer_dashboard.farmer_portal')}</Text>
          <Text style={styles.heroTitle}>{t('farmer_dashboard.portal_title')}</Text>
          <Text style={styles.heroSubtitle}>{t('farmer_dashboard.portal_subtitle')}</Text>
        </View>
      </View>

      {/* Quick Action Button */}
      <TouchableOpacity
        style={styles.primaryActionBtn}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="plus-circle" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.primaryActionText}>{t('farmer_dashboard.list_produce')}</Text>
      </TouchableOpacity>

      {/* Metric Cards Grid */}
      <Text style={styles.sectionHeader}>{t('farmer_dashboard.business_overview')}</Text>
      <View style={styles.metricsGrid}>
        {/* Total Crops Card */}
        <TouchableOpacity 
          style={styles.metricCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MyProducts')}
        >
          <View style={styles.metricHeader}>
            <View style={styles.metricIconWrap}>
              <Icon name="sprout" size={20} color="#15803D" />
            </View>
            <Text style={styles.metricTag}>{t('farmer_dashboard.active')}</Text>
          </View>
          <Text style={styles.metricValue}>{stats.products}</Text>
          <Text style={styles.metricLabel}>{t('farmer_dashboard.total_listed_crops')}</Text>
        </TouchableOpacity>

        {/* Pending Orders Card */}
        <TouchableOpacity 
          style={styles.metricCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Orders')}
        >
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="clock-alert-outline" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.metricTag, { color: '#DC2626' }]}>{t('farmer_dashboard.action')}</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#DC2626' }]}>{stats.pendingOrders}</Text>
          <Text style={styles.metricLabel}>{t('farmer_dashboard.pending_orders')}</Text>
        </TouchableOpacity>

        {/* Buyer Messages Card */}
        <TouchableOpacity 
          style={[styles.metricCard, unreadCount > 0 && styles.metricCardHighlight]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Messages')}
        >
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="chat-processing-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.inquiriesTagWrap}>
              {unreadCount > 0 ? (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{unreadCount} NEW</Text>
                </View>
              ) : (
                <Text style={styles.metricTag}>{t('farmer_dashboard.inquiries')}</Text>
              )}
            </View>
          </View>
          <Text style={[styles.metricValue, { color: '#0284C7' }]}>{unreadCount}</Text>
          <Text style={styles.metricLabel}>{t('farmer_dashboard.buyer_messages')}</Text>
        </TouchableOpacity>

        {/* Total Revenue Card */}
        <TouchableOpacity 
          style={styles.metricCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Revenue')}
        >
          <View style={styles.metricHeader}>
            <View style={styles.metricIconWrap}>
              <Icon name="cash-check" size={20} color="#15803D" />
            </View>
            <Text style={styles.metricTag}>{t('farmer_dashboard.earnings')}</Text>
          </View>
          <Text style={styles.metricValue}>{Number(stats.revenue).toFixed(0)} <Text style={{ fontSize: 13 }}>ETB</Text></Text>
          <Text style={styles.metricLabel}>{t('farmer_dashboard.total_revenue')}</Text>
        </TouchableOpacity>

        {/* Analytics Shortcut */}
        <TouchableOpacity
          style={styles.metricCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Revenue')}
        >
          <View style={styles.metricHeader}>
            <View style={styles.metricIconWrap}>
              <Icon name="chart-line" size={20} color="#6B7280" />
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.metricValue}>{t('farmer_dashboard.analytics')}</Text>
          <Text style={styles.metricLabel}>{t('farmer_dashboard.payouts_reports')}</Text>
        </TouchableOpacity>

        {/* Add Produce Shortcut */}
        <TouchableOpacity
          style={styles.metricCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="plus-box" size={20} color="#15803D" />
            </View>
            <Icon name="plus" size={18} color="#15803D" />
          </View>
          <Text style={[styles.metricValue, { fontSize: 17, color: '#15803D' }]}>+ Add</Text>
          <Text style={styles.metricLabel}>{t('farmer_dashboard.add_produce')}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>{t('farmer_dashboard.recent_orders')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.viewAllText}>{t('farmer_dashboard.view_all')}</Text>
        </TouchableOpacity>
      </View>

      {stats.recentOrders.length === 0 ? (
        <View style={styles.emptyOrdersCard}>
          <Icon name="clipboard-text-outline" size={40} color="#9CA3AF" />
          <Text style={styles.emptyOrdersText}>{t('farmer_dashboard.no_orders')}</Text>
          <Text style={styles.emptyOrdersSubtext}>{t('farmer_dashboard.no_orders_sub')}</Text>
        </View>
      ) : (
        stats.recentOrders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderCardHeader}>
              <Text style={styles.orderId}>{t('farmer_dashboard.order_prefix')}{order.id.substring(0, 8)}</Text>
              <View style={[
                styles.statusBadge,
                order.status === 'PENDING' ? styles.statusPending : styles.statusDelivered
              ]}>
                <Text style={[
                  styles.statusText,
                  order.status === 'PENDING' ? { color: '#DC2626' } : { color: '#15803D' }
                ]}>
                  {order.status}
                </Text>
              </View>
            </View>

            <View style={styles.orderCardBody}>
              <Text style={styles.orderProduct}>{order.product?.name || 'Produce Item'}</Text>
              <Text style={styles.orderPrice}>{Number(order.totalPrice || 0).toFixed(2)} ETB</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 8,
  },
  greetingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadHeaderBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  profileBadge: {
    padding: 2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#15803D',
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  heroBanner: {
    backgroundColor: '#15803D',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#D1FAE5',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  primaryActionText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricCardHighlight: {
    borderColor: '#38BDF8',
    backgroundColor: '#F0F9FF',
  },
  inquiriesTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11.5,
    color: '#4B5563',
    fontWeight: '600',
  },
  emptyOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyOrdersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
  },
  emptyOrdersSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#FEE2E2',
  },
  statusDelivered: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  orderCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
});
