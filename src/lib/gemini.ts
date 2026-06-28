import { GoogleGenerativeAI } from '@google/generative-ai'
import { Feedback } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getFeedback(
  transcript: string,
  taskContext: string
): Promise<Feedback> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You are an English language coach. Analyze the following English speech/text from a Japanese learner.

Task context: ${taskContext}
User input: "${transcript}"

Respond ONLY with a JSON object (no markdown, no code blocks) in this exact format:
{
  "corrected_text": "The full corrected version of the user's input",
  "inline_corrections": [
    {
      "original": "the incorrect phrase",
      "corrected": "the correct phrase",
      "explanation": "短い日本語での説明（なぜこれが間違いか）"
    }
  ],
  "error_explanation": "日本語で1〜2文のみ。致命的なエラーの理由だけを簡潔に説明。エラーがない場合は空文字。",
  "native_expressions": [
    "Alternative natural expression 1",
    "Alternative natural expression 2"
  ]
}

Rules:
- Only flag errors that would cause misunderstanding or sound very unnatural to natives
- Do not flag minor errors or stylistic choices
- inline_corrections: list only truly problematic phrases (max 3)
- native_expressions: provide 2-3 more natural/sophisticated alternatives
- Keep error_explanation brief and in Japanese
- If the input is already natural, set inline_corrections to [] and error_explanation to ""
- corrected_text should be a polished version of their input`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  return JSON.parse(jsonStr) as Feedback
}
