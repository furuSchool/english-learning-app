/**
 * Gemini prompts for task generation and feedback.
 *
 * Design (see /workspace/prompt_new.md):
 * - Learner profile is a single shared constant used by both generation and feedback.
 * - Topic/context/theme diversity is handled by picking randomly from const pools in
 *   code and embedding the choice into the prompt, instead of asking the model to
 *   "be diverse" in prose.
 * - Feedback assumes voice-to-text input: only flag errors that would actually break
 *   comprehension for a native listener.
 */

const LEARNER_PROFILE = `Learner profile:
- Level: Strong reading vocabulary, but lacks real-time conversational agility. Target difficulty: CEFR B2 (TOEFL ~80).
- Speaking pattern: Tends to translate directly from Japanese sentence structure — struggles to start with "Subject + Verb," leading to broken grammar, pauses, or freezing on unexpected questions.
- Goal: "Rough but effective" communication. Conveying the core message matters more than grammatical accuracy or speed.`

const CORE_FEEDBACK_PRINCIPLE = `Input is speech-to-text from spoken English — expect disfluencies, filler words, repeated words, and fragment-like phrasing; never flag these.
Ignore isolated word-level slips (wrong/misheard word, typo — e.g. "flexable" for "fixable") if the sentence still reads clearly despite them.
Only flag expressions where the meaning would still fail to reach a native listener after mentally correcting such slips — not awkwardness, not minor grammar. If nothing rises to that bar, return an empty list.`

// ── Topic / context pools (§2.2 of the requirements doc) ────────────────────
// Picked randomly at generation time and embedded into the prompt so diversity
// comes from code, not from prose instructions to the model.

const TOPIC_POOL = [
  'daily routines & household life',
  'food, cooking & restaurants',
  'travel & transportation',
  'health, fitness & sleep',
  'education & studying',
  'work, career & job interviews',
  'money, spending & financial decisions',
  'technology & social media (non-technical)',
  'environment & sustainability',
  'social relationships & friendship',
  'family & parenting',
  'culture, customs & traditions',
  'media, movies & music',
  'sports & physical activity',
  'fashion, appearance & self-image',
  'mental health & emotions',
  'ethics & moral dilemmas',
  'science & discovery (accessible)',
  'history & current events (general)',
  'art, creativity & imagination',
]

const SHADOWING_CONTEXTS = [
  'casual academic chat', 'lab hallway conversation', 'coffee break chat', 'meeting wrap-up',
  'phone call with a friend', 'waiting-in-line small talk', 'text exchange with a classmate',
  'casual party conversation', 'elevator small talk', 'dinner table conversation',
  'catching up after a long time', 'complaining about the weather', 'planning a weekend trip',
  'chat with a coworker before a meeting', 'catching a train together', 'casual video call with family',
]

const QUOTE_THEMES = [
  'education', 'technology & society', 'human nature', 'work & career', 'creativity',
  'progress & change', 'ambition', 'failure & resilience', 'happiness', 'time & mortality',
  'freedom', 'courage', 'simplicity', 'wisdom', 'art', 'money & wealth', 'leadership',
  'curiosity', 'risk-taking', 'authenticity', 'growth & self-improvement', 'tradition vs innovation',
  'solitude', 'competition',
]

const SOCIAL_FORMULA_CONTEXTS = [
  'academic seminar', 'thesis/project meeting', 'job interview', 'work meeting',
  'negotiating a deadline', 'giving feedback to a coworker', 'meeting new people at an event',
  'party small talk', 'disagreeing with a friend', 'customer service interaction',
  'asking a stranger for help', 'group project disagreement', 'professional networking event',
]

const IMPROMPTU_TOPIC_SEEDS: Record<string, string[]> = {
  personal: ['a belief you changed your mind about', 'a moment you felt proud', 'a habit you want to break', 'a risk you took', 'someone who influenced you', 'a fear you overcame'],
  opinion: ['is money the key to happiness', 'should college be free', 'is remote work better than office work', 'is social media net positive or negative', 'should AI grade papers'],
  hypothetical: ['if you could redo one decision', 'if you had unlimited money for a year', 'if you could master any skill overnight', 'if you had to move to a new country tomorrow'],
  world: ['how might AI change work in ten years', 'is climate change reversible', 'should countries open all borders', 'will physical books disappear'],
}

const SITUATION_SURVIVAL_SEEDS: Record<string, string[]> = {
  academic: ['unexpected question after your presentation', 'a professor challenges your methodology', 'a classmate asks to see your data'],
  professional: ['your boss asks why a deadline was missed', 'a colleague pushes back on your proposal', 'small talk with a new hire'],
  social: ['someone asks an overly personal question', "you're introduced to someone whose name you forgot", 'someone disagrees loudly with your opinion'],
  practical: ["a stranger asks for directions you don't know", 'you need to return a faulty product', "you're overcharged at a store"],
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDistinct<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function pickSeed(seeds: Record<string, string[]>): { category: string; seed: string } {
  const category = pickOne(Object.keys(seeds))
  return { category, seed: pickOne(seeds[category]) }
}

// ── Task generation prompts ──────────────────────────────────────────────────
// Each entry builds the type-specific spec for ONE task (the caller generates
// tasks one at a time; see /api/generate-tasks).

const TASK_SPECS: Record<string, () => string> = {
  rapid_fire_qa: () => {
    const [t1, t2, t3] = pickDistinct(TOPIC_POOL, 3)
    return `--- rapid_fire_qa (category: warmup) ---
content: { "questions": [3 conversational questions] }
Topics for this task's 3 questions (use one each, in order): ${t1} (personal/opinion angle), ${t2} (hypothetical/current-events angle), ${t3} (daily-life angle)
Rules:
- 2-4 sentence answers required; no yes/no questions
- Natural conversational phrasing, not textbook style`
  },

  shadowing_drill: () => {
    const context = pickOne(SHADOWING_CONTEXTS)
    return `--- shadowing_drill (category: warmup) ---
content: { "text": "<60-80 word passage>", "source_context": "<given context>" }
Context for this passage: ${context}
Rules:
- Natural SPOKEN English (contractions, reduced forms, discourse markers) — not formal written English
- Include fillers ("you know", "I mean"), hedges ("sort of", "kind of"), natural rhythm
- Match tone to the given context`
  },

  quote_reaction: () => {
    const theme = pickOne(QUOTE_THEMES)
    return `--- quote_reaction (category: input) ---
content: { "quote": "<quote text>", "author": "<name>", "prompt": "<discussion prompt>" }
Theme for this quote: ${theme}
Rules:
- Choose a genuinely debatable quote related to this theme — not universally agreed upon
- Avoid partisan political quotes
- prompt must ask user to agree/disagree with at least one specific reason`
  },

  ai_conversation: () => `--- ai_conversation (category: interactive) ---
content: { "character": "<role>", "character_description": "<1 sentence>", "opening_line": "<first thing they say>", "topic_hint": "<what the conversation is about>" }
Rules:
- Characters: international PhD student, visiting researcher, exchange student from Europe/US, lab alumnus now at a company, friend studying abroad
- opening_line must be casual and natural (not "Hello, how are you?")
- Conversation should naturally lead to sharing opinions, experiences, or plans
- topic_hint gives the underlying theme: career plans, research struggles, weekend activities, cultural differences, recent news, etc.
- Example opening: "Hey, did you end up going to that talk yesterday? I couldn't make it..."`,

  devils_advocate: () => `--- devils_advocate (category: interactive) ---
content: { "topic": "<statement>", "user_prompt": "<instruction to user>" }
Rules:
- Statement should be genuinely debatable (smart people reasonably disagree)
- NOT partisan politics
- Contexts: academia, technology, lifestyle, social trends, education system, work culture
- user_prompt: "State your position on this. The AI will argue the opposite no matter what you say."`,

  information_gap: () => `--- information_gap (category: interactive) ---
content: { "scenario_description": "<full picture the AI knows>", "user_prompt": "<vague situation user sees>", "reveal_hints": ["<hint 1>", "<hint 2>", "<hint 3>", "<hint 4>"], "final_reveal": "<complete picture>" }
Rules:
- The user asks the AI questions, one at a time, to gradually uncover the full situation
- Scenarios: planning a surprise, figuring out a social misunderstanding, understanding someone's motivation, solving a soft problem
- scenario_description must be rich enough for 4-6 exchanges
- user_prompt should be intriguing and vague
- reveal_hints go from vague to specific`,

  phrase_activation: () => `--- phrase_activation (category: expression) ---
content: { "phrases": [ { "phrase": "<expression>", "meaning_ja": "<Japanese meaning 1 line>", "example": "<natural example sentence>" } ] }
Rules:
- Exactly 2 phrases, from different functional categories (discourse markers, hedges, reactions, fillers, softeners, emphasis words, etc.)
- Vary the specific phrases each time — avoid defaulting to the same handful of textbook examples
- example must show the phrase used naturally in a conversational context`,

  collocation_builder: () => `--- collocation_builder (category: expression) ---
content: { "collocations": [ { "wrong": "<common mistake>", "correct": "<correct form>", "context": "<example sentence>", "trap_note": "<why Japanese speakers get this wrong>" } ] }
Rules:
- Exactly 2 collocations
- Any verb+noun, adjective+noun, or preposition pattern that Japanese learners commonly get wrong due to L1 transfer is fair game — not limited to a fixed set (make/do/take/have/give/pay + noun; strong/powerful/heavy/hard + noun; preposition choices are just examples, not the full range)
- trap_note must explain the Japanese-transfer logic`,

  natural_expression: () => `--- natural_expression (category: expression) ---
content: { "japanese": "<expression>", "literal_translation": "<awkward literal>", "explanation_ja": "<usage context in Japanese>", "natural_expressions": [ { "english": "<natural version>", "context": "<when to use this version>" } ] }
Rules:
- Choose from a wide range of everyday Japanese expressions — not limited to the classic list below; avoid repeating the same expressions across generations
- Provide exactly 3 natural_expressions
- Inspiration only, not a fixed list: "なんとなく", "微妙", "よろしくお願いします", "しょうがない", "えっと", "なるほど", "お世話になっています", "ご苦労様"`,

  discourse_marker_drill: () => `--- discourse_marker_drill (category: expression) ---
content: { "markers": ["<marker1>", "<marker2>", "<marker3>"], "marker_hints": { "<marker>": "<Japanese usage hint>" }, "topic": "<opinion topic>" }
Rules:
- 3 markers per task; choose from these categories:
  contrast: "that said", "then again", "even so", "having said that"
  addition: "on top of that", "what's more", "not to mention"
  clarification: "in other words", "to put it differently", "what I mean is"
  hedging: "to be fair", "in a sense", "to some extent"
  emphasis: "if anything", "above all", "more importantly"
- topic must be genuinely debatable and answerable in 60 seconds
- marker_hints in Japanese explain WHEN to use each marker`,

  social_formula: () => {
    const context = pickOne(SOCIAL_FORMULA_CONTEXTS)
    return `--- social_formula (category: expression) ---
content: { "formula_focus": "<skill name>", "useful_phrases": ["<phrase1>", "<phrase2>", "<phrase3>"], "scenario": "<situation description>" }
Rules:
- formula_focus: one of — "Politely interrupting", "Softening disagreement", "Asking for clarification without seeming rude", "Expressing uncertainty gracefully", "Acknowledging a point before countering", "Changing topic smoothly", "Showing active listening"
- 3-4 useful_phrases (real, colloquial)
- Build the scenario around this context: ${context}`
  },

  impromptu_speak: () => {
    const { category, seed } = pickSeed(IMPROMPTU_TOPIC_SEEDS)
    return `--- impromptu_speak (category: output) ---
content: { "topic": "<prompt>", "category": "<personal|opinion|hypothetical|world>", "starter_hint": "<how to begin>" }
Seed for this task: ${seed} (category: ${category})
Rules:
- Expand the seed into a topic requiring 60-90 seconds of unprepared speaking
- starter_hint gives a natural opening phrase`
  },

  situation_survival: () => {
    const { category, seed } = pickSeed(SITUATION_SURVIVAL_SEEDS)
    return `--- situation_survival (category: output) ---
content: { "situation": "<situation in Japanese>", "scenario_en": "<brief English label>", "opening_line": "<what the other person says in English>", "context": "<extra context in Japanese>" }
Seed for this task: ${seed} (category: ${category})
Rules:
- opening_line is what the OTHER person says — user must respond
- Build a realistic, uncomfortable-but-common situation around the seed`
  },
}

/** Builds a prompt that generates exactly ONE task of the given type. */
export function buildGeneratePrompt(type: string): string {
  const spec = TASK_SPECS[type]
  if (!spec) throw new Error(`Unknown task type for generation: ${type}`)

  return `You are designing an English-learning task for the following learner:

${LEARNER_PROFILE}

Generate exactly one task of this type.

Return ONLY a valid JSON object with no markdown or code fences:
{
  "difficulty": <1|2|3>,
  "content": { <type-specific fields> }
}

${spec()}

Return ONLY the JSON object. No explanation. No markdown.`
}

// ── Feedback prompts ────────────────────────────────────────────────────────

const CONVERSATION_TASKS = new Set([
  'ai_conversation', 'devils_advocate', 'information_gap',
  'news_discussion', 'situation_survival',
])

const FEEDBACK_BASE = `You are reviewing spoken English (voice-to-text) from a Japanese learner.

${LEARNER_PROFILE}

${CORE_FEEDBACK_PRINCIPLE}

Output fields:
- corrections: Only expressions that would fail to convey meaning to a native listener. No fixed count — return as many as genuinely needed (often zero). reason_ja: ONE short Japanese sentence — what English word order/phrasing is natural here. Terse, no extra commentary.
- corrected_text: The learner's full input, with only those corrections marked inline as ~~wrong|right~~ (text after the closing ~~ is unmarked). Leave correct text unchanged; if nothing needs fixing, return the original as-is.
- saveable_phrases: 2-3 short phrases or idioms worth memorizing (NOT full sentences), in the same spoken register.
- overall_comment_ja: ONE short Japanese sentence judging whether the answer is natural/appropriate for the question — say plainly if the nuance is off or fine. Not a generic tip.
- ideal_answer: A natural, casual spoken-style answer to the actual question/prompt above (not a paraphrase of the learner's input) — simple and conversational, the way people actually talk, not a polished written sentence. Similar length to the learner's input.`

function taskSpecificFeedbackContext(taskType: string, ctx: Record<string, unknown>): string {
  switch (taskType) {
    case 'rapid_fire_qa': {
      const questions = (ctx.questions as string[]) ?? []
      const answers = (ctx.user_answers as string[]) ?? []
      const qa = questions.map((q, i) => `Q${i + 1}: ${q}\nA: ${answers[i] ?? '(no answer)'}`).join('\n\n')
      return `Q&A:\n${qa}`
    }
    case 'shadowing_drill':
      return `Original: "${ctx.original_text}"\nParaphrase: "${ctx.user_paraphrase}"`
    case 'video_listening':
      return `Question: "${ctx.question}"\nAnswer: "${ctx.user_answer}"`
    case 'tech_news_react':
      return `News: "${ctx.news_summary}"\nQuestion: "${ctx.question}"\nResponse: "${ctx.user_answer}"`
    case 'podcast_listening':
      return `Question: "${ctx.question}"\nAnswer: "${ctx.user_answer}"`
    case 'quote_reaction':
      return `Quote: "${ctx.quote}"\nPrompt: "${ctx.discussion_prompt}"\nResponse: "${ctx.user_answer}"`
    case 'phrase_activation':
      return `Phrase: "${ctx.phrase}"\nSentence: "${ctx.user_sentence}"`
    case 'collocation_builder':
      return `Collocation: "${ctx.target_collocation}"\nSentence: "${ctx.user_sentence}"`
    case 'natural_expression':
      return `Japanese: "${ctx.japanese_expression}"\nAnswer: "${ctx.user_answer}"`
    case 'discourse_marker_drill': {
      const markers = (ctx.markers as string[]) ?? []
      return `Topic: "${ctx.topic}"\nMarkers: ${markers.map(m => `"${m}"`).join(', ')}\nSpeech: "${ctx.user_answer}"`
    }
    case 'social_formula':
      return `Skill: "${ctx.formula_focus}"\nScenario: "${ctx.scenario}"\nResponse: "${ctx.user_answer}"`
    case 'impromptu_speak':
      return `Topic: "${ctx.topic}"\nSpeech: "${ctx.user_answer}"`
    case 'ai_conversation':
      return `Chat log:\n${ctx.chat_log}`
    case 'devils_advocate':
      return `Topic: "${ctx.topic}"\nChat log:\n${ctx.chat_log}`
    case 'information_gap':
      return `Chat log:\n${ctx.chat_log}`
    case 'news_discussion':
      return `Chat log:\n${ctx.chat_log}`
    case 'situation_survival':
      return `Chat log:\n${ctx.chat_log}`
    default:
      return `User input: "${ctx.user_answer ?? ctx.chat_log ?? ''}"`
  }
}

function buildPerTurnCorrectionPrompt(ctx: Record<string, unknown>): string {
  const priorAiMessage = (ctx.prior_ai_message as string) ?? ''
  const userMessage = (ctx.user_message as string) ?? ''
  return `${CORE_FEEDBACK_PRINCIPLE}

Previous line: "${priorAiMessage}"
Learner's reply: "${userMessage}"

Return ONLY valid JSON (no explanation, no markdown):
{ "corrections": [{ "original": "...", "corrected": "..." }] }`
}

export function buildFeedbackPrompt(taskType: string, context: Record<string, unknown>): string {
  if (taskType === 'per_turn_correction') {
    return buildPerTurnCorrectionPrompt(context)
  }

  const taskContext = taskSpecificFeedbackContext(taskType, context)
  const isConversation = CONVERSATION_TASKS.has(taskType)

  if (isConversation) {
    return `${FEEDBACK_BASE}

${taskContext}

Return ONLY valid JSON (no explanation, no markdown):
{
  "corrections": [{ "original": "...", "corrected": "...", "reason_ja": "..." }],
  "saveable_phrases": ["...", "..."],
  "overall_comment_ja": "...",
  "ideal_answer": "..."
}`
  }

  return `${FEEDBACK_BASE}

${taskContext}

Return ONLY valid JSON (no explanation, no markdown):
{
  "corrected_text": "...",
  "corrections": [{ "original": "...", "corrected": "...", "reason_ja": "..." }],
  "saveable_phrases": ["...", "..."],
  "overall_comment_ja": "...",
  "ideal_answer": "..."
}`
}

export const CHAT_SYSTEM_PROMPTS: Record<string, (content: Record<string, unknown>) => string> = {
  ai_conversation: (content) => `Roleplay as: ${content.character} — ${content.character_description}
Topic: ${content.topic_hint}
Your opening line (already sent): "${content.opening_line}"

Rules: Natural, flowing conversation with genuine follow-ups. If answers are short, gently prompt for more. 2-3 sentences per turn. Never correct the user's English. Stay in character. Wrap up naturally after 4-5 exchanges.`,

  devils_advocate: (content) => `Topic: "${content.topic}"

Rules: Argue the opposite of whatever position the user takes, using real arguments — not strawmen. 3-4 sentences per turn. Never correct English. After 3-4 exchanges, you may acknowledge their strongest point.`,

  information_gap: (content) => `Full situation (only you know this): "${content.scenario_description}"
Hints, vague → specific: ${(content.reveal_hints as string[])?.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n')}
Full reveal: "${content.final_reveal}"

Rules: Answer only what's asked — don't volunteer extra info. 2-3 sentences per turn. Start revealing more after 4-6 exchanges. Never correct English.`,

  situation_survival: (content) => `Role: ${content.character_description}
Situation: ${content.topic_hint}

Rules: Stay in character as the other person in this situation. Respond realistically — don't make it easy. 2-3 sentences per turn. Wrap up naturally after 2-3 exchanges. Never correct English.`,

  news_discussion: (_content) => `Rules: Brief the learner on the news story like you're telling a friend, then ask for their reaction. Follow up with probing questions; share your own take occasionally. 2-3 sentences per turn. Never correct English.`,
}
