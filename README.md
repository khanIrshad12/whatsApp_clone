# WhatsApp Web Clone

A full-stack WhatsApp Web clone with real-time messaging, built using Next.js, Prisma, MongoDB, and Socket.IO. This application perfectly mimics the WhatsApp Web interface and supports real-time messaging with webhook integration.

![WhatsApp Clone Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.13.0-purple)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-orange)

## 🚀 Features

### **Core Functionality**
- **Real-time Messaging**: Live message updates using Socket.IO
- **WhatsApp-like UI**: Authentic WhatsApp Web interface with dark/light theme toggle
- **Webhook Processing**: Handle WhatsApp Business API webhook payloads
- **Message Status Tracking**: Real-time status updates (sent → delivered → read)
- **Customer View**: Simulate customer chat interface

### **UI/UX Features**
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with cross-tab synchronization
- **Smart Scrolling**: Auto-scroll only when user is at bottom
- **Message Bubbles**: Authentic WhatsApp message styling
- **Status Indicators**: Visual message status (single tick, double tick, blue ticks)
- **Typing Indicators**: Real-time typing status
- **Unread Count Badges**: Show unread message counts

### **Technical Features**
- **Real-time Updates**: Socket.IO for instant message delivery
- **Database Integration**: MongoDB with Prisma ORM
- **API Routes**: RESTful API endpoints for all operations
- **Type Safety**: Full TypeScript implementation
- **Performance Optimized**: Next.js 14 with app router

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.0.4 | Full-stack React framework |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.3.3 | Type safety |
| **Prisma** | 6.13.0 | Database ORM |
| **MongoDB** | Atlas | Database |
| **Socket.IO** | 4.8.1 | Real-time communication |
| **Tailwind CSS** | 3.3.6 | Styling |
| **Lucide React** | 0.294.0 | Icons |

## 📁 Project Structure

```
whataap_clone/
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── conversations/       # Conversation endpoints
│   │   ├── messages/            # Message endpoints
│   │   ├── webhook/             # Webhook endpoints
│   │   └── socket/              # Socket.IO endpoint
│   ├── customer/                # Customer chat interface
│   │   └── [mobile]/            # Dynamic customer pages
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main chat interface
├── components/                   # React components
│   ├── ChatArea.tsx             # Main chat window
│   ├── MessageBubble.tsx        # Individual message component

│   ├── Sidebar.tsx              # Conversation sidebar
│   └── UserSelector.tsx         # User selection component
├── contexts/                     # React contexts
│   ├── SocketContext.tsx        # Socket.IO client context
│   └── ThemeContext.tsx         # Theme management
├── lib/                         # Utility libraries
│   └── prisma.ts                # Prisma client
├── prisma/                      # Database schema
│   └── schema.prisma            # Prisma schema
├── scripts/                     # Utility scripts
│   ├── setup.js                 # Initial setup
│   └── import-sample-data-prisma.js  # Sample data import
├── types/                       # TypeScript types
│   └── index.ts                 # Type definitions
└── sample_conversation/         # Sample webhook data
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whataap_clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   npm run setup
   ```
   This will create a `.env.local` file with your MongoDB connection string.

4. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

5. **Import sample data (optional)**
   ```bash
   npm run prisma:import
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Main app: http://localhost:3000
   - Customer view: http://localhost:3000/customer/+919876543210
   - To create new customer: http://localhost:3000/customer

## 📱 How to Test

### **1. Main Chat Interface Testing**

#### **Setup:**
1. Open http://localhost:3000
2. You should see the WhatsApp Web interface with a sidebar

#### **Test Conversations:**
1. **View Conversations**: Sidebar shows all conversations with last message preview
2. **Select Conversation**: Click on any conversation to open chat
3. **Send Messages**: Type in the input box and press Enter or click send button
4. **Theme Toggle**: Click the three dots menu → "Dark mode" or "Light mode"

#### **Expected Behavior:**
- ✅ Conversations load with last message preview
- ✅ Clicking conversation opens chat window
- ✅ Messages appear instantly in chat
- ✅ Theme changes apply immediately
- ✅ Unread count badges show correctly

### **2. Customer View Testing**

#### **Setup:**
1. Open http://localhost:3000/customer/+919876543210
2. Set your name on first visit

#### **Test Customer Features:**
1. **Name Setup**: Enter your name and click "Start Chat"
2. **View Messages**: See messages sent from business
3. **Send Messages**: Send messages as customer
4. **Theme Sync**: Change theme on main page, customer page should update

#### **Expected Behavior:**
- ✅ Name setup works on first visit
- ✅ Customer messages appear in business view
- ✅ Messages are marked as read automatically
- ✅ Theme syncs across tabs
- ✅ Smart scrolling works (only scrolls when at bottom)


#### **Test Real-time Features:**
1. **Multi-user Chat**: Select different users in each tab
2. **Send Messages**: Messages appear instantly in other tabs
3. **Status Updates**: Watch message status change (sent → delivered → read)
4. **Typing Indicators**: See typing indicators in real-time

#### **Expected Behavior:**
- ✅ Messages appear instantly across tabs
- ✅ Status updates in real-time
- ✅ Typing indicators work
- ✅ User online/offline status

### **4. Webhook Testing**

#### **Setup:**
1. Use tools like Postman or curl
2. Send POST requests to webhook endpoints

#### **Test Webhook Endpoints:**

**1. Process Incoming Message:**
```bash
curl -X POST http://localhost:3000/api/webhook/messages \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "id": "123456789",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "918329446654",
            "phone_number_id": "123456789"
          },
          "messages": [{
            "from": "919876543210",
            "id": "wamid.123456789",
            "timestamp": "1234567890",
            "type": "text",
            "text": {
              "body": "Hello from webhook!"
            }
          }]
        }
      }]
    }]
  }'
```

**2. Process Status Update:**
```bash
curl -X POST http://localhost:3000/api/webhook/status \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "id": "123456789",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "918329446654",
            "phone_number_id": "123456789"
          },
          "statuses": [{
            "id": "wamid.123456789",
            "status": "delivered",
            "timestamp": "1234567890"
          }]
        }
      }]
    }]
  }'
```

#### **Expected Behavior:**
- ✅ Messages are processed and stored in database
- ✅ Status updates change message status
- ✅ New messages appear in UI immediately
- ✅ Conversations are created/updated automatically

### **5. API Endpoints Testing**

#### **Test All API Endpoints:**

**1. Get Conversations:**
```bash
curl http://localhost:3000/api/conversations
```

**2. Get Messages for Conversation:**
```bash
curl http://localhost:3000/api/conversations/919876543210
```

**3. Send Message:**
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "from": "918329446654",
    "to": "919876543210",
    "text": "Hello from API!",
    "waId": "919876543210",
    "contactName": "Test User"
  }'
```

**4. Mark Messages as Read:**
```bash
curl -X POST http://localhost:3000/api/conversations/919876543210/mark-read
```

#### **Expected Behavior:**
- ✅ All endpoints return proper JSON responses
- ✅ Messages are stored and retrieved correctly
- ✅ Status updates work properly
- ✅ Error handling works for invalid requests

## 🔧 API Endpoints

### **Webhook Endpoints**
- `POST /api/webhook/messages` - Process incoming messages
- `POST /api/webhook/status` - Process status updates

### **Conversation Endpoints**
- `GET /api/conversations` - List all conversations with last message preview
- `GET /api/conversations/:waId` - Get all messages for a conversation
- `POST /api/conversations/:waId/mark-read` - Mark messages as read (customer view)
- `POST /api/conversations/:waId/mark-customer-read` - Mark customer messages as read (business view)

### **Message Endpoints**
- `POST /api/messages` - Send/store a new message

### **Socket.IO Endpoint**
- `/api/socket` - Real-time communication endpoint

## 📊 Database Schema

### **Conversations Collection**
```typescript
{
  id: string;              // Unique identifier
  waId: string;            // WhatsApp ID (unique)
  name: string;            // Contact name
  lastMessage: string;     // Last message preview
  updatedAt: Date;         // Last activity timestamp
  createdAt: Date;         // Creation timestamp
}
```

### **Messages Collection**
```typescript
{
  id: string;              // Unique identifier
  messageId: string;       // WhatsApp message ID
  from: string;            // Sender phone number
  to: string;              // Recipient phone number
  contactName: string;     // Contact name
  waId: string;            // WhatsApp ID
  text: string;            // Message content
  type: string;            // Message type (text, image, etc.)
  timestamp: Date;         // Message timestamp
  status: string;          // Message status (sent, delivered, read)
  conversationId: string;  // Reference to conversation
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Update timestamp
}
```

## 🎨 Customization

### **Themes**
The app supports dark and light themes with automatic synchronization across tabs:
- **Dark Theme**: WhatsApp Web dark mode colors
- **Light Theme**: WhatsApp Web light mode colors
- **Cross-tab Sync**: Theme changes apply to all open tabs
- **Persistent**: Theme preference saved in localStorage

### **Styling**
All styles use Tailwind CSS with custom WhatsApp color palette:
- **Primary Green**: `#00a884` (WhatsApp brand color)
- **Dark Theme**: Authentic WhatsApp Web dark colors
- **Light Theme**: Clean, modern light colors
- **Responsive**: Mobile-first design approach

### **Colors Available**
```css
/* Light Theme */
bg-white, text-gray-900, border-gray-200

/* Dark Theme */
bg-whatsapp-bg (#111b21)
bg-whatsapp-sidebar-dark (#202c33)
bg-whatsapp-chat-dark (#0b141a)
text-whatsapp-text-primary (#e9edef)
text-whatsapp-text-secondary (#8696a0)
```

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables:
     - `DATABASE_URI`: Your MongoDB Atlas connection string
     - `NEXT_PUBLIC_APP_URL`: Your Vercel app URL
   - Deploy

3. **Environment Variables**
   ```env
   DATABASE_URI="mongodb+srv://username:password@cluster.mongodb.net/whatsapp?retryWrites=true&w=majority"
   NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
   ```

### **Other Platforms**
- **Render**: Use Node.js environment
- **Heroku**: Add `Procfile` with `web: npm start`
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Deploy from GitHub

## 🐛 Troubleshooting

### **Common Issues**

**1. Database Connection Error**
```bash
Error: Cannot connect to MongoDB
```
**Solution:** Check your `DATABASE_URI` in `.env.local` and ensure MongoDB Atlas IP whitelist includes your IP.

**2. Prisma Client Not Generated**
```bash
Error: PrismaClient not found
```
**Solution:** Run `npm run prisma:generate`

**3. Socket.IO Connection Issues**
```bash
Error: Socket connection failed
```
**Solution:** Ensure `NEXT_PUBLIC_APP_URL` is set correctly in environment variables.

**4. Theme Not Syncing**
```bash
Theme changes don't apply across tabs
```
**Solution:** Check browser localStorage and ensure ThemeContext is properly set up.

### **Debug Commands**
```bash
# Check database connection
npm run prisma:generate

# Import sample data
npm run prisma:import

# Check server logs
npm run dev
```

## 📝 Development

### **Adding New Features**

1. **New API Endpoint**: Add file in `app/api/`
2. **New Component**: Add file in `components/`
3. **New Page**: Add file in `app/`
4. **Database Changes**: Update `prisma/schema.prisma`

### **Code Style**
- Use TypeScript for all files
- Follow Next.js 14 app router conventions
- Use Tailwind CSS for styling
- Implement proper error handling
- Add console logs for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes. Please respect WhatsApp's terms of service.

## 🙏 Acknowledgments

- **WhatsApp Web** for UI inspiration
- **Next.js team** for the amazing framework
- **Prisma team** for the excellent ORM
- **Socket.IO team** for real-time capabilities
- **Tailwind CSS** for the utility-first styling approach

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code comments
- Test with the provided sample data

---

**Made with ❤️ using Next.js, React, TypeScript, and Socket.IO**
