import { deepseek } from "@ai-sdk/deepseek"
import { streamText, generateText } from "ai"
import { NextResponse } from "next/server"
import { createHash } from "crypto"

export const runtime = "nodejs"
export const maxDuration = 60; // Set max duration to 60 seconds

// Enhanced in-memory cache for queries
const responseCache = new Map<string, { timestamp: number, response: string }>();
const CACHE_TTL = 24 * 3600 * 1000; // 24 hours in milliseconds (increased from 1 hour)
const MAX_CACHE_SIZE = 200; // Maximum number of cached responses (increased from 100)

// Request throttling
const userRequestsMap = new Map<string, { count: number, timestamp: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;
const THROTTLE_WINDOW = 60 * 1000; // 1 minute

// In-flight requests tracking to prevent duplicate API calls
const inFlightRequests = new Map<string, Promise<any>>();

// Prefetch cache for common follow-up questions
const prefetchCache = new Map<string, Set<string>>();

// Common follow-up patterns to prefetch
const COMMON_FOLLOWUPS = [
  "tell me more about",
  "explain",
  "summarize",
  "what is",
  "how to",
  "why is",
  "when was",
  "where is"
];

// Function to generate a cache key from messages
function generateCacheKey(messages: any[]) {
  // Generate a hash of the messages to use as a cache key
  const messagesStr = JSON.stringify(messages);
  return createHash('md5').update(messagesStr).digest('hex');
}

// Function to check if a request should be throttled
function shouldThrottleRequest(userIp: string): boolean {
  const now = Date.now();
  const userRequests = userRequestsMap.get(userIp);
  
  if (!userRequests) {
    userRequestsMap.set(userIp, { count: 1, timestamp: now });
    return false;
  }
  
  // Reset counter if outside the throttle window
  if (now - userRequests.timestamp > THROTTLE_WINDOW) {
    userRequestsMap.set(userIp, { count: 1, timestamp: now });
    return false;
  }
  
  // Check if user has exceeded the request limit
  if (userRequests.count >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }
  
  // Increment the request count
  userRequestsMap.set(userIp, { 
    count: userRequests.count + 1, 
    timestamp: userRequests.timestamp 
  });
  
  return false;
}

// Extract potential topics from a message for prefetching
function extractPotentialTopics(message: string): string[] {
  // Simple extraction of potential topics (nouns and noun phrases)
  const topics: string[] = [];
  
  // Split by common delimiters and extract potential topics
  const words = message.split(/[\s,.?!:;()\[\]{}'"]+/);
  
  // Filter out short words and common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'after', 'since', 'during']);
  
  // Extract potential topics (words with 4+ characters that aren't stop words)
  for (const word of words) {
    if (word.length >= 4 && !stopWords.has(word.toLowerCase())) {
      topics.push(word.toLowerCase());
    }
  }
  
  return topics;
}

// Prefetch potential follow-up questions
async function prefetchFollowups(cacheKey: string, lastMessage: string, systemPrompt: string) {
  try {
    // Extract potential topics from the last message
    const topics = extractPotentialTopics(lastMessage);
    
    // Skip if no topics found
    if (topics.length === 0) return;
    
    // Generate potential follow-up questions
    const followupQuestions = new Set<string>();
    
    // Combine common follow-up patterns with extracted topics
    for (const topic of topics) {
      for (const pattern of COMMON_FOLLOWUPS) {
        followupQuestions.add(`${pattern} ${topic}`);
      }
    }
    
    // Store the potential follow-up questions
    prefetchCache.set(cacheKey, followupQuestions);
    
    // Prefetch responses for the most likely follow-up questions (limit to 2)
    const topFollowups = Array.from(followupQuestions).slice(0, 2);
    
    // Prefetch in the background without blocking
    for (const followup of topFollowups) {
      setTimeout(async () => {
        try {
          // Create a new message array with the follow-up question
          const followupMessages = [{ role: "user" as const, content: followup }];
          const followupCacheKey = generateCacheKey(followupMessages);
          
          // Skip if already cached or in-flight
          if (responseCache.has(followupCacheKey) || inFlightRequests.has(followupCacheKey)) {
            return;
          }
          
          // Generate the response in the background
          const { text } = await generateText({
            model: deepseek("deepseek-chat"),
            messages: followupMessages,
            system: systemPrompt,
            temperature: 0.6,
            maxTokens: 800,
          });
          
          // Cache the response
          responseCache.set(followupCacheKey, {
            timestamp: Date.now(),
            response: text
          });
        } catch (error) {
          // Silently fail for prefetching
          console.error("Error prefetching follow-up:", error);
        }
      }, 0);
    }
  } catch (error) {
    // Silently fail for prefetching
    console.error("Error in prefetch process:", error);
  }
}

// Clean up old entries from the request throttling map
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of userRequestsMap.entries()) {
    if (now - data.timestamp > THROTTLE_WINDOW) {
      userRequestsMap.delete(ip);
    }
  }
}, THROTTLE_WINDOW);

// Clean up old prefetch cache entries
setInterval(() => {
  // Keep prefetch cache size manageable
  if (prefetchCache.size > 100) {
    // Remove random entries when too large
    const keys = Array.from(prefetchCache.keys());
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * keys.length);
      prefetchCache.delete(keys[randomIndex]);
    }
  }
}, 3600 * 1000); // Clean up every hour

export async function POST(req: Request) {
  try {
    // Get user IP for throttling
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Check if request should be throttled
    if (shouldThrottleRequest(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." }, 
        { status: 429 }
      );
    }
    
    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { messages } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DeepSeek API key is not configured" }, { status: 500 })
    }

    // System prompt with core instructions
    const systemPrompt = `You are Bangladesh AI, a helpful assistant optimized for both Bangla and English speakers.

## Language Adaptation
- Respond in the same language the user is using (Bangla or English)
- If the user switches languages, adapt accordingly
- For mixed language queries, respond in the predominant language

## Knowledge Focus
- Specialize in Bangladesh's culture, history, geography, economy, and current affairs
- Provide accurate information about local customs, traditions, and practices
- Stay neutral on sensitive political topics while providing factual information

## Response Structure
- Always begin with a direct answer to the user's question in 1-2 sentences
- Use clear headings (##) to organize longer responses into sections
- For complex topics, use bullet points or numbered lists
- Include a brief conclusion or summary for longer responses
- Limit responses to 3-5 key points maximum

## Response Style
- Use clear, concise language appropriate for the user's proficiency level
- Format responses with Markdown for readability (headings, lists, bold for emphasis)
- Include relevant examples that resonate with Bangladeshi context when appropriate
- Be respectful of cultural values and religious sensitivities

## Balanced Approach
- Combine clarity with conversational warmth
- Adapt formality based on the user's tone
- Balance depth of information with accessibility
- Use a mix of factual presentation and engaging elements
- Prioritize helpfulness and relevance above all

## Response Length
- Keep responses concise and to the point (under 250 words when possible)
- Avoid unnecessary verbosity and repetition
- Focus on the most relevant information first
- For complex questions, provide a brief answer followed by structured details

## Latency Optimization
- Start with a brief, direct answer immediately
- Provide the most important information first
- Add details progressively in a structured format
- Ensure the first sentence is complete and valuable on its own`

    // Generate cache key
    const cacheKey = generateCacheKey(messages);
    
    // Check if we already have a cached response
    const cachedResult = responseCache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
      // Return cached response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const message = {
            id: Date.now().toString(),
            role: "assistant",
            content: cachedResult.response,
          };
          
          controller.enqueue(encoder.encode(JSON.stringify(message) + "\n"));
          controller.close();
        },
      });
      
      return new Response(stream);
    }
    
    // Check if there's already an in-flight request for this cache key
    if (inFlightRequests.has(cacheKey)) {
      try {
        // Wait for the existing request to complete
        const response = await inFlightRequests.get(cacheKey);
        
        // Return the response from the completed request
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const message = {
              id: Date.now().toString(),
              role: "assistant",
              content: response,
            };
            
            controller.enqueue(encoder.encode(JSON.stringify(message) + "\n"));
            controller.close();
          },
        });
        
        return new Response(stream);
      } catch (error) {
        // If the in-flight request failed, remove it and continue with a new request
        inFlightRequests.delete(cacheKey);
      }
    }
    
    // For non-cached responses, create a new request
    // Create a promise for the full response that will be stored in the in-flight requests map
    const responsePromise = generateText({
      model: deepseek("deepseek-chat"),
      messages,
      system: systemPrompt,
      temperature: 0.6,
      maxTokens: 800,
    }).then(result => result.text);
    
    // Store the promise in the in-flight requests map
    inFlightRequests.set(cacheKey, responsePromise);
    
    // Use streamText for the actual response
    const result = streamText({
      model: deepseek("deepseek-chat"),
      messages,
      system: systemPrompt,
      temperature: 0.6,
      maxTokens: 800,
    });
    
    // Store the response in the cache once it's complete
    responsePromise.then(text => {
      // Cache management: remove oldest entry if cache is full
      if (responseCache.size >= MAX_CACHE_SIZE) {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, value] of responseCache.entries()) {
          if (value.timestamp < oldestTime) {
            oldestTime = value.timestamp;
            oldestKey = key;
          }
        }
        
        if (oldestKey) {
          responseCache.delete(oldestKey);
        }
      }
      
      // Add the new response to the cache
      responseCache.set(cacheKey, {
        timestamp: Date.now(),
        response: text
      });
      
      // Remove from in-flight requests
      inFlightRequests.delete(cacheKey);
      
      // Trigger prefetching for potential follow-up questions
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1].content;
        if (typeof lastMessage === 'string') {
          prefetchFollowups(cacheKey, lastMessage, systemPrompt);
        }
      }
    }).catch(error => {
      // Remove from in-flight requests on error
      inFlightRequests.delete(cacheKey);
      console.error("Error generating response:", error);
    });
    
    return result.toDataStreamResponse({
      sendReasoning: false,
    });
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

