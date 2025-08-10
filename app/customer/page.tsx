'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Phone } from 'lucide-react';

export default function CustomerEntry() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validateMobile = (number: string) => {
    // Remove any non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // Check if it's a valid mobile number (10-15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
      return false;
    }
    
    return true;
  };

  const startChat = () => {
    setError('');
    
    if (!mobile.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    
    const cleanedMobile = mobile.replace(/\D/g, '');
    
    if (!validateMobile(cleanedMobile)) {
      setError('Please enter a valid mobile number (10-15 digits)');
      return;
    }
    
    // Navigate to customer chat
    router.push(`/customer/${cleanedMobile}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      startChat();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Chat</h1>
          <p className="text-gray-600">Enter your mobile number to start chatting with our business</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your mobile number"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <button
            onClick={startChat}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold"
          >
            Start Chat
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Example: 919876543210, 929967673820
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
