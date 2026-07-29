import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from '../../api/messageService';

export const fetchConversations = createAsyncThunk('messages/fetchConvos', async () => {
  return await messageService.getConversations();
});

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    messages: {}, // Map of partnerId -> array of messages
    unreadCount: 0,
  },
  reducers: {
    addMessage: (state, action) => {
      const { partnerId, message } = action.payload;
      if (!state.messages[partnerId]) {
        state.messages[partnerId] = [];
      }
      state.messages[partnerId].push(message);
    },
    setMessages: (state, action) => {
      const { partnerId, messages } = action.payload;
      state.messages[partnerId] = messages;
    },
    markAsRead: (state, action) => {
      const partnerId = action.payload;
      const convo = state.conversations.find(c => c.partner.id === partnerId);
      if (convo && convo.unreadCount > 0) {
        state.unreadCount = Math.max(0, state.unreadCount - convo.unreadCount);
        convo.unreadCount = 0;
      }
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.conversations = action.payload;
      state.unreadCount = action.payload.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    });
  }
});

export const { addMessage, setMessages, markAsRead, incrementUnread } = messageSlice.actions;
export default messageSlice.reducer;
