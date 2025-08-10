'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Plus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import MessageBubble from './MessageBubble';
import type { Conversation, Message } from '@/types';

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatArea({ conversation, messages, onSendMessage }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { theme } = useTheme();

  // Smart auto-scroll: only scroll to bottom if user is already at bottom
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Check if user is at bottom when scrolling
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const threshold = 100; // 100px threshold
      const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
      setIsAtBottom(atBottom);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && conversation) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      // Ensure we scroll to bottom after sending
      setIsAtBottom(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      const dateKey = formatDate(message.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-whatsapp-chat-dark' : 'bg-gray-50',
    emptyBg: theme === 'dark' ? 'bg-whatsapp-chat-dark' : 'bg-gray-50',
    header: theme === 'dark' ? 'bg-whatsapp-sidebar-dark border-whatsapp-border-dark' : 'bg-white border-gray-200',
    text: theme === 'dark' ? 'text-whatsapp-text-primary' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-whatsapp-text-secondary' : 'text-gray-500',
    hover: theme === 'dark' ? 'hover:bg-whatsapp-hover-dark' : 'hover:bg-gray-100',
    input: theme === 'dark' ? 'bg-whatsapp-input-dark text-whatsapp-text-primary placeholder-whatsapp-text-secondary' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200',
    inputContainer: theme === 'dark' ? 'bg-whatsapp-sidebar-dark border-whatsapp-border-dark' : 'bg-white border-gray-200',
    dateSeparator: theme === 'dark' ? 'bg-whatsapp-input-dark text-whatsapp-text-secondary' : 'bg-white text-gray-500',
  };

  if (!conversation) {
    return (
      <div className={`flex-1 ${themeClasses.emptyBg} flex items-center justify-center p-4`}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-whatsapp-green rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl font-bold">💬</span>
          </div>
          <h2 className={`text-2xl font-light ${themeClasses.text} mb-2`}>WhatsApp Web</h2>
          <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>
            Send and receive messages without keeping your phone online.<br/>
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={`flex-1 flex flex-col ${themeClasses.bg} min-h-0`}>
      {/* Chat Header - Hidden on mobile since we have a separate mobile header */}
      <div className={`${themeClasses.header} border-b px-4 py-3 flex-shrink-0 hidden lg:block`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">
                {conversation.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`font-medium ${themeClasses.text} truncate`}>{conversation.user.name}</h2>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${themeClasses.textSecondary} truncate`}>online</p>
                <p className={`text-sm ${themeClasses.textSecondary} truncate ml-2`}>
                  ({conversation.user.phone})
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button className={`p-2 ${themeClasses.hover} rounded-full transition-colors`}>
              <Video className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>
            <button className={`p-2 ${themeClasses.hover} rounded-full transition-colors`}>
              <Phone className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>
            <button className={`p-2 ${themeClasses.hover} rounded-full transition-colors`}>
              <Search className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>
            <button className={`p-2 ${themeClasses.hover} rounded-full transition-colors`}>
              <MoreVertical className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
                 className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 min-h-0"
        style={theme === 'dark' ? {
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        } : {}}
      >
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center mb-4">
              <div className={`${themeClasses.dateSeparator} px-3 py-1 rounded-lg shadow-sm`}>
                <span className="text-xs font-medium">{date}</span>
              </div>
            </div>
            
                         {/* Messages for this date */}
             <div className="space-y-1">
               {dateMessages.map((message, index) => {
                 const isOwnMessage = message.from === '918329446654';
                 
                 return (
                   <MessageBubble
                     key={`${message._id}-${message.status}`}
                     message={message}
                     isOwnMessage={isOwnMessage}
                   />
                 );
               })}
             </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

             {/* Message Input */}
       <div className={`${themeClasses.inputContainer} border-t p-3 sm:p-4 flex-shrink-0`}>
         <div className="flex items-end space-x-2 sm:space-x-3">
                     <button className={`p-2 ${themeClasses.hover} rounded-full transition-colors flex-shrink-0 hidden sm:block`}>
             <Smile className={`w-6 h-6 ${themeClasses.textSecondary}`} />
           </button>
           <button className={`p-2 ${themeClasses.hover} rounded-full transition-colors flex-shrink-0 hidden sm:block`}>
             <Plus className={`w-6 h-6 ${themeClasses.textSecondary}`} />
           </button>
          <div className="flex-1 relative min-w-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className={`w-full px-4 py-3 ${themeClasses.input} border-0 rounded-lg resize-none focus:outline-none text-sm`}
              style={{ 
                minHeight: '44px',
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 ${themeClasses.hover} rounded-full transition-colors flex-shrink-0`}
          >
            <Send className={`w-6 h-6 ${themeClasses.textSecondary}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
