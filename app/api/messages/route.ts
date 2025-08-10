import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { from, to, text, waId, contactName, type = 'text' } = await request.json();



    // Determine the customer's waId (the sender for customer messages, the recipient for business messages)
    const customerWaId = from === '918329446654' ? to : from;


    // Find or create conversation using the customer's waId
    let conversation = await prisma.conversation.findUnique({ where: { waId: customerWaId } });
    if (!conversation) {

      conversation = await prisma.conversation.create({
        data: { waId: customerWaId, name: contactName || `User ${customerWaId.slice(-4)}`, lastMessage: text }
      });
    } else {

    }

    const newMessage = await prisma.message.create({
      data: {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from, to, contactName, waId: customerWaId, text, type,
        timestamp: new Date(),
        status: 'sent',
        conversationId: conversation.id
      }
    });



    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessage: text, updatedAt: new Date() }
    });

    // Simulate message status progression for business messages
    if (from === '918329446654') { // Business phone number
      setTimeout(async () => {
        await prisma.message.update({
          where: { id: newMessage.id },
          data: { status: 'delivered' }
        });
      }, 1000);
    }

    // Format response for frontend compatibility
    const formattedResponse = {
      _id: newMessage.id,
      from: newMessage.from,
      to: newMessage.to,
      text: { body: newMessage.text },
      timestamp: newMessage.timestamp,
      status: newMessage.status,
      type: newMessage.type,
      meta_msg_id: newMessage.messageId
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


