import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchProducts } from '../../store/slices/productSlice';
import apiClient, { BACKEND_URL } from '../../api/apiClient';
import { useTranslation } from 'react-i18next';

export default function MyProductsScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items, isLoading } = useSelector(state => state.products);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    dispatch(fetchProducts({ page: 1, limit: 50 }));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(t('my_products.confirm_delete_title'), t('my_products.confirm_delete_msg'), [
      { text: t('common.cancel'), style: "cancel" },
      {
        text: t('common.delete'),
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/products/${id}`);
            loadData();
          } catch (error) {
            alert(t('my_products.delete_failed') + ' ' + error.message);
          }
        }
      }
    ]);
  };

  const farmerProducts = items.filter(p => p.farmerId === user?.id);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={farmerProducts}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={isLoading ? <ActivityIndicator style={{marginTop: 50}} /> : <Text style={{textAlign: 'center', marginTop: 50}}>{t('my_products.no_products')}</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('AddProduct', { product: item })}>
            {item.imageUrl ? (
              <Card.Cover source={{ uri: `${BACKEND_URL}/${item.imageUrl}` }} />
            ) : null}
            <Card.Title
              title={item.name}
              subtitle={`${item.price} ${t('common.etb')} | ${t('my_products.qty_label')} ${item.quantity}`}
              right={(props) => (
                <View style={{flexDirection: 'row'}}>
                  <IconButton {...props} icon="pencil" onPress={() => navigation.navigate('AddProduct', { product: item })} />
                  <IconButton {...props} icon="delete" iconColor={theme.colors.error} onPress={() => handleDelete(item.id)} />
                </View>
              )}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { marginBottom: 10 }
});
