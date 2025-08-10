#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up WhatsApp Web Clone...\n');

async function setup() {
  try {
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    if (!await fs.pathExists(envPath)) {
      console.log('📝 Creating .env.local file...');
      const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://khanirshad:whatapp_clone@cluster0.7kvr0bd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Instructions:
# 1. Replace the MONGODB_URI with your actual MongoDB Atlas connection string
# 2. Update NEXT_PUBLIC_APP_URL for production deployment
`;
      await fs.writeFile(envPath, envContent);
      console.log('✅ .env.local file created');
      console.log('⚠️  Please update the MONGODB_URI in .env.local with your actual MongoDB connection string\n');
    } else {
      console.log('✅ .env.local file already exists');
    }

    // Install dependencies
    console.log('📦 Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.log('⚠️  Dependencies installation failed. Please run "npm install" manually');
    }

    // Create sample data directory
    const sampleDir = path.join(process.cwd(), 'sample-payloads');
    if (!await fs.pathExists(sampleDir)) {
      console.log('📁 Creating sample-payloads directory...');
      await fs.mkdir(sampleDir);
      
      // Create a sample webhook payload
      const samplePayload = {
        entry: [
          {
            id: "123456789",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "1234567890",
                    phone_number_id: "123456789"
                  },
                  messages: [
                    {
                      from: "5511999999999",
                      id: "wamid.sample123",
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      type: "text",
                      text: {
                        body: "Hello! This is a sample message from the webhook."
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      };
      
      await fs.writeJson(path.join(sampleDir, 'sample-webhook.json'), samplePayload, { spaces: 2 });
      console.log('✅ Sample webhook payload created');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update MONGODB_URI in .env.local with your MongoDB Atlas connection string');
    console.log('2. Run "npm run dev" to start the development server');
    console.log('3. Run "npm run create-sample-data" to populate the database with sample data');
    console.log('4. Open http://localhost:3000 to view the application');
    console.log('\n📚 For more information, check the README.md file');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
