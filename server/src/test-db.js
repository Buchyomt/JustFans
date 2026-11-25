import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

// Set public reliable DNS servers to prevent Windows Node.js querySrv ECONNREFUSED bug
dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const testConnection = async () => {
  const uri = process.env.MONGODB_URI;

  console.log('\n=============================================');
  console.log('   🍃 JustFans MongoDB Connection Tester');
  console.log('=============================================\n');

  if (!uri || !uri.trim() || uri.includes('<username>') || uri.includes('<password>')) {
    console.log('❌ Error: MONGODB_URI is not properly configured.');
    console.log('👉 Please open server/.env (or root .env) and set your connection string:');
    console.log('   MONGODB_URI=mongodb+srv://your_user:your_password@cluster0.abcde.mongodb.net/justfans?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  // Hide password in logs for security
  const safeUri = uri.replace(/:([^@]+)@/, ':****@');
  console.log(`Connecting to: ${safeUri} ...\n`);

  try {
    const conn = await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 8000
    });

    console.log('🎉 SUCCESS! Connected to MongoDB Atlas!');
    console.log(`   Cluster Host: ${conn.connection.host}`);
    console.log(`   Database:     ${conn.connection.name}`);
    console.log(`   Port:         ${conn.connection.port || 27017}`);
    console.log('\n✅ Your JustFans platform is now fully connected to MongoDB Atlas!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed!\n');
    console.error(`Error message: ${err.message}\n`);

    console.log('Troubleshooting Tips:');
    if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
      console.log('1. [Bad Password/Username]: Double check your database user username & password.');
      console.log('   If your password contains special characters like "@", "#", "$", replace "@" with "%40".');
    } else if (err.message.includes('ETIMEDOUT') || err.message.includes('querySrv') || err.message.includes('whitelist')) {
      console.log('1. [IP Whitelist Blocked]: In MongoDB Atlas -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).');
    } else {
      console.log('1. Ensure your MongoDB Atlas cluster is in the "ACTIVE" state.');
      console.log('2. Ensure the connection string format begins with "mongodb+srv://".');
    }
    console.log('\n');
    process.exit(1);
  }
};

testConnection();

