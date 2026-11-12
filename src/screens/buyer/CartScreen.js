import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function CartScreen({ navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 22 : 16);

  const toNumber = (val) => parseFloat(String(val).replace(/,/g, '')) || 0;
  const subtotal = items.reduce((acc, item) => acc + (toNumber(item.product.price) * item.quantity), 0);

  const renderItem = ({ item }) => (
    <View style={styles.cartCard}>
      <Image
        source={{ uri: item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80' }}
        style={styles.cropImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.productName} numberOfLines={1}>{item.product.name}</Text>
        <Text style={styles.productPrice}>{item.product.price} {t('common.etb')}</Text>
        <Text style={styles.farmerName}>{t('order.farmer')}: {item.product.farmer?.name || 'Local Producer'}</Text>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => {
            if (item.quantity > 1) {
              dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity - 1 }));
            } else {
              dispatch(removeFromCart(item.product.id));
            }
          }}
        >
          <Icon name={item.quantity === 1 ? 'trash-can-outline' : 'minus'} size={16} color={item.quantity === 1 ? '#DC2626' : '#374151'} />
        </TouchableOpacity>

        <Text style={styles.quantityValue}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity + 1 }))}
        >
          <Icon name="plus" size={16} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('cart.title')}</Text>
        <Text style={styles.headerSubtitle}>{items.length} {t('cart.items_selected')}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.product.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="cart-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
            <Text style={styles.emptySub}>{t('cart.empty_subtitle')}</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseBtnText}>{t('order.start_shopping')}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: bottomPadding + 64 }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.subtotalLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.subtotalValue}>{subtotal.toFixed(2)} {t('common.etb')}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.checkoutBtnText}>{t('cart.proceed_checkout')} • {subtotal.toFixed(0)} {t('common.etb')}</Text>
            <Icon name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 160,
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cropImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 2,
  },
  farmerName: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 6,
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
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
  browseBtn: {
    backgroundColor: '#15803D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subtotalLabel: {
    fontSize: 13.5,
    color: '#4B5563',
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    borderRadius: 14,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
