import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, useTheme, IconButton, FAB } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { useTranslation } from 'react-i18next';
import { BACKEND_URL } from '../../api/apiClient';

export default function ProductDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { product } = route.params;
  const theme = useTheme();
  const dispatch = useDispatch();
  const imageUri = product.imageUrl?.startsWith('http') ? product.imageUrl : `${BACKEND_URL}/${product.imageUrl}`;
  
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    navigation.navigate('Cart');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        {product.imageUrl ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: '#e0e0e0' }]}>
            <Text>{t('product.no_image')}</Text>
          </View>
        )}
        
        <View style={styles.detailsContainer}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>{product.name}</Text>
          <Text variant="titleMedium" style={{ color: 'gray', marginBottom: 10 }}>{product.category}</Text>
          
          <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {product.price} {t('common.etb')}
          </Text>
          
          <Text variant="bodyLarge" style={{ marginTop: 15, marginBottom: 5 }}>{t('product.description')}</Text>
          <Text variant="bodyMedium">{product.description || t('product.no_description')}</Text>
          
          <View style={styles.farmerInfo}>
            <Text variant="titleMedium">{t('product.sold_by')} {product.farmer?.name}</Text>
            <Text style={{ color: theme.colors.secondary }}>{product.averageRating ? `⭐ ${product.averageRating} ${t('product.rating')}` : ''}</Text>
          </View>

          <View style={styles.actionBar}>
            <View style={styles.quantityRow}>
              <IconButton icon="minus" size={20} onPress={() => setQuantity(Math.max(1, quantity - 1))} />
              <Text variant="titleMedium">{quantity}</Text>
              <IconButton icon="plus" size={20} onPress={() => setQuantity(quantity + 1)} />
            </View>
            <Button mode="contained" onPress={handleAddToCart} style={styles.addButton}>
              {t('product.add_to_cart')}
            </Button>
          </View>
        </View>
      </ScrollView>

      <FAB
        icon="message-text"
        label="Contact Farmer"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => navigation.navigate('ChatScreen', { partner: product.farmer })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 250 },
  imagePlaceholder: { width: '100%', height: 250, justifyContent: 'center', alignItems: 'center' },
  detailsContainer: { padding: 15 },
  farmerInfo: { marginTop: 20, padding: 15, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
  actionBar: { flexDirection: 'row', padding: 10, marginTop: 20, alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  addButton: { flex: 1 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 60 }
});
