import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, Button, useTheme, IconButton, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { useTranslation } from 'react-i18next';

export default function CartScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);

  const toNumber = (val) => parseFloat(String(val).replace(/,/g, ''));
  const subtotal = items.reduce((acc, item) => acc + (toNumber(item.product.price) * item.quantity), 0);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        {item.product.imageUrl ? (
          <Image source={{ uri: item.product.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#e0e0e0' }]} />
        )}
        
        <View style={styles.itemDetails}>
          <Text variant="titleMedium" numberOfLines={1}>{item.product.name}</Text>
          <Text style={{ color: theme.colors.primary }}>{item.product.price} {t('common.etb')}</Text>
        </View>

        <View style={styles.quantityControls}>
          <IconButton icon="minus" size={16} onPress={() => {
            if (item.quantity > 1) {
              dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity - 1 }));
            } else {
              dispatch(removeFromCart(item.product.id));
            }
          }} />
          <Text>{item.quantity}</Text>
          <IconButton icon="plus" size={16} onPress={() => {
            if (item.quantity < item.product.quantity) {
              dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity + 1 }));
            }
          }} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={items}
        keyExtractor={item => item.product.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50 }}>{t('cart.empty')}</Text>}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.row}>
            <Text variant="titleMedium">{t('cart.subtotal')}</Text>
            <Text variant="titleMedium">{subtotal.toFixed(2)} {t('common.etb')}</Text>
          </View>
          <Button 
            mode="contained" 
            style={{ marginTop: 10 }} 
            onPress={() => navigation.navigate('Checkout')}
          >
            {t('cart.proceed_checkout')}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  image: { width: 60, height: 60, borderRadius: 5, marginRight: 10 },
  itemDetails: { flex: 1 },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  footer: { padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e0e0e0' },
  row: { flexDirection: 'row', justifyContent: 'space-between' }
});
