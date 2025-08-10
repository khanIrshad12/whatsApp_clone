'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import { Conversation, Message } from '@/types';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const { theme } = useTheme();

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-whatsapp-bg' : 'bg-gray-100',
  };

  const fetchConversations = async () => {
    try {
      // Add cache-busting and headers for production
      const timestamp = Date.now();
      console.log('🔄 BUSINESS - Fetching conversations with timestamp:', timestamp);
      const response = await fetch(`/api/conversations?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('🔄 BUSINESS - Conversations updated:', {
          count: data.length,
          conversations: data.map((c: any) => ({
            waId: c.wa_id,
            lastMessage: c.lastMessage?.text?.body,
            messageCount: c.messageCount
          }))
        });
        setConversations(data);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
    }
  };

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Home page - Fetched messages:', data.length);
        

        
        setMessages(data);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    }
  }, []);

  const markCustomerMessagesAsRead = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/mark-customer-read`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchConversations(); // Refresh conversations to update unread badge counts
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!selectedConversation || !text.trim()) return;

    const messageData = {
      from: '918329446654', // Business phone number
      to: selectedConversation.wa_id,
      text: text.trim(),
      waId: selectedConversation.wa_id,
      contactName: selectedConversation.user.name,
      type: 'text'
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        
        // Immediately update conversations for real-time sidebar updates
        setTimeout(() => {
          fetchConversations();
        }, 1000); // Increased delay to ensure database transaction is fully committed
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchConversations();
    setLoading(false);
  }, []);

  // Global polling for sidebar updates - CRITICAL for production real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 2000); // Poll every 2 seconds for sidebar updates

    return () => clearInterval(interval);
  }, []);

  // Handle conversation selection and real-time polling
  useEffect(() => {
    if (selectedConversation) {
      // Initial fetch
      fetchMessages(selectedConversation.conversation_id);
      markCustomerMessagesAsRead(selectedConversation.conversation_id);

      // Poll every 1 second for new messages (faster for status updates)
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.conversation_id);
        // Don't call fetchConversations here since we have global polling
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedConversation, fetchMessages]);

  if (loading) {
    return (
      <div className={`h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading WhatsApp Clone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${themeClasses.bg} flex justify-center`}>
      <div className="flex h-full w-full max-w-7xl relative">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar 
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={(conv) => {
              setSelectedConversation(conv);
              setShowSidebar(false); // Close sidebar on mobile when conversation is selected
            }}
          />
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className={`lg:hidden flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'bg-whatsapp-sidebar-dark border-whatsapp-border-dark' : 'bg-white border-gray-200'}`}>
            <button
              onClick={() => setShowSidebar(true)}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-whatsapp-hover-dark' : 'hover:bg-gray-100'} rounded-full transition-colors`}
            >
              <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-whatsapp-text-primary' : 'text-gray-900'}`} />
            </button>
            {selectedConversation ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {selectedConversation.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className={`font-medium ${theme === 'dark' ? 'text-whatsapp-text-primary' : 'text-gray-900'}`}>{selectedConversation.user.name}</h2>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${theme === 'dark' ? 'text-whatsapp-text-secondary' : 'text-gray-500'}`}>online</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-whatsapp-text-secondary' : 'text-gray-500'} ml-2`}>
                      ({selectedConversation.user.phone})
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className={`font-medium ${theme === 'dark' ? 'text-whatsapp-text-primary' : 'text-gray-900'}`}>WhatsApp Web</h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-whatsapp-text-secondary' : 'text-gray-500'}`}>Select a chat to start messaging</p>
              </div>
            )}
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          
          <ChatArea 
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}

