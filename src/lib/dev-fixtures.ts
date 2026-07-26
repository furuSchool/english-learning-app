import { Task } from '@/types'

function makeTask(type: string, category: string, content: unknown): Task {
  return {
    id: `dev-${type}`,
    type: type as Task['type'],
    category: category as Task['category'],
    content: content as Task['content'],
    difficulty: 1,
    created_at: new Date().toISOString(),
    active: true,
  }
}

export const DEV_FIXTURES: Task[] = [
  makeTask('rapid_fire_qa', 'warmup', {
    questions: [
      "What did you have for breakfast this morning?",
      "If you could live anywhere in the world for a year, where would you go and why?",
      "What's the last thing that genuinely surprised you?",
    ],
  }),

  makeTask('shadowing_drill', 'warmup', {
    text: "You know, I've been thinking about this a lot lately — and I mean, it's kind of hard to put into words, but I sort of feel like the way we work is changing faster than we're ready for. Like, not in a bad way, necessarily, but it does make you wonder where things are headed, you know?",
    source_context: "Casual conversation between two researchers at a coffee break",
    focus_point: "Notice how 'kind of', 'sort of', and 'you know' are used as natural hedges and fillers — practice keeping the rhythm of these without pausing.",
  }),

  makeTask('video_listening', 'input', {
    youtube_id: 'arj7oStGLkU',
    title: 'Inside the Mind of a Master Procrastinator',
    channel: 'TED',
    question: 'Summarize the speaker\'s main argument in 2-3 sentences. Do you recognize any of these patterns in yourself? Answer in English.',
  }),

  makeTask('tech_news_react', 'input', {
    live: true,
  }),

  makeTask('podcast_listening', 'input', {
    live: true,
  }),

  makeTask('quote_reaction', 'input', {
    quote: "The measure of intelligence is the ability to change.",
    author: "Albert Einstein",
    prompt: "Do you agree that adaptability is the best measure of intelligence? Or is there something more important? State your position clearly and give at least one specific reason or example.",
  }),

  makeTask('ai_conversation', 'interactive', {
    character: "Priya",
    character_description: "An exchange student from the UK studying sociology, currently on a 6-month program at your university",
    opening_line: "Hey! I finally made it to that curry place near the station — have you been? It was honestly way better than I expected.",
    topic_hint: "Food, local recommendations, and adjusting to life in Japan",
  }),

  makeTask('devils_advocate', 'interactive', {
    topic: "Pursuing a PhD is rarely the optimal career path for most people",
    user_prompt: "State your position on this. The AI will argue the opposite no matter what you say.",
  }),

  makeTask('information_gap', 'interactive', {
    scenario_description: "A friend named Kenji canceled your lunch plans 30 minutes before because his ex-girlfriend suddenly reached out after 2 years of silence, asking to meet urgently. He's conflicted because he's now in a new relationship and doesn't want to cause drama, but he's also worried something might be wrong with her.",
    user_prompt: "Your friend Kenji suddenly canceled your lunch plans with a vague text: 'Sorry, something came up. Really sorry.' The AI knows exactly why. Ask questions to find out the full story.",
    reveal_hints: [
      "It involves another person from his past",
      "The timing was unexpected and urgent",
      "He has complicated feelings about going",
      "His current relationship is relevant to the situation",
    ],
    final_reveal: "Kenji's ex reached out after 2 years asking to meet urgently. He canceled to go meet her, feeling torn between concern and not wanting to upset his current partner.",
  }),

  makeTask('news_discussion', 'interactive', {
    live: true,
  }),

  makeTask('phrase_activation', 'expression', {
    phrases: [
      {
        phrase: "That tracks",
        meaning_ja: "「それは納得できる」「辻褄が合う」という意味のカジュアルな相槌",
        example: "She didn't show up to the meeting again? Yeah, that tracks — she mentioned she was overwhelmed last week.",
      },
      {
        phrase: "To be fair",
        meaning_ja: "公平に言えば、という前置きで反論や補足を柔らかく入れる表現",
        example: "To be fair, he did warn us the project would take longer than expected.",
      },
    ],
  }),

  makeTask('collocation_builder', 'expression', {
    collocations: [
      {
        wrong: "do a mistake",
        correct: "make a mistake",
        context: "I made a mistake in the report — I used last quarter's figures by accident.",
        trap_note: "日本語の「ミスをする（する＝do）」から「do a mistake」と言いがちだが、英語では mistake には make を使う。",
      },
      {
        wrong: "strong rain",
        correct: "heavy rain",
        context: "The event was canceled because of heavy rain and poor visibility.",
        trap_note: "日本語では「強い雨」と言うが、英語の rain は strong ではなく heavy と組み合わせる。",
      },
    ],
  }),

  makeTask('natural_expression', 'expression', {
    japanese: "しょうがない",
    literal_translation: "It cannot be helped",
    explanation_ja: "どうにもならない状況を受け入れる時に使う。「仕方ない」「諦めよう」というニュアンス。",
    natural_expressions: [
      {
        english: "What can you do?",
        context: "Casual resignation — used when something went wrong and there's nothing left to fix.",
      },
      {
        english: "It is what it is.",
        context: "Accepting a situation you can't change, often said with a shrug.",
      },
      {
        english: "That's just how it goes.",
        context: "Expressing that bad things sometimes happen without a specific reason.",
      },
    ],
  }),

  makeTask('discourse_marker_drill', 'expression', {
    markers: ["That said", "If anything", "Having said that"],
    marker_hints: {
      "That said": "前に言ったことを認めつつ、逆の方向に話を転じる。「とは言え」",
      "If anything": "「むしろ〜だ」と逆方向を強調。予想に反することを述べる時に使う",
      "Having said that": "That said と似ているが、少しフォーマルで「そうは言っても」のニュアンス",
    },
    topic: "Do you think social media has made it easier or harder for people to connect genuinely?",
  }),

  makeTask('social_formula', 'expression', {
    formula_focus: "Softening disagreement",
    useful_phrases: [
      "I see your point, but...",
      "That's a fair point — though I'd argue...",
      "I'm not sure I fully agree, because...",
      "You might be right, but from my perspective...",
    ],
    scenario: "During a group project meeting, a teammate suggests cutting a key feature to save time. You disagree, but don't want to cause tension. Practice pushing back politely in English.",
  }),

  makeTask('impromptu_speak', 'output', {
    topic: "What's something you believed strongly in high school that you've since changed your mind about?",
    category: "personal",
    starter_hint: "You could start with 'Honestly, looking back...' or 'When I was in high school, I was convinced that...'",
  }),

  makeTask('situation_survival', 'output', {
    situation: "学会発表後、会場の外国人研究者に突然話しかけられた。発表の内容についていくつか質問されそうだ。",
    scenario_en: "Post-presentation Q&A (informal)",
    opening_line: "Hey, great talk! I had a quick question about the methodology you used — how did you decide on that particular approach?",
    context: "相手は friendly だが、専門的な質問をしてくる可能性がある。まず自分の言葉で答え、わからない部分は正直に言おう。",
  }),
]

export const DEV_FIXTURE_MAP = new Map(DEV_FIXTURES.map(t => [t.type, t]))
