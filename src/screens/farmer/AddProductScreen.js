import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import apiClient from '../../api/apiClient';
import { useTranslation } from 'react-i18next';

export default function AddProductScreen({ navigation, route }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const editProduct = route.params?.product;
  
  const [name, setName] = useState(editProduct?.name || '');
  const [category, setCategory] = useState(editProduct?.category || 'Vegetables');
  const [price, setPrice] = useState(editProduct?.price?.toString() || '');
  const [quantity, setQuantity] = useState(editProduct?.quantity?.toString() || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (!result.didCancel && result.assets) {
      setImage(result.assets[0]);
    }
  };

  const handleAddProduct = async () => {
    if (!name || !price || !quantity) {
      alert(t('auth.please_fill_fields'));
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('description', description);
    
    if (image) {
      formData.append('image', {
        name: image.fileName,
        type: image.type,
        uri: image.uri
      });
    }

    try {
      if (editProduct) {
        await apiClient.put(`/products/${editProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(t('add_product.updated_success'));
      } else {
        await apiClient.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(t('add_product.added_success'));
      }
      navigation.goBack();
    } catch (error) {
      alert(t('add_product.save_failed') + ' ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>{editProduct ? t('add_product.edit_title') : t('add_product.add_title')}</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.image} />
        ) : (
          <Text>{t('add_product.tap_select_image')}</Text>
        )}
      </TouchableOpacity>

      <TextInput label={t('add_product.product_name')} mode="outlined" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label={t('add_product.category')} mode="outlined" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput label={t('add_product.price')} mode="outlined" keyboardType="numeric" value={price} onChangeText={setPrice} style={styles.input} />
      <TextInput label={t('add_product.quantity')} mode="outlined" keyboardType="numeric" value={quantity} onChangeText={setQuantity} style={styles.input} />
      <TextInput label={t('add_product.description')} mode="outlined" multiline numberOfLines={3} value={description} onChangeText={setDescription} style={styles.input} />

      <Button mode="contained" onPress={handleAddProduct} disabled={isLoading} style={{ marginTop: 20 }}>
        {isLoading ? <ActivityIndicator color="white" /> : t('add_product.submit')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  input: { marginBottom: 15 },
  imagePicker: { height: 150, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', height: '100%' }
});
