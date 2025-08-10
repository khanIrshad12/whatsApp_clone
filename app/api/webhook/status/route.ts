import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process status webhook payload
    const entry = body.entry?.[0];
    if (!entry?.changes?.[0]?.value?.statuses) {
      return NextResponse.json({ error: 'No statuses in payload' }, { status: 400 });
    }

    const { statuses } = entry.changes[0].value;

    // Process each status update
    for (const statusUpdate of statuses) {
      const { id, status } = statusUpdate;
      let newStatus = status;

      // Map WhatsApp status to our status
      if (status === 'sent') newStatus = 'sent';
      else if (status === 'delivered') newStatus = 'delivered';
      else if (status === 'read') newStatus = 'read';

      // Update message status
      const updatedMessage = await prisma.message.updateMany({
        where: { messageId: id },
        data: { status: newStatus, updatedAt: new Date() }
      });

      if (updatedMessage.count === 0) {
        console.warn(`⚠️ Message not found for status update: ${id}`);
      }
    }

    return NextResponse.json({ success: true, processed: statuses.length });
  } catch (error) {
    console.error('❌ Status webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


