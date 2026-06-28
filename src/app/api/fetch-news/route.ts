import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface HNItem {
  id: number
  title: string
  url?: string
  score: number
  type: string
}

async function fetchHNArticle(): Promise<{ title: string; url: string; text: string } | null> {
  const topIds: number[] = await fetch(
    'https://hacker-news.firebaseio.com/v0/topstories.json'
  ).then(r => r.json())

  // Try candidates from the top 30, pick one with a URL (not Ask HN / Show HN)
  const candidates = topIds.slice(0, 30)
  for (const id of candidates) {
    const item: HNItem = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    ).then(r => r.json())

    if (item.type === 'story' && item.url && item.score > 50) {
      // Fetch article text via Jina reader (free, no key needed)
      try {
        const readerRes = await fetch(`https://r.jina.ai/${item.url}`, {
          headers: { Accept: 'text/plain' },
          signal: AbortSignal.timeout(8000),
        })
        if (readerRes.ok) {
          const text = await readerRes.text()
          // Truncate to ~3000 chars for Gemini context
          return { title: item.title, url: item.url, text: text.slice(0, 3000) }
        }
      } catch {
        // Jina failed; use just the title
        return { title: item.title, url: item.url, text: '' }
      }
    }
  }
  return null
}

export async function GET() {
  try {
    const article = await fetchHNArticle()
    if (!article) {
      return NextResponse.json({ error: 'No article found' }, { status: 404 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Summarize this tech/IT news article in 3 short paragraphs of plain English suitable for a Japanese graduate student (advanced English level) who wants to know the key point and be able to discuss it.

Article title: ${article.title}
Article text: ${article.text || '(Only title available)'}

Write the summary in natural, conversational English — not formal. About 150-200 words total.
Return ONLY the summary text, no headers or markdown.`

    const result = await model.generateContent(prompt)
    const summary = result.response.text().trim()

    return NextResponse.json({
      title: article.title,
      summary,
      source_url: article.url,
    })
  } catch (error) {
    console.error('fetch-news error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
