import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../api/apiClient';

export default function useSocket() {
  const { token } = useSelector(state => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Remove /api from BASE_URL to connect to root socket namespace
    const socketUrl = BASE_URL.replace('/api', '');
    
    socketRef.current = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const joinRoom = (targetUserId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_room', { targetUserId });
    }
  };

  const sendMessage = (receiverId, content) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', { receiverId, content });
    }
  };

  const onMessage = (callback) => {
    if (socketRef.current) {
      // remove old listener to avoid duplicates if re-rendered
      socketRef.current.off('receive_message');
      socketRef.current.on('receive_message', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    sendMessage,
    onMessage
  };
}
