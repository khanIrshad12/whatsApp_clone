'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Send, Phone, Edit2 } from 'lucide-react';

interface Message {
  _id: string;
  from: string;
  to: string;
  text: { body: string } | string;
  timestamp: Date;
  status: string;
  type: string;
  meta_msg_id?: string;
}

const BUSINESS_NUMBER = '918329446654';

export default function CustomerChat() {
  const params = useParams();
  const mobile = params?.mobile as string;
  const { theme } = useTheme();
  
  if (!mobile) return <div>Invalid mobile number</div>;



  // All state variables
  const [customerName, setCustomerName] = useState('');
  const [tempName, setTempName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/conversations/${mobile}`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 404) {
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      setMessages([]);
    }
  }, [mobile]);

  useEffect(() => {
    fetchCustomerName();
  }, [mobile]);

  // Initialize tempName with current name when showing name editor
  useEffect(() => {
    if (showNameEditor && customerName && !tempName) {
      setTempName(customerName);
    }
  }, [showNameEditor, customerName, tempName]);

  useEffect(() => {
    if (!isNameSet) return;

    // Initial fetch
    fetchMessages();
    // Don't mark messages as read automatically - let business side handle it

    // Poll every 2 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [isNameSet, fetchMessages]); // Added fetchMessages to dependency array

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

  const fetchCustomerName = async () => {
    try {
      // Check database for existing conversation and name
      const response = await fetch(`/api/conversations/${mobile}`);
      if (response.ok) {
        const messages = await response.json();
        
        // First, check if there's a conversation with a name
        const conversationResponse = await fetch('/api/conversations');
        if (conversationResponse.ok) {
          const conversations = await conversationResponse.json();
          const existingConversation = conversations.find((conv: any) => conv.wa_id === mobile);
          
          if (existingConversation?.user?.name) {
            setCustomerName(existingConversation.user.name);
            setIsNameSet(true);
            return;
          }
        }
        
        // If no conversation name, check messages for contact name
        if (messages.length > 0) {
          const customerMessage = messages.find((msg: any) => msg.from === mobile);
          if (customerMessage?.contactName) {
            const name = customerMessage.contactName;
            setCustomerName(name);
            setIsNameSet(true);
            return;
          }
        }
      }
      
      // If no name found anywhere, show name editor
      setShowNameEditor(true);
    } catch (error) {
      console.error('❌ Error fetching customer name:', error);
      setShowNameEditor(true);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const response = await fetch(`/api/conversations/${mobile}/mark-read`, { method: 'POST' });
      if (response.ok) {
        // Messages marked as read successfully
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  const saveName = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setCustomerName(trimmedName);
    setIsNameSet(true);
    setShowNameEditor(false);
    setTempName('');

    // Update in database
    try {
      const response = await fetch(`/api/customer/${mobile}/update-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      });

      if (response.ok) {
        console.log('✅ Customer name updated in database');
        // Show a brief success message (you can add a toast notification here)
        alert('Name updated successfully! The change will be reflected on the business side.');
      } else {
        console.error('❌ Failed to update customer name in database');
        alert('Failed to update name. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error updating customer name in database:', error);
      alert('Error updating name. Please try again.');
    }
  };

  const clearName = async () => {
    setCustomerName('');
    setIsNameSet(false);
    setShowNameEditor(false);
    setTempName('');

    // Clear name from database
    try {
      const response = await fetch(`/api/customer/${mobile}/update-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' })
      });

      if (response.ok) {
        console.log('✅ Customer name cleared from database');
      } else {
        console.error('❌ Failed to clear customer name from database');
      }
    } catch (error) {
      console.error('❌ Error clearing customer name from database:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !customerName) return;

    setLoading(true);
    try {
      const messageData = {
        from: mobile,
        to: '918329446654', // Business phone number
        text: newMessage.trim(),
        waId: mobile,
        contactName: customerName,
        type: 'text'
      };



      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const newMessageData = await response.json();

        
        // Format the message properly for local state
        const formattedMessage = {
          _id: newMessageData._id || newMessageData.id,
          from: newMessageData.from,
          to: newMessageData.to,
          text: newMessageData.text, // API already returns the correct format
          timestamp: newMessageData.timestamp,
          status: newMessageData.status,
          type: newMessageData.type,
          meta_msg_id: newMessageData.meta_msg_id || newMessageData.messageId
        };
        
        // Add to local state immediately
        setMessages(prev => [...prev, formattedMessage]);
        setNewMessage('');
        // Ensure we scroll to bottom after sending
        setIsAtBottom(true);

        // CRITICAL: Trigger business-side conversations update for real-time count and last message
        setTimeout(async () => {
          try {
            console.log('🔄 CUSTOMER - Triggering business-side update after 1000ms delay');
            // Trigger conversations API to refresh business sidebar
            const response = await fetch(`/api/conversations?trigger=customer&t=${Date.now()}`, {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            });
            console.log('🔄 CUSTOMER - Business-side update triggered successfully');
          } catch (error) {
            console.error('❌ CUSTOMER - Error triggering business-side update:', error);
          }
        }, 1000); // Increased delay to ensure database transaction is fully committed

        // If this is the first message, ensure customer name is saved in database
        if (messages.length === 0) {
          try {
            await fetch(`/api/customer/${mobile}/update-name`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: customerName })
            });
          } catch (error) {
            console.error('❌ Error saving customer name to database:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Define theme classes
  const themeClasses = {
    bg: theme === 'dark' ? 'bg-whatsapp-bg' : 'bg-gray-100',
    container: theme === 'dark' ? 'bg-whatsapp-sidebar-dark' : 'bg-white',
    text: theme === 'dark' ? 'text-whatsapp-text-primary' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-whatsapp-text-secondary' : 'text-gray-600',
    border: theme === 'dark' ? 'border-whatsapp-border-dark' : 'border-gray-200',
    input: theme === 'dark' ? 'bg-whatsapp-input-dark text-whatsapp-text-primary placeholder-whatsapp-text-secondary border-whatsapp-border-dark' : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300',
    button: theme === 'dark' ? 'bg-whatsapp-green hover:bg-whatsapp-green-dark' : 'bg-green-500 hover:bg-green-600',
    header: theme === 'dark' ? 'bg-whatsapp-sidebar-dark border-whatsapp-border-dark' : 'bg-white border-gray-200',
    chatBg: theme === 'dark' ? 'bg-whatsapp-chat-dark' : 'bg-gray-50',
    messageBubbleOwn: theme === 'dark' ? 'bg-whatsapp-bubble-out text-whatsapp-text-primary' : 'bg-green-500 text-white',
    messageBubbleOther: theme === 'dark' ? 'bg-whatsapp-bubble-in text-whatsapp-text-primary' : 'bg-white text-gray-800 border border-gray-200',
    timeTextOwn: theme === 'dark' ? 'text-gray-300' : 'text-green-100',
    timeTextOther: theme === 'dark' ? 'text-whatsapp-text-secondary' : 'text-gray-500',
    hover: theme === 'dark' ? 'hover:bg-whatsapp-hover-dark' : 'hover:bg-gray-100',
  };

  // Name input/edit component
  const NameEditor = ({ isFirstTime }: { isFirstTime: boolean }) => (
    <div className="space-y-4">
      <div>
        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
          {isFirstTime ? 'Your Name' : 'Update Your Name'}
        </label>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder={isFirstTime ? "Enter your name" : customerName || "Enter your name"}
          className={`w-full px-3 py-2 border ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          onKeyPress={async (e) => {
            if (e.key === 'Enter' && tempName.trim()) {
              await saveName(tempName.trim());
            }
          }}
          autoFocus
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={async () => tempName.trim() && await saveName(tempName.trim())}
          disabled={!tempName.trim()}
          className={`flex-1 ${themeClasses.button} text-white py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
        >
          {isFirstTime ? 'Start Chat' : 'Save Name'}
        </button>
        
        {!isFirstTime && (
          <button
            onClick={() => {
              setShowNameEditor(false);
              setTempName('');
            }}
            className={`px-4 py-2 border ${themeClasses.border} ${themeClasses.textSecondary} rounded-lg ${themeClasses.hover} transition-colors`}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Clear name option for existing users */}
      {!isFirstTime && customerName && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={async () => await clearName()}
            className={`w-full text-sm ${themeClasses.textSecondary} hover:text-red-500 transition-colors`}
          >
            Clear saved name
          </button>
        </div>
      )}
    </div>
  );

  // First time setup (no saved name)
  if (!isNameSet && !showNameEditor) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}>
        <div className={`${themeClasses.container} rounded-lg shadow-lg p-8 w-full max-w-md`}>
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${themeClasses.button} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>Customer Chat</h1>
            <p className={themeClasses.textSecondary}>Mobile: {mobile}</p>
          </div>
          
          <NameEditor isFirstTime={true} />
        </div>
      </div>
    );
  }

  // Name editor modal
  if (showNameEditor) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}>
        <div className={`${themeClasses.container} rounded-lg shadow-lg p-8 w-full max-w-md`}>
          <div className="text-center mb-6">
            <h2 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
              {customerName ? 'Update Your Name' : 'Set Your Name'}
            </h2>
            {customerName && (
              <p className={themeClasses.textSecondary}>Current: {customerName}</p>
            )}
          </div>
          
          <NameEditor isFirstTime={!customerName} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-whatsapp-bg flex justify-center">
      {/* Max width container for large screens */}
      <div className="h-full w-full max-w-4xl flex flex-col bg-whatsapp-sidebar-dark">
        {/* Header - Fixed */}
        <div className="bg-whatsapp-sidebar-dark border-b border-whatsapp-border-dark text-whatsapp-text-primary p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Chat with Business</h1>
              <p className="text-whatsapp-text-secondary text-sm">
              {customerName} ({mobile})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Edit name button */}
            <button
              onClick={() => {
                setTempName(customerName);
                setShowNameEditor(true);
              }}
                className="p-2 hover:bg-whatsapp-hover-dark rounded-full transition-colors"
              title="Edit name"
            >
                <Edit2 className="w-4 h-4 text-whatsapp-text-secondary" />
            </button>
            
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {customerName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

        {/* Messages - Scrollable Area Only */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-whatsapp-chat-dark"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        >
        {messages.length === 0 ? (
            <div className="text-center text-whatsapp-text-secondary py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isFromCustomer = message.from === mobile;
            return (
              <div
                key={message._id || index}
                className={`flex ${isFromCustomer ? 'justify-end' : 'justify-start'}`}
              >
                <div
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                    isFromCustomer
                        ? 'bg-whatsapp-bubble-out text-whatsapp-text-primary'
                        : 'bg-whatsapp-bubble-in text-whatsapp-text-primary'
                  }`}
                    style={{
                      borderRadius: isFromCustomer 
                        ? '7.5px 7.5px 7.5px 0px' 
                        : '7.5px 7.5px 0px 7.5px'
                    }}
                >
                  <div className="text-sm leading-relaxed break-words">
                      {typeof message.text === 'string' ? message.text : message.text?.body || 'No text content'}
                  </div>
                  <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                      isFromCustomer ? 'text-gray-300' : 'text-whatsapp-text-secondary'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isFromCustomer && (
                        <span className={message.status === 'read' ? 'text-blue-400' : 'text-gray-300'}>
                        {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

        {/* Message Input - Fixed */}
        <div className="bg-whatsapp-sidebar-dark border-t border-whatsapp-border-dark p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
              className="flex-1 px-3 sm:px-4 py-3 bg-whatsapp-input-dark border-0 rounded-lg focus:outline-none text-sm text-whatsapp-text-primary placeholder-whatsapp-text-secondary"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
              className="p-2 hover:bg-whatsapp-hover-dark rounded-full transition-colors"
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-whatsapp-text-secondary border-t-transparent rounded-full animate-spin" />
            ) : (
                <Send className="w-5 h-5 text-whatsapp-text-secondary" />
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
