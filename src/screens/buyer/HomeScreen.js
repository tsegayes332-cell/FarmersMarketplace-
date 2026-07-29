import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, Chip, useTheme, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/ProductCard';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Livestock', 'Dairy'];

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector(state => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const debounceTimer = useRef(null);

  const loadData = () => {
    const params = {
      page: 1,
      limit: 20,
      search: debouncedSearch || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    };
    dispatch(fetchProducts(params));
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, debouncedSearch]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 400);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: 10 }}>
      <Searchbar
        placeholder={t('home.search_placeholder')}
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <Chip
            selected={selectedCategory === item}
            onPress={() => setSelectedCategory(item)}
            style={styles.chip}
          >
            {item}
          </Chip>
        )}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: '50%' }}>
             <ProductCard 
              product={item} 
              onPress={(prod) => navigation.navigate('ProductDetail', { product: prod })} 
             />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={{ marginTop: 50 }} size="large" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchbar: { marginBottom: 10 },
  chip: { marginRight: 8, marginBottom: 10 }
});
