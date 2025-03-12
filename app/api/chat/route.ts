import { deepseek } from "@ai-sdk/deepseek"
import { streamText } from "ai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

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

