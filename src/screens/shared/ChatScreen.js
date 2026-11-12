import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage } from '../../store/slices/messageSlice';
import messageService from '../../api/messageService';
import useSocket from '../../hooks/useSocket';
import { useTranslation } from 'react-i18next';

export default function ChatScreen({ route, navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();

  const rawPartner = route?.params?.partner;
  const partner = rawPartner || {
    id: route?.params?.receiverId,
    name: route?.params?.title || route?.params?.name || 'User'
  };
  
  const { user } = useSelector(state => state.auth);
  const { messages } = useSelector(state => state.messages);
  const partnerId = partner?.id;
  const chatMessages = partnerId ? (messages[partnerId] || []) : [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  
  const { joinRoom, sendMessage, onMessage, isConnected } = useSocket();

  useEffect(() => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    navigation.setOptions({ title: partner.name || 'Chat' });

    const loadHistory = async () => {
      try {
        const history = await messageService.getChatHistory(partnerId);
        dispatch(setMessages({ partnerId, messages: history }));
      } catch (error) {
        console.error('Failed to load chat history', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
    joinRoom(partnerId);

    const cleanup = onMessage((newMsg) => {
      // If we receive a message that belongs to this conversation
      if (newMsg.senderId === partnerId || newMsg.receiverId === partnerId) {
        dispatch(addMessage({ partnerId, message: newMsg }));
      }
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [partnerId]);

  const handleSend = () => {
    if (!input.trim() || !partnerId) return;

    const newMsg = {
      id: Date.now().toString(), // temporary ID
      senderId: user?.id,
      receiverId: partnerId,
      content: input.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistically add
    dispatch(addMessage({ partnerId, message: newMsg }));
    sendMessage(partnerId, input.trim());
    setInput('');
  };

  const renderBubble = ({ item }) => {
    const isMe = item?.senderId === user?.id;
    let timeStr = '';
    if (item?.createdAt) {
      try {
        const d = new Date(item.createdAt);
        if (!isNaN(d.getTime())) {
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {
        timeStr = '';
      }
    }

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        <View style={[styles.bubble, isMe ? { backgroundColor: theme.colors.primary } : { backgroundColor: '#E0E0E0' }]}>
          <Text style={{ color: isMe ? '#FFF' : '#000' }}>{item?.content || ''}</Text>
          {timeStr ? (
            <Text style={[styles.timestamp, { color: isMe ? 'rgba(255,255,255,0.7)' : 'gray' }]}>
              {timeStr}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item, idx) => item?.id ? String(item.id) : String(idx)}
          renderItem={renderBubble}
          contentContainerStyle={{ padding: 15, flexGrow: 1 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>
                Say hello to start the conversation!
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder={t('chat.type_message')}
          value={input}
          onChangeText={setInput}
          style={styles.input}
          outlineStyle={{ borderRadius: 20 }}
          dense
        />
        <IconButton
          icon="send"
          mode="contained"
          containerColor={theme.colors.primary}
          iconColor="#fff"
          size={24}
          onPress={handleSend}
          disabled={!input.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubbleWrapper: { marginBottom: 10, flexDirection: 'row' },
  myBubbleWrapper: { justifyContent: 'flex-end' },
  theirBubbleWrapper: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 15 },
  timestamp: { fontSize: 10, marginTop: 5, textAlign: 'right' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, marginRight: 10, backgroundColor: '#fff' }
});
