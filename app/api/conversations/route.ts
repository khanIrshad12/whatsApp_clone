import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BUSINESS_NUMBER = '918329446654'; // Example business number

export async function GET(request: NextRequest) {
  try {
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
      const unreadCustomerMessages = await prisma.message.count({
        where: {
          conversationId: conv.id,
          from: conv.waId, // Messages FROM this customer
          to: BUSINESS_NUMBER, // TO the business
          status: { not: 'read' } // Only unread messages (not yet read by business)
        }
      });

      return {
        conversation_id: conv.waId, // Use waId as conversation_id for compatibility
        wa_id: conv.waId,
        user_wa_id: conv.waId,
        participants: [conv.waId, BUSINESS_NUMBER],
        lastMessage: {
          text: { body: conv.lastMessage },
          timestamp: conv.messages[0]?.timestamp || conv.updatedAt,
          status: conv.messages[0]?.status || 'sent'
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

    return NextResponse.json(filteredConversations);
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
