import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiClient from '../../api/apiClient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Coffee', 'Livestock', 'Dairy'];

export default function AddProductScreen({ navigation, route }) {
  const editProduct = route.params?.product;
  
  const [name, setName] = useState(editProduct?.name || '');
  const [category, setCategory] = useState(editProduct?.category || 'Vegetables');
  const [price, setPrice] = useState(editProduct?.price != null ? String(editProduct.price) : '');
  const [quantity, setQuantity] = useState(editProduct?.quantity != null ? String(editProduct.quantity) : '');
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
      Alert.alert('Missing Fields', 'Please fill in product name, price, and stock quantity.');
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
        name: image.fileName || 'upload.jpg',
        type: image.type || 'image/jpeg',
        uri: image.uri
      });
    }

    try {
      if (editProduct) {
        await apiClient.put(`/products/${editProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Alert.alert('Success', 'Crop listing updated successfully!');
      } else {
        await apiClient.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Alert.alert('Success', 'Crop listing posted to marketplace!');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.formTitle}>
        {editProduct ? 'Edit Harvest Listing' : 'List New Crop / Produce'}
      </Text>
      <Text style={styles.formSubtitle}>
        Share details of your farm harvest so buyers across Ethiopia can discover and buy your produce.
      </Text>

      {/* Image Picker */}
      <Text style={styles.inputLabel}>Crop Photo</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : editProduct?.imageUrl ? (
          <Image source={{ uri: editProduct.imageUrl }} style={styles.previewImage} />
        ) : (
          <View style={styles.pickerPlaceholder}>
            <Icon name="camera-plus-outline" size={36} color="#15803D" />
            <Text style={styles.pickerText}>Upload Photo of Crop / Harvest</Text>
            <Text style={styles.pickerSubtext}>PNG, JPG up to 10MB</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Category Pills */}
      <Text style={styles.inputLabel}>Select Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Crop Name */}
      <Text style={styles.inputLabel}>Produce Name</Text>
      <TextInput
        placeholder="e.g. Top Grade White Teff (Addis Ababa)"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
        style={styles.textInput}
      />

      {/* Price & Quantity Row */}
      <View style={styles.rowInputs}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.inputLabel}>Price (ETB)</Text>
          <TextInput
            placeholder="e.g. 2800"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            style={styles.textInput}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.inputLabel}>Available Stock / Qty</Text>
          <TextInput
            placeholder="e.g. 100"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            style={styles.textInput}
          />
        </View>
      </View>

      {/* Description */}
      <Text style={styles.inputLabel}>Description & Harvest Details</Text>
      <TextInput
        placeholder="Describe origin, quality grade, organic certification, packaging, etc."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleAddProduct}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Icon name="check-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>
              {editProduct ? 'Save Changes' : 'Publish Crop to Marketplace'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  imagePicker: {
    height: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pickerPlaceholder: {
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 6,
  },
  pickerSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryChipActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#111827',
    marginBottom: 14,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
