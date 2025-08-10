export interface Message {
  _id: string;
  wa_id: string;
  from: string;
  to: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
  };
  audio?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
  };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
  };
  status: 'sent' | 'delivered' | 'read';
  meta_msg_id?: string;
  conversation_id: string;
  user_wa_id?: string; // Individual user's wa_id
  user_name?: string; // Individual user's name
  business_wa_id?: string; // Business wa_id
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  conversation_id: string;
  wa_id: string;
  user_wa_id?: string; // Individual user's wa_id
  participants: string[];
  lastMessage: Message;
  messageCount: number;
  user: {
    wa_id: string;
    phone: string;
    name: string;
  };
}

export interface User {
  wa_id: string;
  phone: string;
  name: string;
}
