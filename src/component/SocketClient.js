"use client"; // Needed for Next.js App Router

import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// Example: use environment variable for production vs dev
// const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://socketbackend-hja7.onrender.com/dhwani-astro";

//16-8
const SOCKET_URL = "http://localhost:8001/dhwani-astro";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem("astro_token"); 
    console.log("Connecting to socket with token:", token);

    if (!token) {
      console.error("JWT token not found. Cannot connect to socket.");
      setLoading(false);
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token, 
      },
    });

    socketInstance.on('connect', () => {
      setLoading(false);
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      console.log("Socket disconnected");
    });

    socketInstance.on('connect_error', (err) => {
      console.error("Socket connection failed:", err.message);
      setLoading(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  if (loading) {
    return <div>Loading socket...</div>;
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
