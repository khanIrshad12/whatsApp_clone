'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, MessageSquarePlus, Filter, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { Conversation } from '@/types';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function Sidebar({ conversations, selectedConversation, onSelectConversation }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  // Safety check: ensure conversations is an array
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Group conversations by business wa_id (for organization)
  const groupedConversations = safeConversations.reduce((groups, conversation) => {
    const businessWaId = conversation.wa_id;
    if (!groups[businessWaId]) {
      groups[businessWaId] = [];
    }
    groups[businessWaId].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);

  // Filter conversations based on search term
  const filteredGroups = Object.entries(groupedConversations).filter(([businessWaId, convs]) => {
    return convs.some(conv => 
      conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.phone.includes(searchTerm) ||
      conv.user_wa_id?.includes(searchTerm)
    );
  });

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
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
        return 'text-blue-400';
      case 'delivered':
        return 'text-whatsapp-text-secondary';
      case 'sent':
        return 'text-whatsapp-text-secondary';
      default:
        return 'text-whatsapp-text-secondary';
    }
  };

  // Theme-based styles
  const themeClasses = {
    container: theme === 'dark' 
      ? 'bg-whatsapp-sidebar-dark border-whatsapp-border-dark' 
      : 'bg-white border-gray-200',
    header: theme === 'dark' 
      ? 'bg-whatsapp-sidebar-dark border-whatsapp-border-dark' 
      : 'bg-gray-50 border-gray-200',
    text: theme === 'dark' 
      ? 'text-whatsapp-text-primary' 
      : 'text-gray-900',
    textSecondary: theme === 'dark' 
      ? 'text-whatsapp-text-secondary' 
      : 'text-gray-500',
    search: theme === 'dark' 
      ? 'bg-whatsapp-input-dark text-whatsapp-text-primary placeholder-whatsapp-text-secondary' 
      : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200',
    hover: theme === 'dark' 
      ? 'hover:bg-whatsapp-hover-dark' 
      : 'hover:bg-gray-100',
    selected: '',
    chatItem: theme === 'dark' 
      ? 'border-whatsapp-border-dark border-opacity-50' 
      : 'border-gray-100',
    menu: theme === 'dark' 
      ? 'bg-whatsapp-sidebar-dark border-whatsapp-border-dark' 
      : 'bg-white border-gray-200',
  };

  return (
    <div className={`w-80 ${themeClasses.container} border-r flex flex-col h-full`}>
      {/* Header */}
      <div className={`p-4 border-b ${themeClasses.header} flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-lg font-medium ${themeClasses.text}`}>Chats</h1>
          <div className="flex items-center space-x-2">
            <button className={`p-2 ${themeClasses.hover} rounded-full transition-colors`} title="New chat">
              <MessageSquarePlus className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 ${themeClasses.hover} rounded-full transition-colors`}
                title="Menu"
              >
                <MoreVertical className={`w-5 h-5 ${themeClasses.textSecondary}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className={`absolute right-0 top-full mt-2 w-48 ${themeClasses.menu} border rounded-lg shadow-lg z-50`}>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setShowMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left ${themeClasses.hover} transition-colors flex items-center space-x-3`}
                    >
                      {theme === 'dark' ? (
                        <Sun className={`w-5 h-5 ${themeClasses.textSecondary}`} />
                      ) : (
                        <Moon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
                      )}
                      <span className={themeClasses.text}>
                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`p-3 ${themeClasses.header} flex-shrink-0`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textSecondary}`} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 ${themeClasses.search} rounded-lg focus:outline-none text-sm`}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`px-3 pb-3 ${themeClasses.header} flex-shrink-0`}>
        <div className="flex space-x-2">
          {['All', 'Unread', 'Favourites', 'Groups'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm transition-colors rounded-full ${
                activeTab === tab
                  ? 'text-whatsapp-green font-medium bg-whatsapp-green bg-opacity-10'
                  : `${themeClasses.textSecondary} ${
                      theme === 'dark' 
                        ? 'hover:bg-whatsapp-hover-dark hover:text-whatsapp-text-primary' 
                        : 'hover:bg-gray-100 hover:text-gray-700'
                    }`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <div className={`p-8 text-center ${themeClasses.textSecondary}`}>
            <p>No conversations found</p>
            <p className="text-sm mt-2">Start a new chat to begin messaging</p>
          </div>
        ) : (
          filteredGroups.map(([businessWaId, convs]) => (
            <div key={businessWaId}>
              {convs.map((conversation) => {
                const isSelected = selectedConversation?.conversation_id === conversation.conversation_id;
                const lastMessage = conversation.lastMessage;
                
                return (
                  <div
                    key={conversation.conversation_id}
                    onClick={() => onSelectConversation(conversation)}
                    className={`px-4 py-3 cursor-pointer ${themeClasses.hover} transition-colors border-b ${themeClasses.chatItem}`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm sm:text-lg">
                          {conversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${themeClasses.text} truncate text-sm sm:text-base`}>
                            {conversation.user.name}
                          </h3>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                            {lastMessage && (
                              <>
                                <span className={`text-xs ${themeClasses.textSecondary}`}>
                                  {formatTime(lastMessage.timestamp)}
                                </span>
                                <span className={`${getStatusColor(lastMessage.status)} text-xs`}>
                                  {getStatusIcon(lastMessage.status)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm ${themeClasses.textSecondary} truncate`}>
                            {lastMessage?.text?.body || 'No messages yet'}
                          </p>
                          {conversation.messageCount > 0 && (
                            <span className="ml-2 bg-whatsapp-green text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0 font-medium">
                              {conversation.messageCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
