import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';
import { placeOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import paymentService from '../../api/paymentService';
import { useTranslation } from 'react-i18next';

export default function CheckoutScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);
  
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  const toNumber = (val) => parseFloat(String(val).replace(/,/g, ''));
  const subtotal = items.reduce((acc, item) => acc + (toNumber(item.product.price) * item.quantity), 0);

  const handlePayment = async () => {
    if (!address) {
      alert(t('checkout.enter_address'));
      return;
    }
    
    setIsProcessing(true);
    try {
      if (!items || items.length === 0) {
        alert(t('checkout.cart_empty'));
        setIsProcessing(false);
        return;
      }

      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const orders = await dispatch(placeOrder({ 
        items: orderItems,
        address
      })).unwrap();

      const paymentData = await paymentService.initiatePayment(orders[0].id);
      setCheckoutUrl(paymentData.checkout_url);
    } catch (error) {
      alert(t('checkout.checkout_failed') + ' ' + (error.message || error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWebViewNavigation = (navState) => {
    if (navState.url.includes('orders/') || navState.url.includes('success')) {
      setCheckoutUrl(null);
      dispatch(clearCart());
      navigation.navigate('OrderTracking');
    }
  };

  if (checkoutUrl) {
    return (
      <WebView 
        source={{ uri: checkoutUrl }} 
        onNavigationStateChange={handleWebViewNavigation}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>{t('checkout.title')}</Text>
      
      <TextInput
        label={t('checkout.delivery_address')}
        mode="outlined"
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
        style={{ marginBottom: 20 }}
      />

      <View style={styles.summary}>
        <Text variant="titleMedium">{t('checkout.order_summary')}</Text>
        <Text>{t('checkout.items')} {items.length}</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 10 }}>{t('checkout.total')} {subtotal.toFixed(2)} {t('common.etb')}</Text>
      </View>

      <Button 
        mode="contained" 
        onPress={handlePayment} 
        disabled={isProcessing}
        style={{ marginTop: 20 }}
      >
        {isProcessing ? <ActivityIndicator color="white" /> : t('checkout.pay_chapa')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  summary: { padding: 15, backgroundColor: '#fff', borderRadius: 8, elevation: 1 }
});
