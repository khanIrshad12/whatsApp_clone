'use client';

import { useState } from 'react';

interface UserSelectorProps {
  onUserSelect: (user: {
    user_wa_id: string;
    user_name: string;
    phone: string;
  }) => void;
}

const USERS = [
  {
    user_wa_id: '919937320320',
    user_name: 'Ravi Kumar',
    phone: '919937320320'
  },
  {
    user_wa_id: '929967673820',
    user_name: 'Neha Joshi',
    phone: '929967673820'
  }
];

export default function UserSelector({ onUserSelect }: UserSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleUserSelect = (user: typeof USERS[0]) => {
    setSelectedUser(user.user_wa_id);
    onUserSelect(user);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-whatsapp-gray flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-semibold">RT</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Real-Time Chat</h2>
          </div>
        </div>
      </div>

      {/* User Selection */}
      <div className="p-4 bg-whatsapp-gray flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select User to Chat As:</h3>
        <div className="space-y-2">
          {USERS.map((user) => (
            <button
              key={user.user_wa_id}
              onClick={() => handleUserSelect(user)}
              className={`w-full p-3 rounded-lg border transition-colors ${
                selectedUser === user.user_wa_id
                  ? 'bg-whatsapp-green text-white border-whatsapp-green'
                  : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedUser === user.user_wa_id ? 'bg-white' : 'bg-whatsapp-green'
                }`}>
                  <span className={`font-semibold ${
                    selectedUser === user.user_wa_id ? 'text-whatsapp-green' : 'text-white'
                  }`}>
                    {user.user_name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-semibold">{user.user_name}</div>
                  <div className="text-xs opacity-75">{user.user_wa_id}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="flex-1 p-4 bg-white">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">🚀 Real-Time Features:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Instant message delivery</li>
            <li>• Live status updates (sent → delivered → read)</li>
            <li>• Typing indicators</li>
            <li>• Online user status</li>
            <li>• Group chat (all users see each other's messages)</li>
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>💡 Test:</strong> Open multiple browser tabs/windows and select different users to simulate real-time messaging!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


