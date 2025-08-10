import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { waId: string } }
) {
  try {
    const waId = params.waId;
    const result = await prisma.message.updateMany({
      where: {
        to: waId, // Messages sent TO the customer (from business)
        status: { in: ['sent', 'delivered'] }, // Only update if not already read
      },
      data: { status: 'read', updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, updatedCount: result.count });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}