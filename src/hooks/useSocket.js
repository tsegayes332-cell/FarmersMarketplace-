import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { BASE_URL } from '../api/apiClient';
import { addMessage, incrementUnread } from '../store/slices/messageSlice';

let globalSocket = null;
let globalCallbacks = [];
let globalPendingRooms = [];
let globalConnected = false;

function getOrCreateSocket(token) {
  if (globalSocket && globalSocket.connected) return globalSocket;
  if (globalSocket) {
    globalSocket.connect();
    return globalSocket;
  }
  const socketUrl = BASE_URL.replace('/api', '');
  globalSocket = io(socketUrl, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
  globalSocket.on('connect', () => {
    globalConnected = true;
    globalPendingRooms.forEach((id) => globalSocket.emit('join_room', { targetUserId: id }));
    globalPendingRooms = [];
  });
  globalSocket.on('disconnect', () => { globalConnected = false; });
  globalSocket.on('receive_message', (data) => {
    globalCallbacks.forEach((cb) => cb(data));
  });
  return globalSocket;
}

export function useSocketGlobal() {
  const token = useSelector(state => state.auth.token);
  const myId = useSelector(state => state.auth.user?.id);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || !myId) return;
    const socket = getOrCreateSocket(token);

    const handler = (msg) => {
      // Determine who the partner is (the one who didn't send it)
      const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      dispatch(addMessage({ partnerId, message: msg }));
      // Only increment unread for incoming messages
      if (msg.senderId !== myId) {
        dispatch(incrementUnread());
      }
    };
    globalCallbacks.push(handler);

    return () => {
      globalCallbacks = globalCallbacks.filter((cb) => cb !== handler);
    };
  }, [token, myId, dispatch]);

  return null;
}

export default function useSocket() {
  const token = useSelector(state => state.auth.token);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket = getOrCreateSocket(token);
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [token]);

  const joinRoom = useCallback((targetUserId) => {
    const socket = globalSocket;
    if (socket?.connected) {
      socket.emit('join_room', { targetUserId });
    } else if (!globalPendingRooms.includes(targetUserId)) {
      globalPendingRooms.push(targetUserId);
    }
  }, []);

  const sendMessage = useCallback((receiverId, content) => {
    if (globalSocket?.connected) {
      globalSocket.emit('send_message', { receiverId, content });
    }
  }, []);

  const onMessage = useCallback((callback) => {
    globalCallbacks.push(callback);
    return () => {
      globalCallbacks = globalCallbacks.filter((cb) => cb !== callback);
    };
  }, []);

  return { isConnected, joinRoom, sendMessage, onMessage };
}
