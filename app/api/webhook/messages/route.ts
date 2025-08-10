import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process webhook payload
    const entry = body.entry?.[0];
    if (!entry?.changes?.[0]?.value?.messages) {
      return NextResponse.json({ error: 'No messages in payload' }, { status: 400 });
    }

    const { messages, metadata, contacts } = entry.changes[0].value;
    const businessPhoneNumber = metadata.display_phone_number;

    // Process each message
    for (const message of messages) {
      const contact = contacts?.find((c: any) => c.wa_id === message.from);
      const userName = contact?.profile?.name || `User ${message.from.slice(-4)}`;
      const userWaId = message.from;

      // Find or create conversation
      let conversation = await prisma.conversation.findUnique({ where: { waId: userWaId } });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { waId: userWaId, name: userName, lastMessage: message.text?.body || '' }
        });
      } else {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessage: message.text?.body || '', updatedAt: new Date() }
        });
      }

      // Create message
      await prisma.message.create({
        data: {
          messageId: message.id,
          from: message.from,
          to: businessPhoneNumber,
          contactName: userName,
          waId: userWaId,
          text: message.text?.body,
          type: message.type,
          timestamp: new Date(parseInt(message.timestamp) * 1000),
          status: 'sent',
          conversationId: conversation.id,
        }
      });
    }

    return NextResponse.json({ success: true, processed: messages.length });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
