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

  // ── Additional verified TED talks (round 2) ─────────────────────────────
  {
    youtube_id: 'H14bBuluwB8',
    title: 'Grit: The Power of Passion and Perseverance',
    speaker: 'Angela Lee Duckworth',
    channel: 'TED',
    topic_tags: ['psychology', 'perseverance', 'success', 'education'],
    summary_en:
      'Psychologist Angela Lee Duckworth argues that "grit" — sustained passion and perseverance toward long-term goals — predicts success better than talent or IQ, based on research spanning West Point cadets, spelling-bee contestants, and teachers.',
    question:
      'What does Angela Duckworth mean by "grit," and how does she say it differs from talent? Can you think of a goal you stuck with through difficulty — or gave up on too early? Explain.',
  },
  {
    youtube_id: 'VO6XEQIsCoM',
    title: 'The Paradox of Choice',
    speaker: 'Barry Schwartz',
    channel: 'TED',
    topic_tags: ['psychology', 'decision-making', 'consumer culture', 'happiness'],
    summary_en:
      "Barry Schwartz argues that today's overwhelming abundance of choices, far from making us freer, produces paralysis and less satisfaction, since more options raise expectations and increase regret.",
    question:
      "What is Barry Schwartz's \"paradox of choice\"? Have you ever felt overwhelmed or less satisfied because you had too many options? Describe what happened.",
  },
  {
    youtube_id: '4q1dgn_C0AU',
    title: 'The Surprising Science of Happiness',
    speaker: 'Dan Gilbert',
    channel: 'TED',
    topic_tags: ['psychology', 'happiness', 'decision-making', 'perception'],
    summary_en:
      'Dan Gilbert presents research on our "psychological immune system" — the unconscious process that lets people manufacture genuine happiness even after losing a competition, a limb, or a relationship.',
    question:
      'What does Dan Gilbert mean by our "psychological immune system"? Can you recall a time something didn\'t go your way but you ended up okay with it anyway? What happened?',
  },
  {
    youtube_id: 'P_6vDLq64gE',
    title: 'How to Spot a Liar',
    speaker: 'Pamela Meyer',
    channel: 'TED',
    topic_tags: ['psychology', 'communication', 'deception', 'behavior'],
    summary_en:
      'Deception expert Pamela Meyer explains that the average person is lied to many times a day, and outlines verbal and nonverbal cues — like distancing language and inconsistent gestures — that can reveal dishonesty.',
    question:
      'What is one technique Pamela Meyer describes for spotting a liar? Do you think you\'re good at telling when someone is lying to you? Give an example if you can.',
  },
  {
    youtube_id: 'R1vskiVDwl4',
    title: '10 Ways to Have a Better Conversation',
    speaker: 'Celeste Headlee',
    channel: 'TED',
    topic_tags: ['communication', 'listening', 'relationships', 'habits'],
    summary_en:
      'Radio host Celeste Headlee shares ten practical rules for better conversations — including being present and avoiding repeating yourself — arguing that genuine listening is the single most important skill.',
    question:
      "Which one of Celeste Headlee's conversation rules do you think you break the most? Why do you think that habit is hard to change?",
  },
  {
    youtube_id: 'V74AxCqOTvg',
    title: 'How to Start a Movement',
    speaker: 'Derek Sivers',
    channel: 'TED',
    topic_tags: ['leadership', 'social dynamics', 'group behavior'],
    summary_en:
      'Using video of a lone dancer at an outdoor festival, Derek Sivers argues that the first follower — not the initial leader — is what actually transforms a solo act into a movement.',
    question:
      'According to Derek Sivers, why is the "first follower" more important than the original leader in starting a movement? Have you ever been a first follower — the one who joined in before it was popular to do so?',
  },
  {
    youtube_id: 'KM4Xe6Dlp0Y',
    title: "Looks Aren't Everything. Believe Me, I'm a Model.",
    speaker: 'Cameron Russell',
    channel: 'TED',
    topic_tags: ['appearance', 'identity', 'media', 'society'],
    summary_en:
      'Fashion model Cameron Russell candidly examines the role of genetics and social construction in her career, questioning why society gives so much power to physical appearance.',
    question:
      'What does Cameron Russell say determined her success as a model, and how does she feel about that? Do you think appearance matters too much in your own field or culture? Why or why not?',
  },
  {
    youtube_id: '4sZdcB6bjI8',
    title: "Why Some of Us Don't Have One True Calling",
    speaker: 'Emilie Wapnick',
    channel: 'TED',
    topic_tags: ['career', 'identity', 'creativity', 'self-discovery'],
    summary_en:
      'Career coach Emilie Wapnick introduces the idea of the "multipotentialite" — someone with many interests and creative pursuits rather than one true calling — and argues this is a real strength.',
    question:
      'What is a "multipotentialite" according to Emilie Wapnick? Do you relate more to having one clear passion, or many different interests? Explain with an example.',
  },
  {
    youtube_id: '3c8ajL5o2U8',
    title: '3 Things I Learned While My Plane Crashed',
    speaker: 'Ric Elias',
    channel: 'TED',
    topic_tags: ['life', 'perspective', 'priorities', 'mortality'],
    summary_en:
      'Ric Elias, a passenger on the 2009 US Airways flight that crash-landed in the Hudson River, shares the three things that became instantly clear to him as he thought he was about to die.',
    question:
      'What are the three things Ric Elias says he learned while he thought his plane was crashing? If you believed you had very little time left, what would become most important to you?',
  },
  {
    youtube_id: 'UNP03fDSj1U',
    title: 'Try Something New for 30 Days',
    speaker: 'Matt Cutts',
    channel: 'TED',
    topic_tags: ['habits', 'self-improvement', 'productivity', 'goals'],
    summary_en:
      'Google engineer Matt Cutts describes how adopting month-long personal challenges — like writing a novel or biking to work — changed his habits and confidence more than trying to change forever all at once.',
    question:
      "What is Matt Cutts' \"30-day challenge\" idea, and what examples does he give? If you tried a 30-day challenge starting tomorrow, what would you pick and why?",
  },
]

/** Pick a random video, optionally excluding already-used IDs */
export function pickRandomVideo(excludeIds: string[] = []): CuratedVideo {
  const pool = CURATED_VIDEOS.filter(v => !excludeIds.includes(v.youtube_id))
  const list = pool.length > 0 ? pool : CURATED_VIDEOS
  return list[Math.floor(Math.random() * list.length)]
}
