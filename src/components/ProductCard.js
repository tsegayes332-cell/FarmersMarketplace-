import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

export const CROP_IMAGES = {
  teff: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
  coffee: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80',
  tomatoes: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
  omato: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=400&q=80',
  carrots: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80',
  onions: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
  barley: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  mekonn: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  berry: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
  fruit: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
  butter: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
  bull: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80',
  cattle: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
};

export function resolveCropImage(product) {
  if (product?.imageUrl && product.imageUrl.startsWith('http')) {
    return product.imageUrl;
  }
  const name = (product?.name || '').toLowerCase();
  for (const key of Object.keys(CROP_IMAGES)) {
    if (name.includes(key)) {
      return CROP_IMAGES[key];
    }
  }
  const cat = (product?.category || '').toLowerCase();
  for (const key of Object.keys(CROP_IMAGES)) {
    if (cat.includes(key)) {
      return CROP_IMAGES[key];
    }
  }
  return CROP_IMAGES.default;
}

export default function ProductCard({ product, onPress }) {
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = useState(false);
  const imageUri = resolveCropImage(product);

  const isGrain = product.category === 'Grains' || product.name?.toLowerCase().includes('teff');
  const unit = isGrain ? t('product.unit_quintal') : t('product.unit_kg');

  const rating = (4.7 + ((product.name?.length || 5) % 3) * 0.1).toFixed(1);
  const reviewsCount = (50 + ((product.price || 45) % 75));

  // Extract location in parentheses or default
  const matchLoc = product.name?.match(/\((.*?)\)/);
  const locationText = matchLoc ? `(${matchLoc[1]})` : (product.farmer?.name ? `(${product.farmer.name})` : '');
  const cleanName = product.name?.replace(/\(.*?\)/g, '').trim() || product.name;

  return (
    <TouchableOpacity 
      activeOpacity={0.88}
      onPress={() => onPress(product)}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.heartButton}
          activeOpacity={0.7}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Icon 
            name={isLiked ? "heart" : "heart-outline"} 
            size={16} 
            color={isLiked ? "#EF4444" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {cleanName}
        </Text>

        {locationText ? (
          <Text style={styles.origin} numberOfLines={1}>
            {locationText}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price} {t('common.etb')}</Text>
          <Text style={styles.unit}> / {unit}</Text>
        </View>

        <View style={styles.ratingRow}>
          <Icon name="star" size={11} color="#F59E0B" />
          <Text style={styles.ratingText}> {rating}</Text>
          <Text style={styles.reviewText}> ({reviewsCount} {t('product.reviews')})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 3.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 5,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    width: '100%',
    height: 94,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: 94,
    borderRadius: 10,
  },
  heartButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: 5,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 14,
  },
  origin: {
    fontSize: 9.5,
    color: '#6B7280',
    marginTop: 1,
    lineHeight: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 3,
  },
  price: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },
  unit: {
    fontSize: 9.5,
    color: '#4B5563',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  reviewText: {
    fontSize: 8.5,
    color: '#6B7280',
  },
});
