import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Text,
  ActivityIndicator
} from 'react-native';
import { Avatar, Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, markAsRead } from '../../store/slices/messageSlice';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ChatListScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { conversations } = useSelector(state => state.messages);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      await dispatch(fetchConversations());
    } finally {
      setLoading(false);
    }
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
    if (!partner) return;
    const partnerId = partner.id;
    if (partnerId) {
      dispatch(markAsRead(partnerId));
    }
    navigation.navigate('ChatScreen', { partner });
  };

  const listData = Array.isArray(conversations) ? conversations : [];

  const renderItem = ({ item, index }) => {
    const partner = item?.partner || { id: item?.id, name: 'Farmer' };
    const partnerName = partner?.name || 'Farmer';
    const initials = (partnerName.trim().slice(0, 2) || 'FM').toUpperCase();
    
    let timeFormatted = '';
    if (item?.timestamp) {
      try {
        const d = new Date(item.timestamp);
        if (!isNaN(d.getTime())) {
          timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {
        timeFormatted = '';
      }
    }

    const unread = Number(item?.unreadCount) || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleOpenChat(partner)}
        style={styles.chatCard}
      >
        <Avatar.Text
          size={50}
          label={initials}
          style={styles.avatar}
          labelStyle={styles.avatarLabel}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partnerName}
            </Text>
            {timeFormatted ? (
              <Text style={styles.timeText}>{timeFormatted}</Text>
            ) : null}
          </View>

          <View style={styles.messageRow}>
            <Text style={[styles.lastMessage, unread > 0 && styles.lastMessageBold]} numberOfLines={1}>
              {item?.lastMessage || t('chat.type_message')}
            </Text>
            {unread > 0 && (
              <Badge size={20} style={styles.badge}>{unread}</Badge>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.messages')}</Text>
        <Text style={styles.headerSubtitle}>Direct messages with farmers & producers</Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item, index) => String(item?.id || item?.partner?.id || index)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#15803D']} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#15803D" />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="chat-processing-outline" size={48} color="#15803D" />
              </View>
              <Text style={styles.emptyTitle}>{t('chat.no_conversations')}</Text>
              <Text style={styles.emptySubtitle}>
                Browse marketplace produce and tap "Contact Farmer" to start a direct trade conversation!
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Home')}
              >
                <Icon name="shopping-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.browseBtnText}>{t('order.start_shopping')}</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    padding: 12,
    paddingBottom: 110,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  avatar: {
    backgroundColor: '#E5E7EB',
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803D',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    marginRight: 6,
  },
  lastMessageBold: {
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 13,
  },
});
