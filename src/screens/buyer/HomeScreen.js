import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/ProductCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['All', 'Teff', 'Coffee', 'Vegetables', 'Fruits', 'Grains', 'Livestock', 'Dairy'];

const TRADES = [
  {
    id: '1',
    name: 'Abebe',
    action: 'bought',
    amount: '50kg Teff',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: '2',
    name: 'Mekonnen',
    action: 'posted',
    amount: '100kg Barley',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: '3',
    name: 'Almaz',
    action: 'bought',
    amount: '25kg Coffee',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
  },
];

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);

  const CATEGORIES = [
    { key: 'All', label: t('home.all') },
    { key: 'Teff', label: t('home.teff') },
    { key: 'Coffee', label: t('home.coffee') },
    { key: 'Vegetables', label: t('home.vegetables') },
    { key: 'Fruits', label: t('home.fruits') },
    { key: 'Grains', label: t('home.grains') },
    { key: 'Livestock', label: t('home.livestock') },
    { key: 'Dairy', label: t('home.dairy') }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const debounceTimer = useRef(null);

  const loadData = () => {
    const params = {
      page: 1,
      limit: 30,
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
    }, 350);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Top 6 featured crops for the main section matching Image 2
  const topFeatured = items.slice(0, 6);
  const moreProducts = items.slice(6);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#15803D']} />
        }
      >
        {/* Top App Bar with Logo & Actions */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Farmers <Text style={styles.brandSubtitle}>Marketplace</Text></Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="bell-outline" size={24} color="#1F2937" />
              <View style={styles.notifDot} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.avatarWrapper}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image
                source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            placeholder={t('home.search_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Welcome Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>{t('home.welcome_title')}</Text>
          <Text style={styles.heroSubtitle}>{t('home.welcome_subtitle')}</Text>
          <View style={styles.heroAccentLine} />
        </View>

        {/* Categories Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.key)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive
                ]}
              >
                <Text style={[
                  styles.categoryPillText,
                  isSelected && styles.categoryPillTextActive
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Main 3x2 Grid Section */}
        {isLoading && items.length === 0 ? (
          <ActivityIndicator size="large" color="#15803D" style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.gridContainer}>
            {topFeatured.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard
                  product={item}
                  onPress={(prod) => navigation.navigate('ProductDetail', { product: prod })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Latest Trades & Offers Section */}
        <View style={styles.tradesSection}>
          <Text style={styles.sectionTitle}>{t('home.latest_trades')}</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {TRADES.map((trade) => (
              <View key={trade.id} style={styles.tradeCard}>
                <Image source={{ uri: trade.avatar }} style={styles.tradeAvatar} />
                <View style={{ marginLeft: 8, marginRight: 6 }}>
                  <Text style={styles.tradeText}>
                    <Text style={{ fontWeight: 'bold', color: '#111827' }}>{trade.name}</Text> {trade.action}
                  </Text>
                  <Text style={styles.tradeAmount}>{trade.amount}</Text>
                </View>
                <Icon name="arrow-top-right" size={16} color="#15803D" />
              </View>
            ))}
          </ScrollView>

          {/* Featured Farmer Widget (matching Image 2) */}
          <View style={styles.featuredFarmerCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' }}
              style={styles.featuredFarmerAvatar}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.farmerSubTag}>{t('home.featured_farmer')}</Text>
              <Text style={styles.featuredFarmerName}>Samuel Haile • Hawassa</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={styles.topSellerTag}>⭐ {t('home.top_seller')}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.viewFarmerBtn}
              onPress={() => setSelectedCategory('Vegetables')}
            >
              <Text style={styles.viewFarmerBtnText}>{t('home.view_crops')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* More Products (if available) */}
        {moreProducts.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 14 }]}>More Farm Harvests</Text>
            <View style={styles.gridContainer}>
              {moreProducts.map((item) => (
                <View key={item.id} style={styles.gridItem}>
                  <ProductCard
                    product={item}
                    onPress={(prod) => navigation.navigate('ProductDetail', { product: prod })}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#15803D',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
    marginHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
  heroBanner: {
    backgroundColor: '#15803D',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#D1FAE5',
    fontWeight: '500',
  },
  heroAccentLine: {
    width: 32,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#86EFAC',
    alignSelf: 'center',
    marginTop: 10,
  },
  categoryScroll: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryPillActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  categoryPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '33.33%',
  },
  tradesSection: {
    paddingHorizontal: 14,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  tradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tradeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  tradeText: {
    fontSize: 11.5,
    color: '#1F2937',
  },
  tradeAmount: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  featuredFarmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  featuredFarmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#15803D',
  },
  farmerSubTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  featuredFarmerName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  topSellerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  verifiedTag: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
  },
  viewFarmerBtn: {
    backgroundColor: '#15803D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewFarmerBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
