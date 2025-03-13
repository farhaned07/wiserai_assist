import { deepseek } from "@ai-sdk/deepseek"
import { streamText, generateText } from "ai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60; // Set max duration to 60 seconds

// Simple in-memory cache for common queries
const responseCache = new Map<string, { timestamp: number, response: string }>();
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of cached responses

// Function to generate a cache key from messages
function generateCacheKey(messages: any[]) {
  // Only cache if there are 1-2 messages (initial queries)
  if (messages.length <= 2) {
    return JSON.stringify(messages);
  }
  return null;
}

export async function POST(req: Request) {
  try {
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

    // Check cache for common queries
    const cacheKey = generateCacheKey(messages);
    if (cacheKey) {
      const cachedResult = responseCache.get(cacheKey);
      if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL)) {
        // Return cached response but don't stream it
        return NextResponse.json({ response: cachedResult.response });
      }
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
- Prioritize helpfulness and relevance above all`

    // For non-streaming responses (for caching purposes)
    if (cacheKey) {
      try {
        // Use generateText instead of streamText.complete
        const { text } = await generateText({
          model: deepseek("deepseek-chat"),
          messages,
          system: systemPrompt,
          temperature: 0.7,
          maxTokens: 2048,
        });
        
        // Cache the response
        if (responseCache.size >= MAX_CACHE_SIZE) {
          // Remove oldest entry if cache is full
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
        
        responseCache.set(cacheKey, {
          timestamp: Date.now(),
          response: text
        });
        
        return NextResponse.json({ response: text });
      } catch (error) {
        console.error("Error generating non-streaming response:", error);
        // Fall back to streaming response
      }
    }

    // For streaming responses (most cases)
    const result = streamText({
      model: deepseek("deepseek-chat"),
      messages,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    })

    return result.toDataStreamResponse({
      sendReasoning: false,
    })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

