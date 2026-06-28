/**
 * Gemini prompts for task generation.
 *
 * User profile (baked into all prompts):
 * - 22-year-old UTokyo grad student, Electronic Information Engineering
 * - Goal: functional communication, not perfect English
 * - Weakness: real-time speaking/listening (especially fast casual speech)
 * - Context: international lab members, Q&A after seminars, daily life
 * - Standard: "rough but gets the message across" — not textbook perfect
 * - Topics: diverse across daily life, culture, business, academic (NOT only CS)
 */

const USER_CONTEXT = `
Target learner:
- 22-year-old Japanese graduate student at the University of Tokyo (Electronic Information Engineering)
- TOEFL ~92; strong reading, weak real-time speaking and listening
- Goal: communicate naturally with international students/researchers — rough is fine as long as it gets the message across
- Primary weakness: freezing up when asked unexpected questions, casual fast speech
- Topics must be DIVERSE: rotate across daily life, culture/hobbies, business/professional, and academic/research contexts
- Do NOT focus exclusively on CS/tech topics
- Difficulty standard: intermediate-advanced (CEFR B2-C1)
`.trim()

export function buildGeneratePrompt(types: string[]): string {
  return `You are designing English-learning tasks for the following learner:

${USER_CONTEXT}

Generate exactly 3 tasks for EACH of these task types: ${types.join(', ')}

Return ONLY a valid JSON array with no markdown or code fences. Each element must have:
{
  "type": "<task_type>",
  "category": "<category>",
  "difficulty": <1|2|3>,
  "content": { <type-specific fields> }
}

=== TASK SPECIFICATIONS ===

--- rapid_fire_qa (category: warmup) ---
content: { "questions": [5 conversational questions] }
Rules:
- Mix: 2 personal/opinion, 1 hypothetical, 1 current-events, 1 daily-life
- Require 2-4 sentence answers; no yes/no questions
- Feel like natural conversation, not textbook exercises
- Topics must vary: travel, food, career plans, technology opinions, cultural differences, ethics, hobbies
- Example: "If you had to live in a different country for a year, where would you go and why?"

--- shadowing_drill (category: warmup) ---
content: { "text": "<60-80 word passage>", "source_context": "<brief context>", "focus_point": "<what to focus on>" }
Rules:
- Write in natural SPOKEN English (contractions, reduced forms, discourse markers)
- NOT formal written English
- Include: fillers ("you know", "I mean"), hedges ("sort of", "kind of"), natural rhythm
- Contexts: casual academic chat, lab hallway conversation, coffee chat, meeting wrap-up
- focus_point should name a specific prosody feature (e.g., "Notice how 'going to' becomes 'gonna' in natural speech")

--- video_listening (category: input) ---
content: { "youtube_id": "<id>", "title": "<title>", "channel": "<channel>", "question": "<discussion prompt>" }
Rules:
- Use REAL YouTube video IDs that you are confident exist
- Go beyond TED — include: Lex Fridman clips, Kurzgesagt, Veritasium, crash course, documentary clips, BBC interviews, tech conference talks, philosophy/science YouTube
- Avoid videos longer than 8 minutes
- Topics: science, AI/tech trends, psychology, social issues, economics, environment, culture
- question should ask for summary + personal opinion

--- quote_reaction (category: input) ---
content: { "quote": "<quote text>", "author": "<name>", "prompt": "<discussion prompt>" }
Rules:
- Choose genuinely debatable quotes — not universally agreed upon
- Authors: philosophers, scientists, entrepreneurs, authors, researchers
- Avoid partisan political quotes
- Topics: education, technology's role in society, human nature, work, creativity, progress
- prompt must ask user to agree/disagree with at least one specific reason
- Example: "The measure of intelligence is the ability to change. — Albert Einstein"

--- ai_conversation (category: interactive) ---
content: { "character": "<role>", "character_description": "<1 sentence>", "opening_line": "<first thing they say>", "topic_hint": "<what the conversation is about>" }
Rules:
- Characters: international PhD student, visiting researcher, exchange student from Europe/US, lab alumnus now at a company, friend studying abroad
- opening_line must be casual and natural (not "Hello, how are you?")
- Conversation should naturally lead to sharing opinions, experiences, or plans
- topic_hint gives the underlying theme: career plans, research struggles, weekend activities, cultural differences, recent news, etc.
- Example opening: "Hey, did you end up going to that talk yesterday? I couldn't make it..."

--- devils_advocate (category: interactive) ---
content: { "topic": "<statement>", "user_prompt": "<instruction to user>" }
Rules:
- Statement should be genuinely debatable (smart people reasonably disagree)
- NOT partisan politics
- Contexts: academia, technology, lifestyle, social trends, education system, work culture
- Examples: "Specialization is more valuable than being a generalist in today's world", "Social media has made meaningful connection harder, not easier", "Pursuing a PhD is rarely the optimal career path"
- user_prompt: "State your position on this. The AI will argue the opposite no matter what you say."

--- information_gap (category: interactive) ---
content: { "scenario_description": "<full picture the AI knows>", "user_prompt": "<vague situation user sees>", "reveal_hints": ["<hint 1>", "<hint 2>", "<hint 3>", "<hint 4>"], "final_reveal": "<complete picture>" }
Rules:
- User must ask questions to uncover the full situation (like 20 questions)
- Scenarios: planning a surprise, figuring out a social misunderstanding, understanding someone's motivation, solving a soft problem
- scenario_description must be rich enough for 4-6 exchanges
- user_prompt should be intriguing and vague: "Your friend canceled your plans at the last minute. The AI knows why. Ask questions to find out."
- reveal_hints go from vague to specific

--- phrase_activation (category: expression) ---
content: { "phrases": [ { "phrase": "<expression>", "meaning_ja": "<Japanese meaning 1 line>", "example": "<natural example sentence>" } ] }
Rules:
- Exactly 3 phrases per task
- Focus on phrases Japanese learners never use but native speakers use constantly:
  discourse markers: "That being said", "To be fair", "If anything", "As it stands"
  hedges: "I wouldn't say exactly...", "It's hard to put into words", "Sort of, yeah"
  reactions: "That tracks", "Fair enough", "I can see where you're coming from"
  fillers: "Let me think out loud for a second", "Bear with me"
- example must show the phrase used naturally in a conversational context

--- collocation_builder (category: expression) ---
content: { "collocations": [ { "wrong": "<common mistake>", "correct": "<correct form>", "context": "<example sentence>", "trap_note": "<why Japanese speakers get this wrong>" } ] }
Rules:
- Exactly 3 collocations per task
- Focus on verb+noun pairs Japanese learners get wrong due to L1 transfer:
  make/do/take/have/give/pay + noun
  strong/powerful/heavy/hard + noun
  preposition choices that differ from Japanese
- trap_note must explain the Japanese-transfer logic (e.g., "Japanese 'ミスをする' → 'do a mistake', but English uses 'make'")
- context sentence should be natural and conversational

--- natural_expression (category: expression) ---
content: { "japanese": "<expression>", "literal_translation": "<awkward literal>", "explanation_ja": "<usage context in Japanese>", "natural_expressions": [ { "english": "<natural version>", "context": "<when to use this version>" } ] }
Rules:
- Choose expressions that come up in actual conversation (not just famous untranslatable words)
- Categories: social rituals, emotional nuance, situational phrases, temporal expressions
- Provide exactly 3 natural_expressions
- Examples: "なんとなく", "微妙", "よろしくお願いします", "しょうがない", "えっと", "なるほど", "お世話になっています", "ご苦労様"

--- discourse_marker_drill (category: expression) ---
content: { "markers": ["<marker1>", "<marker2>", "<marker3>"], "marker_hints": { "<marker>": "<Japanese usage hint>" }, "topic": "<opinion topic>" }
Rules:
- 3 markers per task; choose from these categories:
  contrast: "that said", "then again", "even so", "having said that"
  addition: "on top of that", "what's more", "not to mention"
  clarification: "in other words", "to put it differently", "what I mean is"
  hedging: "to be fair", "in a sense", "to some extent"
  emphasis: "if anything", "above all", "more importantly"
- topic must be genuinely debatable and answerable in 60 seconds
- marker_hints in Japanese explain WHEN to use each marker

--- social_formula (category: expression) ---
content: { "formula_focus": "<skill name>", "useful_phrases": ["<phrase1>", "<phrase2>", "<phrase3>"], "scenario": "<situation description>" }
Rules:
- formula_focus: one of — "Politely interrupting", "Softening disagreement", "Asking for clarification without seeming rude", "Expressing uncertainty gracefully", "Acknowledging a point before countering", "Changing topic smoothly", "Showing active listening"
- 3-4 useful_phrases (real, colloquial)
- scenario: a concrete realistic situation requiring that formula (can be academic, professional, or social)
- Examples of good scenarios: "During a seminar Q&A, you want to politely push back on the presenter's conclusion." / "A colleague is explaining something you already know. You want to redirect without seeming dismissive."

--- impromptu_speak (category: output) ---
content: { "topic": "<prompt>", "category": "<personal|opinion|hypothetical|world>", "starter_hint": "<how to begin>" }
Rules:
- Topics require 60-90 seconds of speaking without preparation
- Rotate categories equally across tasks
- Topics should be interesting enough that the learner WANTS to talk
- Starter_hint gives a natural opening phrase (e.g., "You could start with 'Honestly, I think...' or 'From my experience...'")
- Examples: "What's something you believed strongly in high school that you've since changed your mind about?", "If AI could do your research for you, would you still want to pursue your degree?", "Describe a moment when you felt genuinely proud of yourself"

--- situation_survival (category: output) ---
content: { "situation": "<situation in Japanese>", "scenario_en": "<brief English label>", "opening_line": "<what the other person says in English>", "context": "<extra context in Japanese>" }
Rules:
- Universal situations (NOT limited to CS/tech)
- Contexts: academic Q&A (someone asks an unexpected question after your presentation), professional (internship, meeting), social (meeting new people, awkward moments), practical (navigating everyday life in English)
- opening_line is what the OTHER person says — user must respond
- Focus on realistic, uncomfortable-but-common situations
- Examples: "Could you elaborate on that point?" / "I actually disagree with your approach — here's why..." / "So what do you do for fun outside of research?"

=== END SPECIFICATIONS ===

Return ONLY the JSON array. No explanation. No markdown.`
}

export const CHAT_SYSTEM_PROMPTS: Record<string, (content: Record<string, unknown>) => string> = {
  ai_conversation: (content) => `You are roleplaying as: ${content.character} — ${content.character_description}

Rules:
- Have a natural, flowing conversation in English
- Ask genuine follow-up questions ("Oh really? Why do you think that?" / "That's interesting — how did that go?")
- React naturally to what the user says; don't just move to the next question
- If the user gives short answers, gently prompt for more ("Can you say more about that?")
- Keep your turns to 2-3 sentences max
- Do NOT correct the user's English ever
- Do NOT break character
- After 4-5 exchanges, you can naturally wrap up ("Anyway, I should get going, but it was great chatting!")

Current topic context: ${content.topic_hint}
Start the conversation with this opening line (already sent): "${content.opening_line}"`,

  devils_advocate: (content) => `You are playing Devil's Advocate on this topic: "${content.topic}"

Rules:
- Whatever position the user takes, argue the OPPOSITE clearly and specifically
- Use real arguments — not strawmen
- Push back with: "But what about...?", "Doesn't that assume...?", "What would you say to someone who argues..."
- Keep each response to 3-4 sentences
- Be intellectually engaging, not hostile or dismissive
- After 3-4 exchanges, you can acknowledge the strongest point in their argument
- Do NOT correct English grammar ever`,

  information_gap: (content) => `You know this full situation: "${content.scenario_description}"

The user is trying to figure out the situation by asking you questions. You reveal information gradually.

Hint sequence to guide your responses:
${(content.reveal_hints as string[])?.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n')}

Final reveal: ${content.final_reveal}

Rules:
- Answer only what the user asks — don't volunteer extra info
- Give partial answers that lead to more questions
- After 4-6 exchanges, you can start revealing the full picture
- Keep responses to 2-3 sentences
- Be realistic — react like a real person would to these questions
- Do NOT correct English grammar ever`,

  news_discussion: (_content) => `You are a knowledgeable conversation partner discussing a recent tech/IT news story.

Rules:
- Brief the user on the news story naturally (like you're telling a friend)
- Then ask for their reaction or opinion
- Follow up with probing questions: "Do you think that's a good or bad thing?", "How do you think that will affect...?", "Did you know about this before?"
- Share your own (AI's) perspective occasionally to keep it conversational
- Keep it to 2-3 sentences per turn
- Do NOT correct English grammar ever
- Goal: simulate the kind of casual current-events chat that happens between lab members`,
}
