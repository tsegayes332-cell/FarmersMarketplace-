import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView } from 'react-native';
import { Text, TextInput, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage } from '../../store/slices/messageSlice';
import messageService from '../../api/messageService';
import useSocket from '../../hooks/useSocket';
import { useTranslation } from 'react-i18next';

export default function ChatScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { partner } = route.params;
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { messages } = useSelector(state => state.messages);
  const chatMessages = messages[partner.id] || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  
  const { joinRoom, sendMessage, onMessage, isConnected } = useSocket();

  useEffect(() => {
    navigation.setOptions({ title: partner.name });

    const loadHistory = async () => {
      try {
        const history = await messageService.getChatHistory(partner.id);
        dispatch(setMessages({ partnerId: partner.id, messages: history }));
      } catch (error) {
        console.error('Failed to load chat history', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
    joinRoom(partner.id);

    onMessage((newMsg) => {
      // If we receive a message that belongs to this conversation
      if (newMsg.senderId === partner.id || newMsg.receiverId === partner.id) {
        dispatch(addMessage({ partnerId: partner.id, message: newMsg }));
      }
    });

  }, [partner.id]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now().toString(), // temporary ID
      senderId: user.id,
      receiverId: partner.id,
      content: input,
      createdAt: new Date().toISOString()
    };

    // Optimistically add
    dispatch(addMessage({ partnerId: partner.id, message: newMsg }));
    sendMessage(partner.id, input);
    setInput('');
  };

  const renderBubble = ({ item }) => {
    const isMe = item.senderId === user.id;
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        <View style={[styles.bubble, isMe ? { backgroundColor: theme.colors.primary } : { backgroundColor: '#E0E0E0' }]}>
          <Text style={{ color: isMe ? '#FFF' : '#000' }}>{item.content}</Text>
          <Text style={[styles.timestamp, { color: isMe ? 'rgba(255,255,255,0.7)' : 'gray' }]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }} 
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBubble}
          contentContainerStyle={{ padding: 15 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
          disabled={!isConnected || !input.trim()}
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
  inputContainer: { flexDirection: 'row', padding: 10, paddingBottom: 50, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, marginRight: 10, backgroundColor: '#fff' }
});
