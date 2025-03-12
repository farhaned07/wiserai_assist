import { type NextRequest, NextResponse } from "next/server"
import { deepseek } from "@ai-sdk/deepseek"
import { generateText } from "ai"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DeepSeek API key is not configured" }, { status: 500 })
    }

    // Read file content as text
    const fileContent = await file.text()
    const fileType = file.type
    const fileName = file.name

    // Determine file type and create appropriate prompt
    let prompt = ""
    if (fileType.includes("image")) {
      prompt = `This is an image file named "${fileName}". Since I can't process images directly, please ask the user for more details about what they'd like to know about this image.`
    } else {
      // For text-based files, extract content (limit to reasonable size)
      const excerpt = fileContent.slice(0, 5000)

      prompt = `Analyze the following ${fileType} document named "${fileName}":
      
${excerpt}
      
${excerpt.length < fileContent.length ? "Note: This is just an excerpt of the full document." : ""}
      
Please provide:
1. A concise summary of the key points
2. Main topics or themes identified
3. Relevant insights based on the content
4. Any action items or recommendations if applicable`
    }

    // System prompt with core instructions
    const systemPrompt = `You are Bangladesh AI, analyzing a document for the user.

## Language Adaptation
- If the document contains Bangla text, respond in Bangla
- If the document is in English, respond in English
- For mixed language documents, use the predominant language

## Analysis Approach
- Focus on extracting the most valuable information
- Identify patterns, themes, and key points
- Organize your analysis in a clear, structured format using Markdown
- Be objective and factual in your assessment

## Balanced Style
- Use clear, accessible language appropriate for the content
- Provide detailed analysis with logical organization
- Balance technical accuracy with understandable explanations
- Highlight practical insights and applications where relevant
- Adapt tone based on the document's content and purpose`

    // Use DeepSeek to analyze the file content
    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      prompt,
      system: systemPrompt,
      temperature: 0.5,
      maxTokens: 2048,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}

