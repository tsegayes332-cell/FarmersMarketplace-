import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Card, ProgressBar } from 'react-native-paper';
import orderService from '../../api/orderService';
import { useTranslation } from 'react-i18next';

const STATUS_STAGES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderTrackingScreen({ route }) {
  const { t } = useTranslation();
  const { orderId } = route.params || {};
  const theme = useTheme();
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError(t('order.no_id_provided'));
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await orderService.trackOrder(orderId);
        setOrderData(data);
      } catch (err) {
        setError(err.response?.data?.error || t('order.fetch_failed'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  if (error) return <View style={styles.container}><Text style={{ color: theme.colors.error, textAlign: 'center' }}>{error}</Text></View>;
  if (!orderData) return null;

  const currentStepIndex = STATUS_STAGES.indexOf(orderData.status);
  const progress = currentStepIndex >= 0 ? (currentStepIndex + 1) / STATUS_STAGES.length : 0;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>{t('order.track_title')}</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">{t('order.order_id')} {orderData.id}</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary, marginTop: 10 }}>
            {t('order.status')} {orderData.status}
          </Text>
          
          <ProgressBar 
            progress={progress} 
            color={theme.colors.primary} 
            style={{ height: 10, borderRadius: 5, marginVertical: 20 }} 
          />

          <View style={styles.steps}>
            {STATUS_STAGES.map((stage, index) => (
              <Text 
                key={stage} 
                style={{ 
                  fontSize: 10, 
                  fontWeight: index <= currentStepIndex ? 'bold' : 'normal',
                  color: index <= currentStepIndex ? theme.colors.primary : 'gray'
                }}
              >
                {stage}
              </Text>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { marginTop: 20 }]}>
        <Card.Content>
          <Text variant="titleMedium">{t('order.product_details')}</Text>
          <Text>{orderData.product?.name || t('order.product')}</Text>
          <Text>{Number(orderData.totalPrice || orderData.product?.price || 0).toFixed(2)} {t('common.etb')}</Text>
          <Text style={{ marginTop: 10 }}>{t('product.quantity')}: {orderData.quantity}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  card: { elevation: 2 },
  steps: { flexDirection: 'row', justifyContent: 'space-between' }
});
