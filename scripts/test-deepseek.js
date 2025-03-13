#!/usr/bin/env node

/**
 * This script tests the DeepSeek API connection.
 * Run it with: node scripts/test-deepseek.js
 */

require('dotenv').config({ path: '.env.local' });
const { deepseek } = require("@ai-sdk/deepseek");
const { generateText } = require("ai");

async function testDeepSeekAPI() {
  console.log("Testing DeepSeek API connection...");
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("Error: DEEPSEEK_API_KEY is not set in .env.local");
    process.exit(1);
  }
  
  console.log("API Key found. Attempting to connect to DeepSeek API...");
  
  try {
    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      prompt: "Hello, can you respond with a simple test message?",
      temperature: 0.7,
      maxTokens: 100,
    });
    
    console.log("\nAPI Response:");
    console.log("-------------");
    console.log(text);
    console.log("-------------");
    console.log("\nSuccess! The DeepSeek API is working correctly.");
  } catch (error) {
    console.error("\nError connecting to DeepSeek API:");
    console.error(error);
    
    if (error.message && error.message.includes("401")) {
      console.error("\nThis appears to be an authentication error. Your API key may be invalid or expired.");
    } else if (error.message && error.message.includes("429")) {
      console.error("\nThis appears to be a rate limit error. You may have exceeded your API quota.");
    }
    
    process.exit(1);
  }
}

testDeepSeekAPI(); 