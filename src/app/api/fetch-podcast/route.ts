import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// BBC Global News Podcast — public RSS with direct mp3 enclosures
const BBC_RSS = 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss'

interface PodcastEpisode {
  title: string
  audio_url: string
  description: string
}

async function fetchLatestBBCEpisode(): Promise<PodcastEpisode | null> {
  const res = await fetch(BBC_RSS, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const xml = await res.text()

  const titleMatch = xml.match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/)
  const enclosureMatch = xml.match(/<enclosure[^>]+url="([^"]+)"/)
  const descMatch = xml.match(/<item>[\s\S]*?<description><!\[CDATA\[(.*?)\]\]><\/description>/)

  if (!enclosureMatch) return null

  return {
    title: titleMatch?.[1] ?? 'BBC Global News Podcast',
    audio_url: enclosureMatch[1],
    description: descMatch?.[1]?.replace(/<[^>]+>/g, '').slice(0, 500) ?? '',
  }
}

export async function GET() {
  try {
    const episode = await fetchLatestBBCEpisode()
    if (!episode) {
      return NextResponse.json({ error: 'Could not fetch podcast' }, { status: 404 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Based on this BBC Global News Podcast episode description, generate 3 listening comprehension + opinion questions in English.

Episode: "${episode.title}"
Description: "${episode.description}"

Questions should:
1. Check basic comprehension (what happened / who was involved)
2. Ask for the listener's reaction or opinion
3. Connect to a broader theme or personal experience

Return ONLY a JSON array of 3 question strings. No markdown.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const questions: string[] = JSON.parse(jsonStr)

    return NextResponse.json({
      episode_title: episode.title,
      audio_url: episode.audio_url,
      description: episode.description,
      questions,
    })
  } catch (error) {
    console.error('fetch-podcast error:', error)
    return NextResponse.json({ error: 'Failed to fetch podcast' }, { status: 500 })
  }
}
