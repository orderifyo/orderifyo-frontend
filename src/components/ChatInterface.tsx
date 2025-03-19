// src/components/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBarcode } from '@/contexts/BarcodeContext';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  Send, ArrowLeft, Bot, User, Sparkles, MessageSquare, 
  MoreVertical, Menu, Bell, TableProperties, Clock 
} from 'lucide-react';
import { toast } from 'sonner';

import DOMPurify from 'dompurify';

// HTML color modifier for dark theme
const modifyHtmlForDarkTheme = (html: string): string => {
  // Sanitize the HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html);
  
  // Create a temporary DOM element to modify the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedHtml;
  
  // Find all elements with style attributes
  const elementsWithStyle = tempDiv.querySelectorAll('[style]');
  
  // Modify the styles for dark theme
  elementsWithStyle.forEach(el => {
    let style = el.getAttribute('style') || '';
    
    // Replace dark text colors with light colors
    style = style.replace(/color:\s*#333/g, 'color: #e0e0e0');
    style = style.replace(/color:\s*#2c3e50/g, 'color: #a0d8ef');
    style = style.replace(/color:\s*black/g, 'color: #e0e0e0');
    
    // Set background colors if needed
    if (el.tagName === 'DIV' && !style.includes('background')) {
      style += '; background-color: rgba(30, 30, 40, 0.6); border-radius: 8px; padding: 12px;';
    }
    
    // Update the style attribute
    el.setAttribute('style', style);
  });
  
  // Find all headings and make them more vibrant
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    let style = heading.getAttribute('style') || '';
    
    // Replace heading colors with more vibrant colors
    if (heading.tagName === 'H2') {
      style = style.replace(/color:[^;]+/g, 'color: #a47bf8');
      if (!style.includes('color:')) {
        style += '; color: #a47bf8;';
      }
    } else if (heading.tagName === 'H3') {
      style = style.replace(/color:[^;]+/g, 'color: #6ea3f7');
      if (!style.includes('color:')) {
        style += '; color: #6ea3f7;';
      }
    }
    
    heading.setAttribute('style', style);
  });
  
  // Add custom styling for list items
  const listItems = tempDiv.querySelectorAll('li');
  listItems.forEach(li => {
    let style = li.getAttribute('style') || '';
    style += '; color: #e0e0e0; margin-bottom: 4px;';
    li.setAttribute('style', style);
  });
  
  return tempDiv.innerHTML;
};

const fixHtmlEncoding = (html: string): string => {
  // Fix rupee symbol encoding
  return html.replace(/â‚¹/g, '₹');
};

const processHtmlContent = (html: string): string => {
  // First fix any encoding issues
  let processedHtml = fixHtmlEncoding(html);
  
  // Create a temporary DOM element to modify the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = processedHtml;
  
  // Process all headings
  const headings = tempDiv.querySelectorAll('h2, h3');
  headings.forEach(heading => {
    if (heading.tagName === 'H2') {
      heading.style.color = '#00ff2f'; // Cyan color for h2
    } else if (heading.tagName === 'H3') {
      heading.style.color = '#a47bf8'; // Purple color for h3
    }
  });
  
  // Process all list items
  const listItems = tempDiv.querySelectorAll('li');
  listItems.forEach(item => {
    item.style.color = 'rgba(255, 255, 255, 0.8)';
  });
  
  // Process all paragraphs
  const paragraphs = tempDiv.querySelectorAll('p');
  paragraphs.forEach(para => {
    para.style.color = 'rgba(255, 255, 255, 0.8)';
  });
  
  return tempDiv.innerHTML;
};


const ChatInterface: React.FC = () => {
  const { barcodeId } = useParams<{ barcodeId: string }>();
  const { messages, sendMessageToApi, activeBarcode, setActiveBarcode, isLoading } = useBarcode();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Suggested quick messages
  const suggestions = [
    "Can I see the menu please?",
    "We need assistance at our table",
    "Could we get our check?",
    "We'd like to order drinks"
  ];

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set active barcode from URL if needed
  useEffect(() => {
    if (barcodeId && barcodeId !== activeBarcode) {
      setActiveBarcode(barcodeId);
    }
  }, [barcodeId, activeBarcode, setActiveBarcode]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const handleSendMessage = async (e: React.FormEvent | null, suggestedMessage?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = suggestedMessage || input;
    if (!messageToSend.trim() || !activeBarcode) return;
    
    // Clear input immediately for better UX
    setInput('');
    
    try {
      // This will add the user message and then call the API
      await sendMessageToApi(activeBarcode, messageToSend);
      
      // Hide suggestions after first message
      if (showSuggestions) {
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to get a response. Please try again.");
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // Get messages for current barcode
  const currentMessages = activeBarcode ? messages[activeBarcode] || [] : [];
  
  // Current time for status display
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-100 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between bg-black/20 backdrop-blur-md shadow-lg relative z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="flex items-center bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700/50">
              <Sparkles className="h-4 w-4 text-purple-400 mr-1" />
              <h1 className="font-medium text-sm bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                TableChat
              </h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-3 py-1 bg-purple-900/40 text-purple-200 rounded-full text-xs font-medium border border-purple-500/20 backdrop-blur-sm">
            <TableProperties className="h-3 w-3 mr-1" />
            <span>{activeBarcode || 'No table'}</span>
          </div>
          
          <div className="flex items-center space-x-1 px-2 py-1 bg-zinc-800/40 text-zinc-300 rounded-full text-xs border border-zinc-700/20 backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            <span>{currentTime}</span>
          </div>
          
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-full h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-full h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/10 via-zinc-900 to-zinc-950 relative">
        {/* Ambient background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full filter blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
      
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-4 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-500/10">
              <MessageSquare className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-medium text-white">Welcome to Table {activeBarcode}</h3>
            <p className="text-zinc-300 max-w-xs">
              Send a message to get started. You can ask for assistance, place orders, or request information.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xs mt-2">
              {suggestions.map((suggestion, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendMessage(null, suggestion)}
                  className="bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all duration-300"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2 relative z-10">
            {currentMessages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-appear`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`flex items-start max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className={`h-8 w-8 ${msg.sender === 'user' ? 'ml-2' : 'mr-2'} flex-shrink-0 ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                  } ring-2 ${
                    msg.sender === 'user' ? 'ring-purple-500/20' : 'ring-blue-500/20'
                  } backdrop-blur-sm`}>
                    {msg.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </Avatar>
                  <div 
                    className={`p-3 rounded-lg shadow-md ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none border border-purple-500/20' 
                        : 'bg-zinc-800/70 backdrop-blur-sm border border-zinc-700/50 rounded-tl-none text-zinc-100'
                    }`}
                  >
                    {/* Add this function to detect if content is HTML */}
                    {msg.sender === 'bot' && msg.content.trim().startsWith('<') ? (
                      <div 
                        className="chat-html-content" 
                        dangerouslySetInnerHTML={{ __html: fixHtmlEncoding(msg.content) }} 
                      />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-purple-200/80' : 'text-zinc-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start message-appear">
                <div className="flex items-start max-w-[85%] flex-row">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-600 ring-2 ring-blue-500/20">
                    <Bot className="h-4 w-4 text-white" />
                  </Avatar>
                  <div className="p-3 rounded-lg shadow-md bg-zinc-800/70 backdrop-blur-sm border border-zinc-700/50 rounded-tl-none">
                    <div className="flex space-x-1 py-1 px-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-typing"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-typing" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-typing" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick suggestions after messages */}
            {showSuggestions && currentMessages.length > 0 && !isLoading && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center fade-in-up">
                {suggestions.map((suggestion, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSendMessage(null, suggestion)}
                    className="bg-zinc-800/40 border-zinc-700/50 text-zinc-300 hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all duration-300 backdrop-blur-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <form 
        onSubmit={handleSendMessage} 
        className="px-4 py-3 bg-black/30 border-t border-zinc-800/80 backdrop-blur-md shadow-xl relative z-10"
      >
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 py-3 px-4 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-zinc-100 placeholder:text-zinc-500"
          />
          <Button 
            type="submit" 
            className="rounded-l-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-[50px] px-4 shadow-lg shadow-purple-900/20"
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
          
          {/* Animated glow effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-lg blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;