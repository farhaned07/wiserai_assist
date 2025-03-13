#!/usr/bin/env node

/**
 * This script tests the chat API endpoint directly.
 * Run it with: node scripts/test-chat-api.js
 */

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testChatAPI() {
  console.log("Testing Chat API endpoint directly...");
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("Error: DEEPSEEK_API_KEY is not set in .env.local");
    process.exit(1);
  }
  
  console.log("API Key found. Attempting to call the chat API endpoint...");
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Hello, can you respond with a simple test message?'
          }
        ]
      }),
    });
    
    if (!response.ok) {
      console.error(`Error: HTTP status ${response.status}`);
      const errorText = await response.text();
      console.error(`Response: ${errorText}`);
      process.exit(1);
    }
    
    const data = await response.json();
    
    console.log("\nAPI Response:");
    console.log("-------------");
    console.log(data);
    console.log("-------------");
    console.log("\nSuccess! The Chat API endpoint is working correctly.");
  } catch (error) {
    console.error("\nError calling Chat API endpoint:");
    console.error(error);
    process.exit(1);
  }
}

testChatAPI(); 