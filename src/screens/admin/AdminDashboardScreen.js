import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, useTheme, ActivityIndicator, List, Divider } from 'react-native-paper';
import apiClient from '../../api/apiClient';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
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
    Alert.alert(t('admin.deactivate_user_title'), `${t('admin.deactivate_user_msg', { name: userName })}`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('admin.deactivate'), style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.put(`/admin/users/${userId}/deactivate`);
            loadData();
          } catch (err) {
            alert(t('admin.deactivate_failed'));
          }
        }
      }
    ]);
  };

  const handleDeleteProduct = (productId, productName) => {
    Alert.alert(t('admin.delete_product_title'), `${t('admin.delete_product_msg', { name: productName })}`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/admin/products/${productId}`);
            loadData();
          } catch (err) {
            alert(t('admin.delete_failed'));
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;

  const activeUsers = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>{t('admin.panel_title')}</Text>

      <View style={styles.tabs}>
        {['overview', 'users', 'products'].map(tabKey => (
          <Button key={tabKey} mode={tab === tabKey ? 'contained' : 'text'} onPress={() => setTab(tabKey)} compact>
            {t('admin.' + tabKey)}
          </Button>
        ))}
      </View>

      {tab === 'overview' && (
        <>
          <View style={styles.grid}>
            <Card style={styles.card}><Card.Content><Text variant="bodyLarge">{t('admin.total_users')}</Text><Text variant="headlineMedium">{users.length}</Text></Card.Content></Card>
            <Card style={styles.card}><Card.Content><Text variant="bodyLarge">{t('admin.active')}</Text><Text variant="headlineMedium">{activeUsers.length}</Text></Card.Content></Card>
            <Card style={styles.card}><Card.Content><Text variant="bodyLarge">{t('admin.deactivated')}</Text><Text variant="headlineMedium">{inactiveUsers.length}</Text></Card.Content></Card>
            <Card style={styles.card}><Card.Content><Text variant="bodyLarge">{t('admin.total_products')}</Text><Text variant="headlineMedium">{products.length}</Text></Card.Content></Card>
          </View>
          <Button mode="outlined" textColor={theme.colors.error} onPress={() => dispatch(logoutUser())} style={{ marginTop: 20 }}>
            {t('profile.logout')}
          </Button>
        </>
      )}

      {tab === 'users' && (
        users.map(u => (
          <Card key={u.id} style={styles.listCard}>
            <Card.Content>
              <View style={styles.userRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">{u.name}</Text>
                  <Text>{u.email} | {u.role}</Text>
                  <Text style={{ color: u.isActive ? 'green' : 'red' }}>{u.isActive ? t('admin.active') : t('admin.deactivated')}</Text>
                </View>
                {u.isActive && u.role !== 'ADMIN' && (
                  <Button textColor={theme.colors.error} onPress={() => handleDeactivate(u.id, u.name)}>{t('admin.deactivate')}</Button>
                )}
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      {tab === 'products' && (
        products.map(p => (
          <Card key={p.id} style={styles.listCard}>
            <Card.Content>
              <View style={styles.userRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">{p.name}</Text>
                  <Text>{p.category} | {p.price} {t('common.etb')} | {t('my_products.qty_label')} {p.quantity}</Text>
                  <Text>{t('admin.farmer_label')} {p.farmer?.name || t('common.unknown')}</Text>
                </View>
                <Button textColor={theme.colors.error} onPress={() => handleDeleteProduct(p.id, p.name)}>{t('common.delete')}</Button>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 15 },
  tabs: { flexDirection: 'row', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', marginBottom: 15 },
  listCard: { marginBottom: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center' }
});
