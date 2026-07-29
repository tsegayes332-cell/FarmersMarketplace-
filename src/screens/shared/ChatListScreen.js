import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Avatar, useTheme, Badge, ActivityIndicator, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, markAsRead } from '../../store/slices/messageSlice';
import { useTranslation } from 'react-i18next';

export default function ChatListScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { conversations } = useSelector(state => state.messages);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    await dispatch(fetchConversations());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenChat = (partner) => {
    dispatch(markAsRead(partner.id));
    navigation.navigate('ChatScreen', { partner });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleOpenChat(item.partner)} style={styles.item}>
      <Avatar.Text size={50} label={item.partner.name.substring(0, 2).toUpperCase()} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.partner.name}</Text>
          <Text variant="bodySmall" style={{ color: 'gray' }}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1, color: 'gray' }}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <Badge size={22} style={{ backgroundColor: theme.colors.primary }}>{item.unreadCount}</Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 50 }} />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 50 }}>{t('chat.no_conversations')}</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  avatar: { marginRight: 15 },
  content: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
