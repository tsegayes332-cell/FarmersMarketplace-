import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';

export default function RevenueScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await apiClient.get('/orders/farmer');
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load revenue data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const weeklyData = [0, 0, 0, 0];
  deliveredOrders.forEach(o => {
    const date = new Date(o.createdAt);
    if (date >= fourWeeksAgo) {
      const daysAgo = Math.floor((now - date) / (24 * 60 * 60 * 1000));
      const weekIndex = Math.min(3, Math.floor(daysAgo / 7));
      weeklyData[3 - weekIndex] += Number(o.totalPrice || 0);
    }
  });

  const chartData = {
    labels: [t('revenue.week_1'), t('revenue.week_2'), t('revenue.week_3'), t('revenue.week_4')],
    datasets: [{ data: weeklyData }]
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>{t('revenue.title')}</Text>

      <Card style={styles.totalCard}>
        <Card.Content>
          <Text variant="titleMedium">{t('revenue.total_earnings')}</Text>
          <Text variant="displaySmall" style={{ color: theme.colors.primary, marginTop: 10 }}>{totalEarnings.toFixed(0)} {t('common.etb')}</Text>
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={{ marginVertical: 20 }}>{t('revenue.history')}</Text>
      
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>

      <Text variant="titleLarge" style={{ marginVertical: 20 }}>{t('revenue.delivered_orders')} ({deliveredOrders.length})</Text>
      {deliveredOrders.length === 0 && <Text>{t('revenue.no_orders')}</Text>}
      {deliveredOrders.slice(0, 10).map((order) => (
        <Card key={order.id} style={{ marginBottom: 10 }}>
          <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{order.product?.name || t('order.product')}</Text>
            <Text style={{ fontWeight: 'bold' }}>+{Number(order.totalPrice || 0).toFixed(0)} {t('common.etb')}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  totalCard: { elevation: 3 },
  chartContainer: { alignItems: 'center' }
});
