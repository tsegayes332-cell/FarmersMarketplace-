import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import apiClient from '../../api/apiClient';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function FarmerDashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState({ products: 0, pendingOrders: 0, revenue: 0, unreadMsgs: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          apiClient.get('/products?limit=1'),
          apiClient.get('/orders/farmer')
        ]);

        const totalProducts = parseInt(productsRes.data.pagination?.total || 0, 10);
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const pending = orders.filter(o => o.status === 'PENDING').length;
        const revenue = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
        const recent = orders.slice(0, 5);

        setStats({ products: totalProducts, pendingOrders: pending, revenue, unreadMsgs: 0, recentOrders: recent });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>{t('farmer_dashboard.title')}</Text>

      <View style={styles.grid}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="bodyLarge">{t('farmer_dashboard.total_products')}</Text>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>{stats.products}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="bodyLarge">{t('farmer_dashboard.pending_orders')}</Text>
            <Text variant="headlineMedium" style={{ color: theme.colors.error }}>{stats.pendingOrders}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="bodyLarge">{t('farmer_dashboard.total_revenue')}</Text>
            <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>{stats.revenue.toFixed(0)} {t('common.etb')}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="bodyLarge">{t('farmer_dashboard.unread_msgs')}</Text>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>{stats.unreadMsgs}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.actions}>
        <Button mode="contained" onPress={() => navigation.navigate('AddProduct')} style={{ flex: 1, marginRight: 10 }}>
          {t('farmer_dashboard.add_product')}
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate('Orders')} style={{ flex: 1 }}>
          {t('farmer_dashboard.view_orders')}
        </Button>
      </View>

      <Text variant="titleLarge" style={{ marginTop: 20, marginBottom: 10 }}>{t('farmer_dashboard.recent_orders')}</Text>
      {stats.recentOrders.length === 0 && <Text>{t('farmer_dashboard.no_orders')}</Text>}
      {stats.recentOrders.map((order) => (
        <Card key={order.id} style={{ marginBottom: 10 }}>
          <Card.Content>
            <Text>{t('farmer_dashboard.order_prefix')}{order.id.substring(0, 8)}</Text>
            <Text style={{ color: order.status === 'PENDING' ? theme.colors.error : theme.colors.primary }}>
              {t('order.status')} {order.status}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  summaryCard: { width: '48%', marginBottom: 15 },
  actions: { flexDirection: 'row', marginTop: 10 }
});
