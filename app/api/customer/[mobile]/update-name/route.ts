import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { mobile: string } }
) {
  try {
    const { mobile } = params;
    const { name } = await request.json();

    // Handle empty name (clearing the name)
    if (!name || !name.trim()) {
      // Update the conversation name to empty
      await prisma.conversation.updateMany({
        where: { waId: mobile },
        data: { name: '' }
      });

      // Also update all messages from this customer to have empty contact name
      await prisma.message.updateMany({
        where: { from: mobile },
        data: { contactName: '' }
      });

      return NextResponse.json({ 
        success: true, 
        name: ''
      });
    }

    const trimmedName = name.trim();

    // Check if conversation exists, if not create it
    let conversation = await prisma.conversation.findUnique({
      where: { waId: mobile }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          waId: mobile,
          name: trimmedName,
          lastMessage: '',
        }
      });
    } else {
      // Update existing conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { name: trimmedName }
      });
    }

    // Also update all messages from this customer to have the new contact name
    await prisma.message.updateMany({
      where: { from: mobile },
      data: { contactName: trimmedName }
    });

    return NextResponse.json({ 
      success: true, 
      name: trimmedName
    });
  } catch (error) {
    console.error('❌ Error updating customer name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
