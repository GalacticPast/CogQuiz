import { generateQuizFromPDF } from '@/lib/gemini'
import { createClient } from '@/lib/supabase-server'
//
// we can delete this I think 
//
// Exception note for teammates: this route requires Supabase auth cookies.
// Terminal calls without session cookies will return 401 (Not logged in).
async function requireAuthOrThrow(supabase) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not logged in')
  }

  return user
}

// Accepts a PDF upload, generates quiz questions, stores a deck/cards, and returns deck metadata.
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check auth early to avoid running expensive Gemini generation for anonymous requests.
    const supabase = await createClient()
    const user = await requireAuthOrThrow(supabase)

    // Convert file to buffer and generate quiz questions using Gemini
    console.log("Is this even working? ")
    const buffer = Buffer.from(await file.arrayBuffer())
    const quiz = await generateQuizFromPDF(buffer)
    console.log("It might be")
    // Create a new deck for this PDF and insert generated cards
    const { data: deck } = await supabase
      .from('decks')
      .insert({ user_id: user.id, title: file.name, source_filename: file.name })
      .select()
      .single()

      // Map quiz questions to card records (supports legacy and current Gemini shapes).
      const cards = (quiz.questions || []).map(q => {
        const normalizedOptions = Array.isArray(q.options)
          ? q.options
          : [q.options?.A, q.options?.B, q.options?.C, q.options?.D].filter(Boolean)

        const normalizedAnswer = typeof q.answer === 'number'
          ? q.answer
          : ({ A: 0, B: 1, C: 2, D: 3 }[q.correct] ?? 0)

        return {
          deck_id: deck.id,
          user_id: user.id,
          question: q.question,
          options: normalizedOptions,
          answer: normalizedAnswer,
          explanation: q.explanation
        }
      })

    await supabase.from('cards').insert(cards)

    return Response.json({ success: true, deck_id: deck.id, card_count: cards.length })

  } catch (err) {
    // 1. Log the FULL error to your terminal so you can read it
    console.error("🔥 CRASH IN API ROUTE:", err); 
    
    // 2. Send the actual error message back to the browser for easier debugging
    return NextResponse.json(
      { error: err.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
