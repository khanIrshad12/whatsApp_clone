'use client';

import React, { createContext, useContext } from 'react';

interface SocketContextType {
  socket: null;
  isConnected: boolean;
  joinUser: (userData: any) => void;
  sendMessage: (messageData: any) => void;
  updateMessageStatus: (statusData: any) => void;
  sendTyping: (userData: any) => void;
  sendStopTyping: (userData: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value: SocketContextType = {
    socket: null,
    isConnected: false,
    joinUser: () => {},
    sendMessage: () => {},
    updateMessageStatus: () => {},
    sendTyping: () => {},
    sendStopTyping: () => {},
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

