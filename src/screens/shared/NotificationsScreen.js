import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, IconButton } from 'react-native-paper';
import notificationService from '../../api/notificationService';
import { useTranslation } from 'react-i18next';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export default function NotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.log('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleNotificationTap = async (item) => {
    ReactNativeHapticFeedback.trigger('selection');
    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setNotifications(notifications.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      } catch (e) {}
    }

    // Logic to route based on type
    if (item.type === 'NEW_MESSAGE') {
      navigation.navigate('ChatScreen', { partner: { id: item.relatedId, name: 'User' } });
    } else if (item.type === 'ORDER_UPDATE') {
      navigation.navigate('OrderTracking', { orderId: item.relatedId });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{t('notifications.title')}</Text>
        <IconButton icon="check-all" onPress={handleMarkAllRead} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          loading ? <ActivityIndicator style={{marginTop: 50}} /> : <Text style={{textAlign: 'center', marginTop: 50}}>{t('notifications.empty')}</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleNotificationTap(item)}>
            <Card style={[styles.card, !item.isRead && { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                <Text variant="titleMedium" style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>
                  {item.title}
                </Text>
                <Text variant="bodyMedium">{item.message}</Text>
                <Text variant="bodySmall" style={{ color: 'gray', marginTop: 5 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  card: { marginBottom: 10 }
});
