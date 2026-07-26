/**
 * Curated video list for the video_listening task.
 *
 * IMPORTANT: Add entries ONLY after manually verifying the YouTube ID by
 * opening https://www.youtube.com/watch?v=<id> in a browser.
 *
 * All IDs in this file were verified via web search against official
 * TED/YouTube sources. See each entry's channel field for attribution.
 *
 * Each entry includes a pre-written discussion question so video_listening
 * tasks do NOT require Gemini to generate YouTube IDs (preventing hallucination).
 */

export interface CuratedVideo {
  youtube_id: string
  title: string
  speaker: string
  channel: string
  topic_tags: string[]
  summary_en: string
  question: string   // pre-written discussion question shown to learner
}

export const CURATED_VIDEOS: CuratedVideo[] = [
  // ── TED classics (original 6) ──────────────────────────────────────────
  {
    youtube_id: 'arj7oStGLkU',
    title: 'Inside the Mind of a Master Procrastinator',
    speaker: 'Tim Urban',
    channel: 'TED',
    topic_tags: ['psychology', 'productivity', 'self-awareness'],
    summary_en:
      'Tim Urban explains the "Instant Gratification Monkey" that hijacks rational decision-making in procrastinators, and why panic is the only thing that gets them to act.',
    question:
      "Summarize Tim Urban's \"Instant Gratification Monkey\" idea in 2-3 sentences. Do you recognize any of these patterns in yourself? Give a specific example if you can.",
  },
  {
    youtube_id: 'iG9CE55wbtY',
    title: 'Do Schools Kill Creativity?',
    speaker: 'Sir Ken Robinson',
    channel: 'TED',
    topic_tags: ['education', 'creativity', 'society'],
    summary_en:
      'Ken Robinson argues that modern education systems suppress creativity and that schools should treat creativity as seriously as literacy.',
    question:
      "What is Ken Robinson's main argument about schools and creativity? Do you agree? Give one example from your own school experience to support your view.",
  },
  {
    youtube_id: 'iCvmsMzlF7o',
    title: 'The Power of Vulnerability',
    speaker: 'Brené Brown',
    channel: 'TED',
    topic_tags: ['psychology', 'connection', 'courage'],
    summary_en:
      'Brené Brown shares research showing that vulnerability is at the heart of human connection and belonging, and that numbing it disconnects us from meaning.',
    question:
      'In 2-3 sentences, explain what Brené Brown means by "vulnerability" and why she thinks it matters. Has her talk changed how you think about showing weakness? Why or why not?',
  },
  {
    youtube_id: 'qp0HIF3SfI4',
    title: 'How Great Leaders Inspire Action',
    speaker: 'Simon Sinek',
    channel: 'TED',
    topic_tags: ['leadership', 'business', 'motivation'],
    summary_en:
      'Simon Sinek presents the "Golden Circle" — why inspiring leaders start with WHY (purpose) rather than WHAT (product).',
    question:
      "Explain Simon Sinek's \"Start With Why\" idea in your own words. Can you think of a leader, company, or person in your life who embodies this approach? Describe them briefly.",
  },
  {
    youtube_id: 'UF8uR6Z6KLc',
    title: 'Stanford Commencement Address 2005',
    speaker: 'Steve Jobs',
    channel: 'Stanford University',
    topic_tags: ['career', 'life', 'purpose', 'failure'],
    summary_en:
      'Steve Jobs shares three stories — connecting the dots, love and loss, and death — arguing that following your passion and intuition is the only way to live a fulfilled life.',
    question:
      "Which of Steve Jobs' three stories resonated with you most, and why? Do you think his advice (\"follow your heart\") is realistic for everyone? Give your honest opinion.",
  },
  {
    youtube_id: 'D9Ihs241zeg',
    title: 'The Danger of a Single Story',
    speaker: 'Chimamanda Ngozi Adichie',
    channel: 'TED',
    topic_tags: ['culture', 'storytelling', 'identity', 'stereotypes'],
    summary_en:
      'Chimamanda Adichie explains how reducing people or places to a single narrative creates misunderstanding, and why multiple stories are essential.',
    question:
      'What does Chimamanda Adichie mean by "the danger of a single story"? Can you think of a time you held a single story about a person, country, or group — and later found out the full picture was more complex?',
  },

  // ── Additional verified TED talks ──────────────────────────────────────
  {
    youtube_id: 'Ks-_Mh1QhMc',
    title: 'Your Body Language May Shape Who You Are',
    speaker: 'Amy Cuddy',
    channel: 'TED',
    topic_tags: ['psychology', 'body language', 'confidence', 'behavior'],
    summary_en:
      'Amy Cuddy presents research suggesting that adopting "power poses" — expansive, confident body postures — can influence your feelings of power and even your hormonal responses before high-pressure situations.',
    question:
      "What is Amy Cuddy's main claim about how body language affects how we feel about ourselves? Have you ever noticed that your posture or gestures changed how confident you felt? Give a specific example.",
  },
  {
    youtube_id: 'RcGyVTAoXEU',
    title: 'How to Make Stress Your Friend',
    speaker: 'Kelly McGonigal',
    channel: 'TED',
    topic_tags: ['psychology', 'stress', 'health', 'mindset'],
    summary_en:
      'Psychologist Kelly McGonigal shares research showing that stress is only harmful if you believe it to be — and that viewing the physical symptoms of stress as energizing can actually improve health outcomes.',
    question:
      "What is Kelly McGonigal's key argument about stress and belief? Has this talk changed or challenged how you think about stress in your own life? Give a personal example if you can.",
  },
  {
    youtube_id: 'c0KYU2j0TM4',
    title: 'The Power of Introverts',
    speaker: 'Susan Cain',
    channel: 'TED',
    topic_tags: ['psychology', 'introversion', 'personality', 'society'],
    summary_en:
      'Susan Cain argues that modern society — from open-plan offices to group brainstorming — is built for extroverts, and that introverts, who often do their best thinking alone, bring extraordinary talents that are being suppressed.',
    question:
      "What is Susan Cain's main argument about how society treats introverts? Do you consider yourself more introverted or extroverted? How has that shaped your experiences at school or work?",
  },
  {
    youtube_id: 'rrkrvAUbU9Y',
    title: 'The Puzzle of Motivation',
    speaker: 'Dan Pink',
    channel: 'TED',
    topic_tags: ['psychology', 'motivation', 'business', 'autonomy'],
    summary_en:
      'Career analyst Dan Pink challenges the assumption that financial rewards drive performance, presenting research showing that autonomy, mastery, and purpose are far more powerful motivators for creative work.',
    question:
      "What are the three motivators Dan Pink says are more powerful than money for creative tasks? Do you agree? Think of a time when you were highly motivated — what was driving you?",
  },
  {
    youtube_id: 'UyyjU8fzEYU',
    title: 'My Stroke of Insight',
    speaker: 'Jill Bolte Taylor',
    channel: 'TED',
    topic_tags: ['neuroscience', 'consciousness', 'brain', 'stroke'],
    summary_en:
      'Brain scientist Jill Bolte Taylor describes experiencing a stroke and watching her own brain functions — motion, speech, self-awareness — shut down one by one, offering a rare first-person window into what happens when the left hemisphere goes offline.',
    question:
      "What did Jill Bolte Taylor learn about the difference between the brain's left and right hemispheres from her stroke? Which part of her experience surprised you most, and why?",
  },
  {
    youtube_id: 'hVimVzgtD6w',
    title: "The Best Stats You've Ever Seen",
    speaker: 'Hans Rosling',
    channel: 'TED',
    topic_tags: ['data', 'global development', 'statistics', 'health'],
    summary_en:
      'Hans Rosling uses stunning animated data visualization to debunk common Western misconceptions about the "developing world," showing that most of humanity now lives in the middle of the global health and wealth spectrum.',
    question:
      'What misconception about the "developing world" does Hans Rosling challenge with his data? Did any of his statistics surprise you? Why do you think these misconceptions persist, and how can data help us think more clearly?',
  },
  {
    youtube_id: 'eIho2S0ZahI',
    title: 'How to Speak So That People Want to Listen',
    speaker: 'Julian Treasure',
    channel: 'TED',
    topic_tags: ['communication', 'speaking', 'voice', 'habits'],
    summary_en:
      'Sound expert Julian Treasure outlines seven "deadly sins" of speaking that make people tune out, and offers concrete vocal exercises and techniques for communicating with more power and empathy.',
    question:
      "What is one of Julian Treasure's \"seven deadly sins of speaking\" that you think you might be guilty of? What specific technique from the talk do you want to apply to your own English speaking?",
  },
  {
    youtube_id: '_X0mgOOSpLU',
    title: 'The Power of Believing That You Can Improve',
    speaker: 'Carol Dweck',
    channel: 'TED',
    topic_tags: ['education', 'growth mindset', 'learning', 'psychology'],
    summary_en:
      'Stanford professor Carol Dweck explains "growth mindset" — the belief that abilities can be developed through dedication — and shows how it fundamentally changes how students respond to challenges and failures.',
    question:
      'Explain the difference between a "fixed mindset" and a "growth mindset" in your own words. Can you recall a time when you had a fixed mindset about something? How might a growth mindset have led to a different outcome?',
  },
  {
    youtube_id: '86x-u-tz0MA',
    title: 'Your Elusive Creative Genius',
    speaker: 'Elizabeth Gilbert',
    channel: 'TED',
    topic_tags: ['creativity', 'writing', 'inspiration', 'arts'],
    summary_en:
      "Author Elizabeth Gilbert proposes that instead of a rare person \"being\" a genius, all of us \"have\" a genius — an external, mysterious force that visits us — a reframe that removes the crushing pressure of creative responsibility.",
    question:
      "What is Elizabeth Gilbert's idea that genius \"visits\" us from outside rather than living inside us? How might thinking of creativity this way change how you deal with fear of failure or creative blocks?",
  },
  {
    youtube_id: 'fxbCHn6gE3U',
    title: 'The Surprising Habits of Original Thinkers',
    speaker: 'Adam Grant',
    channel: 'TED',
    topic_tags: ['creativity', 'innovation', 'procrastination', 'originality'],
    summary_en:
      "Organizational psychologist Adam Grant reveals that original thinkers share three counterintuitive habits: they procrastinate strategically, they doubt themselves productively, and they fail more — because they try more.",
    question:
      "What is one surprising habit of original thinkers that Adam Grant describes? Does this change how you feel about procrastination or self-doubt in your own creative process? Give a personal example if possible.",
  },
  {
    youtube_id: 'fLJsdqxnZb0',
    title: 'The Happy Secret to Better Work',
    speaker: 'Shawn Achor',
    channel: 'TED',
    topic_tags: ['happiness', 'positive psychology', 'productivity', 'success'],
    summary_en:
      "Positive psychology researcher Shawn Achor argues that the formula \"work hard → succeed → be happy\" is backwards: happiness actually precedes and fuels higher performance, not the other way around.",
    question:
      "What is Shawn Achor's main argument about the relationship between happiness and success? Do you think we have this formula backwards in your culture or workplace? What is one small thing you could do to feel more positive before studying or working?",
  },
  {
    youtube_id: '8KkKuTCFvzI',
    title: 'What Makes a Good Life? Lessons from the Longest Study on Happiness',
    speaker: 'Robert Waldinger',
    channel: 'TED',
    topic_tags: ['happiness', 'relationships', 'health', 'longevity'],
    summary_en:
      "Psychiatrist Robert Waldinger, director of a 75-year Harvard study on adult development, reveals that the clearest predictor of long-term health and happiness is not wealth, fame, or achievement — but the quality of our close relationships.",
    question:
      "What does the Harvard 75-year study identify as the most important factor for a long, happy life? Does this match your own beliefs or experiences? How do you currently prioritize relationships in your life?",
  },
  {
    youtube_id: 'MBRqu0YOH14',
    title: 'Optimistic Nihilism',
    speaker: 'Kurzgesagt',
    channel: 'Kurzgesagt – In a Nutshell',
    topic_tags: ['philosophy', 'nihilism', 'meaning', 'life', 'existentialism'],
    summary_en:
      "Kurzgesagt explores optimistic nihilism — the idea that in a universe without inherent meaning, we are liberated rather than burdened: free to create our own purpose and find joy in the brief, improbable moment we get to exist.",
    question:
      'In your own words, what does "optimistic nihilism" mean? Do you find this philosophy comforting, unsettling, or somewhere in between? How do you personally create meaning in your own life?',
  },
]

/** Pick a random video, optionally excluding already-used IDs */
export function pickRandomVideo(excludeIds: string[] = []): CuratedVideo {
  const pool = CURATED_VIDEOS.filter(v => !excludeIds.includes(v.youtube_id))
  const list = pool.length > 0 ? pool : CURATED_VIDEOS
  return list[Math.floor(Math.random() * list.length)]
}
