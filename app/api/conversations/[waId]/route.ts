import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { waId: string } }
) {
  try {
    const { waId } = params;
    const conversation = await prisma.conversation.findUnique({ where: { waId } });

    if (!conversation) {
      return NextResponse.json({ messages: [] }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: 'asc' }
    });

    // Format messages for frontend compatibility
    const formattedMessages = messages.map(msg => ({
      _id: msg.id,
      from: msg.from,
      to: msg.to,
      text: { body: msg.text || 'No text content' },
      timestamp: msg.timestamp,
      status: msg.status,
      type: msg.type,
      meta_msg_id: msg.messageId
    }));



    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
