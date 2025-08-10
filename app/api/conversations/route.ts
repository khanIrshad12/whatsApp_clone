import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BUSINESS_NUMBER = '918329446654'; // Example business number

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get('trigger');
    const timestamp = searchParams.get('t');
    
    console.log('📋 CONVERSATIONS API - Request received:', {
      trigger,
      timestamp,
      requestTime: new Date().toISOString()
    });

    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      // Count only unread customer messages (from customer TO business)
      const unreadCustomerMessages = await prisma.message.count({
        where: {
          conversationId: conv.id,
          from: conv.waId, // Messages FROM this customer
          to: BUSINESS_NUMBER, // TO the business
          status: { not: 'read' } // Only unread messages (not yet read by business)
        }
      });

      // Get the actual last message from database for real-time updates
      const lastMessageFromDB = await prisma.message.findFirst({
        where: { conversationId: conv.id },
        orderBy: { timestamp: 'desc' }
      });

      // Debug logging for the specific conversation
      if (conv.waId === '919876543210') {
        console.log(`🔍 CONVERSATIONS API - Debug for ${conv.waId}:`, {
          conversationLastMessage: conv.lastMessage,
          dbLastMessage: lastMessageFromDB?.text,
          dbTimestamp: lastMessageFromDB?.timestamp,
          conversationUpdatedAt: conv.updatedAt,
          unreadCount: unreadCustomerMessages,
          messageCount: conv.messages.length
        });
      }

      return {
        conversation_id: conv.waId, // Use waId as conversation_id for compatibility
        wa_id: conv.waId,
        user_wa_id: conv.waId,
        participants: [conv.waId, BUSINESS_NUMBER],
        lastMessage: {
          text: { body: lastMessageFromDB?.text || 'No messages yet' },
          timestamp: lastMessageFromDB?.timestamp || conv.updatedAt,
          status: lastMessageFromDB?.status || 'sent'
        },
        messageCount: unreadCustomerMessages,
        user: {
          wa_id: conv.waId,
          phone: conv.waId,
          name: conv.name
        }
      };
    }));

    // Filter out the business number from conversations
    const filteredConversations = formattedConversations.filter(
      conv => conv.wa_id !== BUSINESS_NUMBER
    );

    console.log('📋 CONVERSATIONS API - Response sent:', {
      totalConversations: filteredConversations.length,
      responseTime: new Date().toISOString()
    });

    // Create response with no-cache headers for real-time updates in production
    const response = NextResponse.json(filteredConversations);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
