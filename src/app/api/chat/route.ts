import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { CHAT_SYSTEM_PROMPTS } from '@/lib/prompts'
import { ChatMessage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { taskType, taskContent, messages } = await request.json() as {
      taskType: string
      taskContent: Record<string, unknown>
      messages: ChatMessage[]
    }

    const systemPromptFn = CHAT_SYSTEM_PROMPTS[taskType]
    if (!systemPromptFn) {
      return NextResponse.json({ error: 'Unknown interactive task type' }, { status: 400 })
    }

    const systemPrompt = systemPromptFn(taskContent)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    })

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const reply = result.response.text().trim()

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
