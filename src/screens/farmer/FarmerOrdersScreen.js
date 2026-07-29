import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, useTheme, Button, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';

export default function FarmerOrdersScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
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
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatusMap = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'SHIPPED'
    };
    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;

    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: nextStatus });
      loadData();
    } catch (error) {
      alert(t('order.status_update_failed'));
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.tabs}>
        {[t('order.all'), t('order.pending'), t('order.confirmed'), t('order.shipped')].map((label, idx) => {
          const key = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED'][idx];
          return (
            <Button 
              key={key} 
              mode={filter === key ? 'contained' : 'text'} 
              onPress={() => setFilter(key)}
              style={styles.tabButton}
              labelStyle={{ fontSize: 10 }}
            >
              {label}
            </Button>
          );
        })}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={loading ? <ActivityIndicator style={{marginTop: 50}} /> : <Text style={{textAlign: 'center', marginTop: 50}}>{t('order.no_orders')}</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{t('order.order_prefix')} {item.id}</Text>
              <Text>{t('order.buyer')} {item.buyer?.name || t('common.unknown')}</Text>
              <Text>{t('order.total_label')} {item.totalPrice} {t('common.etb')}</Text>
              <Text style={{ color: theme.colors.primary, marginVertical: 5, fontWeight: 'bold' }}>
                {t('order.status')} {item.status}
              </Text>
            </Card.Content>
            {item.status === 'PENDING' || item.status === 'CONFIRMED' ? (
              <Card.Actions>
                <Button onPress={() => handleUpdateStatus(item.id, item.status)}>
                  {t('order.update_status')}
                </Button>
              </Card.Actions>
            ) : null}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  tabButton: { minWidth: 0, marginHorizontal: 2 },
  card: { marginBottom: 10 }
});
