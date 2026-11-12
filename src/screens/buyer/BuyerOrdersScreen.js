import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { resolveCropImage } from '../../components/ProductCard';

const STATUS_CONFIG = {
  PENDING: {
    labelKey: 'order.pending',
    color: '#D97706',
    bgColor: '#FEF3C7',
    icon: 'clock-outline'
  },
  CONFIRMED: {
    labelKey: 'order.confirmed',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    icon: 'check-circle-outline'
  },
  SHIPPED: {
    labelKey: 'order.shipped',
    color: '#9333EA',
    bgColor: '#F3E8FF',
    icon: 'truck-fast-outline'
  },
  DELIVERED: {
    labelKey: 'order.delivered',
    color: '#15803D',
    bgColor: '#DCFCE7',
    icon: 'shield-check'
  }
};

export default function BuyerOrdersScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector(state => state.orders);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyOrders());
    setRefreshing(false);
  };

  const orders = Array.isArray(myOrders) ? myOrders : [];
  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter);

  // Stats calculation
  const activeCount = orders.filter(o => ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(o.status)).length;
  const completedCount = orders.filter(o => o.status === 'DELIVERED').length;
  const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0);

  const filterTabs = [
    { key: 'ALL', label: t('order.all'), icon: 'format-list-bulleted' },
    { key: 'PENDING', label: t('order.pending'), icon: 'clock-outline' },
    { key: 'CONFIRMED', label: t('order.confirmed'), icon: 'check-circle-outline' },
    { key: 'SHIPPED', label: t('order.shipped'), icon: 'truck-fast-outline' },
    { key: 'DELIVERED', label: t('order.delivered'), icon: 'shield-check' }
  ];

  const renderOrderItem = ({ item }) => {
    const statusCfg = STATUS_CONFIG[item.status] || {
      labelKey: item.status,
      color: '#6B7280',
      bgColor: '#F3F4F6',
      icon: 'information-outline'
    };

    const imageUri = resolveCropImage(item.product);
    const shortId = item.id ? String(item.id).substring(0, 8).toUpperCase() : '---';
    const dateFormatted = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
    const isGrain = String(item.product?.category || '').toLowerCase().includes('grain') ||
                    String(item.product?.name || '').toLowerCase().includes('teff');
    const unit = isGrain ? t('product.unit_quintal') : t('product.unit_kg');

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>
              {t('order.order_prefix')}{shortId}
            </Text>
            {dateFormatted ? (
              <Text style={styles.orderDate}>{t('order.placed_on')} {dateFormatted}</Text>
            ) : null}
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bgColor }]}>
            <Icon name={statusCfg.icon} size={14} color={statusCfg.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {t(statusCfg.labelKey, statusCfg.labelKey)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Card Body with Thumbnail and details */}
        <View style={styles.cardBody}>
          <Image
            source={{ uri: imageUri }}
            style={styles.cropThumb}
            resizeMode="cover"
          />
          <View style={styles.cardInfo}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.product?.name || t('order.product')}
            </Text>
            
            <View style={styles.qtyRow}>
              <Text style={styles.qtyText}>
                {t('order.quantity')}: <Text style={{ fontWeight: '700', color: '#1F2937' }}>{item.quantity} {unit}</Text>
              </Text>
            </View>

            <Text style={styles.priceHighlight}>
              {Number(item.totalPrice).toFixed(0)} <Text style={styles.etbText}>{t('common.etb')}</Text>
            </Text>

            {item.address ? (
              <View style={styles.addressRow}>
                <Icon name="map-marker-outline" size={13} color="#6B7280" />
                <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Card Footer Actions */}
        <View style={styles.cardActions}>
          {item.product?.farmerId ? (
            <TouchableOpacity
              style={styles.contactBtn}
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('ChatScreen', {
                  receiverId: item.product.farmerId,
                  title: item.product.farmer?.name || t('order.farmer')
                });
              }}
            >
              <Icon name="chat-processing-outline" size={16} color="#15803D" style={{ marginRight: 5 }} />
              <Text style={styles.contactBtnText}>{t('order.contact_farmer')}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.trackBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
          >
            <Icon name="radar" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.trackBtnText}>{t('order.track_order')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Banner / Metrics */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('order.my_orders_title')}</Text>
        <Text style={styles.headerSubtitle}>{t('order.orders_subtitle')}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="clock-fast" size={18} color="#D97706" />
            </View>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>{t('order.active_orders')}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="check-decagram" size={18} color="#15803D" />
            </View>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>{t('order.completed_orders')}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Icon name="cash-multiple" size={18} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>{t('order.total_spent')}</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {filterTabs.map(tab => {
            const isSelected = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilter(tab.key)}
                activeOpacity={0.8}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Icon
                  name={tab.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#4B5563'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => String(item.id)}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#15803D']} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator size="large" color="#15803D" />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="package-variant" size={48} color="#15803D" />
              </View>
              <Text style={styles.emptyTitle}>{t('order.no_orders')}</Text>
              <Text style={styles.emptySubtitle}>{t('order.no_orders_subtitle')}</Text>
              <TouchableOpacity
                style={styles.browseButton}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Home')}
              >
                <Icon name="shopping-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.browseButtonText}>{t('order.start_shopping')}</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 14,
    paddingBottom: 110,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  orderDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropThumb: {
    width: 74,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  qtyText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  etbText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addressText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 3,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#15803D',
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 13,
  },
});
