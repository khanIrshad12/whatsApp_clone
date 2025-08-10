const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function importSampleData() {
  try {
    console.log('🔗 Connecting to MongoDB with Prisma...');
    await prisma.$connect();
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    console.log('✅ Existing data cleared');

    const sampleDir = path.join(__dirname, '../sample_conversation');
    const files = await fs.readdir(sampleDir);
    
    // Filter and sort JSON files
    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const aMatch = a.match(/conversation_(\d+)_(message|status)_(\d+)/);
        const bMatch = b.match(/conversation_(\d+)_(message|status)_(\d+)/);
        
        if (!aMatch || !bMatch) return 0;
        
        const aConv = parseInt(aMatch[1]);
        const bConv = parseInt(bMatch[1]);
        const aType = aMatch[2];
        const bType = bMatch[2];
        const aNum = parseInt(aMatch[3]);
        const bNum = parseInt(bMatch[3]);
        
        if (aConv !== bConv) return aConv - bConv;
        if (aType !== bType) return aType === 'message' ? -1 : 1;
        return aNum - bNum;
      });

    console.log(`📁 Found ${jsonFiles.length} JSON files to process`);

    let messageCount = 0;
    let statusUpdateCount = 0;
    const conversationMap = new Map(); // Track conversations

    // Process message files first
    for (const file of jsonFiles) {
      if (file.includes('_message_')) {
        console.log(`📄 Processing message file: ${file}`);
        
        try {
          const filePath = path.join(sampleDir, file);
          const fileContent = await fs.readFile(filePath, 'utf8');
          const payload = JSON.parse(fileContent);

          if (payload.metaData && payload.metaData.entry) {
            for (const entry of payload.metaData.entry) {
              if (entry.changes) {
                for (const change of entry.changes) {
                  if (change.value && change.value.messages && change.value.messages.length > 0) {
                    for (const message of change.value.messages) {
                      await processMessage(message, change.value.metadata, change.value.contacts, conversationMap);
                      messageCount++;
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error processing file ${file}:`, error.message);
        }
      }
    }

    // Process status files
    for (const file of jsonFiles) {
      if (file.includes('_status_')) {
        console.log(`📄 Processing status file: ${file}`);
        
        try {
          const filePath = path.join(sampleDir, file);
          const fileContent = await fs.readFile(filePath, 'utf8');
          const payload = JSON.parse(fileContent);

          if (payload.metaData && payload.metaData.entry) {
            for (const entry of payload.metaData.entry) {
              if (entry.changes) {
                for (const change of entry.changes) {
                  if (change.value && change.value.statuses && change.value.statuses.length > 0) {
                    for (const status of change.value.statuses) {
                      await processStatusUpdate(status);
                      statusUpdateCount++;
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error processing file ${file}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Import completed successfully!`);
    console.log(`📊 Total messages imported: ${messageCount}`);
    console.log(`📊 Total status updates processed: ${statusUpdateCount}`);

    // Show summary
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    
    console.log(`📞 Total conversations: ${totalConversations}`);
    console.log(`💬 Total messages: ${totalMessages}`);

    // Show sample conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log('\n📋 Sample conversations:');
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.name} (${conv.waId})`);
      console.log(`   Last: "${conv.lastMessage}"`);
      console.log(`   Updated: ${conv.updatedAt.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error importing sample data:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function processMessage(message, metadata, contacts, conversationMap) {
  try {
    const businessWaId = metadata.phone_number_id;
    const from = message.from;
    const to = metadata.display_phone_number;
    const timestamp = new Date(parseInt(message.timestamp) * 1000);
    
    // Extract contact information
    let contactName = `User ${from.slice(-4)}`;
    if (contacts && contacts.length > 0) {
      const contact = contacts.find(c => c.wa_id === from);
      if (contact && contact.profile?.name) {
        contactName = contact.profile.name;
      }
    }

    // Find or create conversation
    let conversation = conversationMap.get(from);
    if (!conversation) {
      // Check if exists in database
      conversation = await prisma.conversation.findUnique({
        where: { waId: from }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            waId: from,
            name: contactName,
            lastMessage: message.text?.body || `${message.type} message`,
          }
        });
        console.log(`✅ Created conversation: ${contactName} (${from})`);
      }
      
      conversationMap.set(from, conversation);
    }

    // Create message
    const messageData = {
      messageId: message.id,
      from,
      to,
      contactName,
      waId: businessWaId,
      text: message.text?.body || null,
      type: message.type,
      timestamp,
      status: 'sent',
      conversationId: conversation.id
    };

    await prisma.message.create({
      data: messageData
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: message.text?.body || `${message.type} message`,
        updatedAt: new Date()
      }
    });

    console.log(`💬 Message saved: ${contactName} -> "${message.text?.body || 'No text'}"`);

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
  }
}

async function processStatusUpdate(status) {
  try {
    const { id, status: newStatus } = status;
    
    const updatedMessage = await prisma.message.updateMany({
      where: { messageId: id },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    });

    if (updatedMessage.count > 0) {
      console.log(`✅ Status updated: ${id} -> ${newStatus}`);
    } else {
      console.log(`⚠️ Message not found for status update: ${id}`);
    }

  } catch (error) {
    console.error('❌ Error processing status update:', error.message);
  }
}

// Run the import
importSampleData();


