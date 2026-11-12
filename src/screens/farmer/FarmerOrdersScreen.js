import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import apiClient from '../../api/apiClient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function FarmerOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await apiClient.get('/orders/farmer');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatusMap = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'SHIPPED',
      'SHIPPED': 'DELIVERED'
    };
    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;

    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: nextStatus });
      Alert.alert('Status Updated', `Order marked as ${nextStatus}!`);
      loadData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update order status');
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={item => item}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          renderItem={({ item }) => {
            const isSelected = filter === item;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#15803D" />
          ) : (
            <View style={styles.emptyWrap}>
              <Icon name="package-variant-closed" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySub}>No orders match the selected filter.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isPending = item.status === 'PENDING';
          const isConfirmed = item.status === 'CONFIRMED';
          const isShipped = item.status === 'SHIPPED';
          const isDelivered = item.status === 'DELIVERED';

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>Order #{item.id.substring(0, 8)}</Text>
                <View style={[
                  styles.statusBadge,
                ]}>
                  <Text style={[
                    styles.statusText,
                    isPending && { color: '#DC2626' },
                    isConfirmed && { color: '#D97706' },
                    isShipped && { color: '#2563EB' },
                    isDelivered && { color: '#15803D' },
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.productRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.product?.name || 'Produce Item'}</Text>
                  <Text style={styles.buyerText}>
                    Buyer: <Text style={{ fontWeight: '700', color: '#1F2937' }}>{item.buyer?.name || 'Buyer'}</Text>
                  </Text>
                  <Text style={styles.quantityText}>Quantity: {item.quantity} units</Text>
                </View>

                <Text style={styles.totalPrice}>{Number(item.totalPrice || 0).toFixed(2)} ETB</Text>
              </View>

              {!isDelivered && (
                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={() => handleUpdateStatus(item.id, item.status)}
                  activeOpacity={0.85}
                >
                  <Icon name="arrow-right-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.updateBtnText}>
                    {isPending ? 'Confirm Order' : isConfirmed ? 'Mark as Shipped' : 'Mark as Delivered'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  filterScroll: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterPillActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  buyerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  quantityText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    borderRadius: 10,
    paddingVertical: 10,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
