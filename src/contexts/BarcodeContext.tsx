
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a message
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Define the shape of our context
interface BarcodeContextType {
  activeBarcode: string | null;
  setActiveBarcode: (barcode: string | null) => void;
  messages: Record<string, Message[]>;
  addMessage: (barcodeId: string, content: string, sender: 'user' | 'bot') => void;
  clearMessages: (barcodeId: string) => void;
}

// Create the context with a default value
const BarcodeContext = createContext<BarcodeContextType | undefined>(undefined);

// Provider component
export const BarcodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const addMessage = (barcodeId: string, content: string, sender: 'user' | 'bot') => {
    setMessages((prevMessages) => {
      const barcodeMessages = prevMessages[barcodeId] || [];
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        sender,
        timestamp: new Date(),
      };
      
      return {
        ...prevMessages,
        [barcodeId]: [...barcodeMessages, newMessage],
      };
    });
  };

  const clearMessages = (barcodeId: string) => {
    setMessages((prevMessages) => {
      const newMessages = { ...prevMessages };
      delete newMessages[barcodeId];
      return newMessages;
    });
  };

  return (
    <BarcodeContext.Provider
      value={{
        activeBarcode,
        setActiveBarcode,
        messages,
        addMessage,
        clearMessages,
      }}
    >
      {children}
    </BarcodeContext.Provider>
  );
};

// Custom hook to use the barcode context
export const useBarcode = (): BarcodeContextType => {
  const context = useContext(BarcodeContext);
  if (context === undefined) {
    throw new Error('useBarcode must be used within a BarcodeProvider');
  }
  return context;
};
