// src/contexts/BarcodeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { api, ChatRequest } from '@/lib/api'; // Make sure to import the API

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
  sendMessageToApi: (barcodeId: string, content: string) => Promise<void>;
  clearMessages: (barcodeId: string) => void;
  isLoading: boolean;
}

// Create the context with a default value
const BarcodeContext = createContext<BarcodeContextType | undefined>(undefined);

// Provider component
export const BarcodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Send message to API
  const sendMessageToApi = async (barcodeId: string, content: string) => {
    // Add user message to UI immediately
    addMessage(barcodeId, content, 'user');
    
    try {
      setIsLoading(true);
      
      // Get conversation history for this barcode
      const barcodeMessages = messages[barcodeId] || [];
      
      // Convert message format for API - fixing the type issue
      const apiMessages = barcodeMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
      
      // Prepare the request
      const request: ChatRequest = {
        message: content,
        conversation_history: apiMessages
      };
      
      // Call the API with real API call
      const response = await api.chat(request);
      
      // Add the API response to our messages
      addMessage(barcodeId, response.response, 'bot');
      
    } catch (error) {
      console.error('Failed to send message to API:', error);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        sendMessageToApi,
        clearMessages,
        isLoading,
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