import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { BACKEND_URL } from '../api/apiClient';

export default function ProductCard({ product, onPress }) {
  const theme = useTheme();
  const imageUri = product.imageUrl?.startsWith('http') ? product.imageUrl : `${BACKEND_URL}/${product.imageUrl}`;

  return (
    <TouchableOpacity onPress={() => onPress(product)}>
      <Card style={styles.card}>
        {product.imageUrl ? (
          <Card.Cover source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: '#e0e0e0' }]}>
            <Text>No Image</Text>
          </View>
        )}
        <Card.Content style={styles.content}>
          <Text variant="titleMedium" numberOfLines={1}>{product.name}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {product.price} ETB
          </Text>
          <Text variant="bodySmall" style={{ color: 'gray' }}>
            {product.farmer?.name || 'Unknown Farmer'}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    height: 120,
    borderRadius: 0,
  },
  imagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 10,
  }
});
