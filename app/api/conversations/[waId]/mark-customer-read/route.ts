import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BUSINESS_NUMBER = '918329446654'; // Example business number

export async function POST(
  request: NextRequest,
  { params }: { params: { waId: string } }
) {
  try {
    const customerWaId = params.waId;
    const result = await prisma.message.updateMany({
      where: {
        from: customerWaId, // Messages FROM the customer
        to: BUSINESS_NUMBER, // TO the business
        status: { in: ['sent', 'delivered'] }, // Only update if not already read
      },
      data: { status: 'read', updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, updatedCount: result.count });
  } catch (error) {
    console.error('❌ Error marking customer messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
