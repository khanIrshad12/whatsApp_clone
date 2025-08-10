'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage?: boolean;
}

export default function MessageBubble({ message, isOwnMessage = false }: MessageBubbleProps) {
  const { theme } = useTheme();
  

  
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return '✓✓';
      case 'delivered':
        return '✓✓';
      case 'sent':
        return '✓';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return theme === 'dark' ? 'text-blue-300' : 'text-blue-600'; // Different colors for each theme
      case 'delivered':
        return 'text-gray-300';
      case 'sent':
        return 'text-gray-300';
      default:
        return 'text-gray-300';
    }
  };



  const getMessageContent = () => {
    switch (message.type) {
      case 'text':
        return message.text?.body || 'No text content';
      case 'image':
        return '📷 Image';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'document':
        return '📄 Document';
      default:
        return 'Unknown message type';
    }
  };

  const themeClasses = {
    outgoing: theme === 'dark' 
      ? 'bg-whatsapp-bubble-out text-whatsapp-text-primary' 
      : 'bg-whatsapp-green text-white',
    incoming: theme === 'dark' 
      ? 'bg-whatsapp-bubble-in text-whatsapp-text-primary' 
      : 'bg-white text-gray-900 border border-gray-200',
    timeOwn: theme === 'dark' 
      ? 'text-gray-300' 
      : 'text-green-100',
    timeOther: theme === 'dark' 
      ? 'text-whatsapp-text-secondary' 
      : 'text-gray-500',
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-2 mb-1`}>
      <div 
        className={`max-w-[85%] sm:max-w-[75%] lg:max-w-md px-3 py-2 rounded-lg shadow-sm relative ${
          isOwnMessage 
            ? themeClasses.outgoing
            : themeClasses.incoming
        }`}
        style={{
          borderRadius: isOwnMessage 
            ? '7.5px 7.5px 7.5px 0px' 
            : '7.5px 7.5px 0px 7.5px'
        }}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed break-words">
          {getMessageContent()}
        </div>
        
        {/* Time and Status */}
        <div className={`flex items-center justify-end space-x-1 mt-1 ${
          isOwnMessage ? themeClasses.timeOwn : themeClasses.timeOther
        }`}>
          <span className="text-xs">
            {formatTime(message.timestamp)}
          </span>
          {isOwnMessage && (
            <span className={`text-xs ${getStatusColor(message.status)}`}>
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
