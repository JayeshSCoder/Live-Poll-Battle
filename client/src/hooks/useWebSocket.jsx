import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [userVote, setUserVote] = useState(null);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Clear any reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket disconnected', event);
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
      
      socket.onerror = (err) => {
        console.error('WebSocket error', err);
        setError('Connection error. Please try again.');
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (err) {
          console.error('Error parsing message', err);
        }
      };
    } catch (err) {
      console.error('WebSocket connection error', err);
      setError('Failed to connect. Please try again.');
    }
  }, [url]);
  
  // Handle incoming messages
  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'room':
        setRoom(data.room);
        if (data.room.userVote) {
          setUserVote(data.room.userVote);
        }
        break;
      
      case 'update':
        setRoom(prev => {
          if (!prev || prev.roomCode !== data.room.roomCode) return prev;
          return { ...prev, ...data.room };
        });
        break;
      
      case 'vote':
        if (data.success) {
          setUserVote(data.option);
        }
        break;
      
      case 'error':
        setError(data.message);
        break;
      
      case 'ping':
        // Respond to keep connection alive
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'pong' }));
        }
        break;
      
      default:
        break;
    }
  }, []);
  
  // Send a message to the server
  const sendMessage = useCallback((message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    } else {
      setError('Not connected to server');
      return false;
    }
  }, []);
  
  // Join a room
  const joinRoom = useCallback((username, roomCode) => {
    return sendMessage({
      type: 'join',
      username,
      roomCode
    });
  }, [sendMessage]);
  
  // Create a room
  const createRoom = useCallback((username, question, options) => {
    return sendMessage({
      type: 'create',
      username,
      question,
      options
    });
  }, [sendMessage]);
  
  // Vote in a room
  const vote = useCallback((option) => {
    return sendMessage({
      type: 'vote',
      option
    });
  }, [sendMessage]);
  
  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, url]);
  
  // Save vote to localStorage
  useEffect(() => {
    if (room && userVote) {
      localStorage.setItem(`vote_${room.roomCode}`, userVote);
    }
  }, [room, userVote]);
  
  // Load vote from localStorage when joining a room
  useEffect(() => {
    if (room && !userVote) {
      const savedVote = localStorage.getItem(`vote_${room.roomCode}`);
      if (savedVote) {
        setUserVote(savedVote);
      }
    }
  }, [room, userVote]);
  
  return {
    isConnected,
    error,
    room,
    userVote,
    joinRoom,
    createRoom,
    vote,
    connect
  };
};

export default useWebSocket;