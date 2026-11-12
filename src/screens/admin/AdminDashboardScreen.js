import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import apiClient from '../../api/apiClient';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AdminDashboardScreen() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/products')
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDeactivate = (userId, userName) => {
    Alert.alert('Deactivate Account', `Are you sure you want to deactivate ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.put(`/admin/users/${userId}/deactivate`);
            loadData();
          } catch (err) {
            Alert.alert('Error', 'Failed to deactivate account.');
          }
        }
      }
    ]);
  };

  const handleDeleteProduct = (productId, productName) => {
    Alert.alert('Remove Listing', `Delete ${productName} from platform?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/admin/products/${productId}`);
            loadData();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete product.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#15803D" />
      </View>
    );
  }

  const activeUsers = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTag}>🛡️ ADMINISTRATION</Text>
          <Text style={styles.headerTitle}>System Control Panel</Text>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => dispatch(logoutUser())}
        >
          <Icon name="logout" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { key: 'overview', label: 'Platform Overview', icon: 'view-dashboard-outline' },
          { key: 'users', label: `Users (${users.length})`, icon: 'account-group-outline' },
          { key: 'products', label: `Crops (${products.length})`, icon: 'sprout-outline' }
        ].map(item => {
          const isSelected = tab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.tabPill, isSelected && styles.tabPillActive]}
              onPress={() => setTab(item.key)}
            >
              <Icon 
                name={item.icon} 
                size={16} 
                color={isSelected ? '#FFFFFF' : '#4B5563'} 
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {tab === 'overview' && (
        <>
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Registered Users</Text>
              <Text style={styles.statValue}>{users.length}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Active Members</Text>
              <Text style={[styles.statValue, { color: '#15803D' }]}>{activeUsers.length}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Deactivated Accounts</Text>
              <Text style={[styles.statValue, { color: '#B91C1C' }]}>{inactiveUsers.length}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Listed Crops</Text>
              <Text style={[styles.statValue, { color: '#111827' }]}>{products.length}</Text>
            </View>
          </View>
        </>
      )}

      {tab === 'users' && (
        users.map(u => (
          <View key={u.id} style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.itemName}>{u.name}</Text>
                <View style={[
                  styles.roleBadge,
                  u.role === 'FARMER' ? { backgroundColor: '#DCFCE7' } : { backgroundColor: '#DBEAFE' }
                ]}>
                  <Text style={[
                    styles.roleBadgeText,
                    u.role === 'FARMER' ? { color: '#15803D' } : { color: '#1E40AF' }
                  ]}>
                    {u.role}
                  </Text>
                </View>
              </View>

              <Text style={styles.itemSub}>{u.email} {u.phone ? `• ${u.phone}` : ''}</Text>
              <Text style={[styles.statusLine, { color: u.isActive ? '#15803D' : '#DC2626' }]}>
                ● {u.isActive ? 'Active Account' : 'Deactivated'}
              </Text>
            </View>

            {u.isActive && u.role !== 'ADMIN' && (
              <TouchableOpacity
                style={styles.deactivateBtn}
                onPress={() => handleDeactivate(u.id, u.name)}
              >
                <Text style={styles.deactivateBtnText}>Deactivate</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {tab === 'products' && (
        products.map(p => (
          <View key={p.id} style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{p.name}</Text>
              <Text style={styles.itemSub}>{p.category} • {p.price} ETB • Qty: {p.quantity}</Text>
              <Text style={styles.farmerSub}>Seller: {p.farmer?.name || 'Farmer'}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteCropBtn}
              onPress={() => handleDeleteProduct(p.id, p.name)}
            >
              <Icon name="trash-can-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 8,
  },
  headerTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabPillActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  itemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  farmerSub: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    marginTop: 1,
  },
  statusLine: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  deactivateBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deactivateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteCropBtn: {
    padding: 8,
  },
});
