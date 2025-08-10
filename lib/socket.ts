import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { prisma } from './prisma';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = async (req: any, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new SocketIOServer(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join user to their room
    socket.on('join-user', (userData) => {
      const { user_wa_id, user_name } = userData;
      socket.join(`user-${user_wa_id}`);
      socket.join('business-group'); // All users join business group
      
      // Notify others that user is online
      socket.to('business-group').emit('user-online', {
        user_wa_id,
        user_name,
        socketId: socket.id
      });
    });

    // Handle new message
    socket.on('send-message', async (messageData) => {
      try {
        const {
          text,
          from,
          to,
          user_wa_id,
          user_name,
          business_wa_id
        } = messageData;

        // Find or create conversation
        let conversation = await prisma.conversation.findUnique({ 
          where: { waId: user_wa_id } 
        });
        
        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: { 
              waId: user_wa_id, 
              name: user_name || `User ${user_wa_id.slice(-4)}`, 
              lastMessage: text 
            }
          });
        }

        // Save message to database
        const newMessage = await prisma.message.create({
          data: {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            from,
            to,
            contactName: user_name || `User ${user_wa_id.slice(-4)}`,
            waId: user_wa_id,
            text,
            type: 'text',
            timestamp: new Date(),
            status: 'sent',
            conversationId: conversation.id
          }
        });

        // Update conversation last message
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessage: text, updatedAt: new Date() }
        });

        // Broadcast message to all users in business group
        const messageToSend = {
          _id: newMessage.id,
          text: { body: text },
          from,
          to,
          timestamp: newMessage.timestamp,
          status: 'sent',
          user_wa_id,
          user_name,
          type: 'text'
        };

        io.to('business-group').emit('new-message', messageToSend);

        // Simulate status updates (sent → delivered → read)
        setTimeout(async () => {
          await prisma.message.update({
            where: { id: newMessage.id },
            data: { status: 'delivered' }
          });
          io.to('business-group').emit('message-status-update', {
            meta_msg_id: newMessage.messageId,
            status: 'delivered'
          });
        }, 1000);

        setTimeout(async () => {
          await prisma.message.update({
            where: { id: newMessage.id },
            data: { status: 'read' }
          });
          io.to('business-group').emit('message-status-update', {
            meta_msg_id: newMessage.messageId,
            status: 'read'
          });
        }, 3000);

      } catch (error) {
        console.error('❌ Error handling message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle status updates from webhooks
    socket.on('update-message-status', async (statusData) => {
      try {
        const { meta_msg_id, status } = statusData;
        
        // Update message status in database
        const updatedMessage = await prisma.message.updateMany({
          where: { messageId: meta_msg_id },
          data: { status, updatedAt: new Date() }
        });

        if (updatedMessage.count > 0) {
          // Broadcast status update to all users
          io.to('business-group').emit('message-status-update', {
            meta_msg_id,
            status
          });
        }
      } catch (error) {
        console.error('❌ Error updating message status:', error);
      }
    });

    // Handle user typing
    socket.on('typing', (userData) => {
      socket.to('business-group').emit('user-typing', userData);
    });

    // Handle user stop typing
    socket.on('stop-typing', (userData) => {
      socket.to('business-group').emit('user-stop-typing', userData);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
      socket.to('business-group').emit('user-offline', {
        socketId: socket.id
      });
    });
  });

  res.end();
};

export default SocketHandler;

