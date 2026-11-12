import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { resolveCropImage } from '../../components/ProductCard';

export default function ProductDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const product = route?.params?.product;

  if (!product) {
    return (
      <View style={styles.errorCenter}>
        <Icon name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorTitle}>{t('product.details_not_found')}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{t('product.go_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bottomPadding = Math.max(insets?.bottom || 0, Platform.OS === 'android' ? 18 : 12);
  const imageUri = resolveCropImage(product);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    navigation.navigate('BuyerTabs', { screen: 'Trade' });
  };

  const isGrain = String(product.category || '').toLowerCase().includes('grain') || 
                  String(product.name || '').toLowerCase().includes('teff');
  const unit = isGrain ? t('product.unit_quintal') : t('product.unit_kg');

  const priceNum = parseFloat(String(product.price || 0).replace(/,/g, '')) || 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Large Crop Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{product.category || 'Produce'}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceRatingRow}>
            <View>
              <Text style={styles.priceLabel}>{t('product.direct_price')}</Text>
              <Text style={styles.priceValue}>{priceNum} {t('common.etb')} <Text style={styles.unitText}>/ {unit}</Text></Text>
            </View>

            <View style={styles.ratingBadge}>
              <Icon name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}> 4.9 (95 {t('product.reviews')})</Text>
            </View>
          </View>

          {/* Seller / Farmer Card */}
          <View style={styles.farmerCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' }}
              style={styles.farmerAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.farmerName}>{product.farmer?.name || t('product.verified_farmer')}</Text>
                <Icon name="check-decagram" size={16} color="#15803D" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.farmerOrigin}>{t('product.direct_dispatch')}</Text>
            </View>

            <TouchableOpacity 
              style={styles.chatFarmerBtn}
              onPress={() => {
                if (product.farmerId) {
                  navigation.navigate('ChatScreen', { receiverId: product.farmerId, title: product.farmer?.name || 'Farmer' });
                }
              }}
            >
              <Icon name="chat-processing-outline" size={20} color="#15803D" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>{t('product.description')}</Text>
          <Text style={styles.descriptionText}>
            {product.description || t('product.no_description')}
          </Text>

          {/* Guarantee Highlights */}
          <View style={styles.guaranteeBox}>
            <View style={styles.guaranteeItem}>
              <Icon name="truck-fast-outline" size={20} color="#15803D" />
              <Text style={styles.guaranteeText}>{t('product.fast_delivery')}</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Icon name="shield-check-outline" size={20} color="#15803D" />
              <Text style={styles.guaranteeText}>{t('product.quality_checked')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar with Stepper & Add to Cart */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Icon name="minus" size={18} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Icon name="plus" size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.88}
        >
          <Icon name="cart-plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addToCartText}>{t('product.add_to_cart')} • {(priceNum * quantity).toFixed(0)} {t('common.etb')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: '#15803D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: 260,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: '#15803D',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15803D',
  },
  unitText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  farmerOrigin: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  chatFarmerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  guaranteeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guaranteeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 8,
  },
  addToCartBtn: {
    flex: 1,
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
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
