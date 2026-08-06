import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, useTheme, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = {
  PENDING: '#FF9800',
  CONFIRMED: '#2196F3',
  SHIPPED: '#9C27B0',
  DELIVERED: '#4CAF50'
};

export default function BuyerOrdersScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { myOrders, isLoadingMyOrders: isLoading } = useSelector(state => state.orders);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyOrders());
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyOrders());
    setRefreshing(false);
  };

  const filteredOrders = filter === 'ALL' ? myOrders : myOrders.filter(o => o.status === filter);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.tabs}>
        {[t('order.all'), t('order.pending'), t('order.confirmed'), t('order.shipped'), t('order.delivered')].map((label, idx) => {
          const keys = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
          const key = keys[idx];
          return (
            <Chip
              key={key}
              selected={filter === key}
              onPress={() => setFilter(key)}
              style={styles.chip}
            >
              {label}
            </Chip>
          );
        })}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator style={{ marginTop: 50 }} /> :
          <Text style={{ textAlign: 'center', marginTop: 50 }}>{t('order.no_orders')}</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.product?.name || t('order.product')}</Text>
              <Text>{t('product.quantity')}: {item.quantity} | {t('checkout.total')}: {Number(item.totalPrice).toFixed(2)} {t('common.etb')}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]} />
                <Text style={{ color: STATUS_COLORS[item.status] || '#999', fontWeight: 'bold' }}>
                  {item.status}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}>
                {t('order.track_order')}
              </Button>
              {item.status === 'SHIPPED' && (
                <Button onPress={async () => {
                  try {
                    await apiClient.put(`/orders/${item.id}/status`, { status: 'DELIVERED' });
                    dispatch(fetchMyOrders());
                  } catch (err) {
                    alert(t('order.status_update_failed'));
                  }
                }}>
                  Delivered
                </Button>
              )}
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, gap: 8 },
  chip: { marginBottom: 5 },
  card: { marginBottom: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 }
});
