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
    console.log('Generating quiz from PDF...')
    const buffer = Buffer.from(await file.arrayBuffer())
    const quiz = await generateQuizFromPDF(buffer)
    console.log('Quiz generated successfully:', quiz.category)

    // Ensure a profile exists to satisfy foreign key constraints on the categories table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id }) // Basic upsert to ensure the row exists
    
    if (profileError) {
      console.warn('Profile sync skipped or failed (might already exist):', profileError.message)
    }

    // Create a new deck for this PDF and insert generated cards
    const categoryName = quiz.category || 'Uploaded'

    // Use a safer find-or-create pattern instead of assumed upsert constraints
    let { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', categoryName)
      .maybeSingle()

    if (catError) throw new Error(catError.message)

    if (!category) {
      console.log('Creating new category for user:', user.id)
      const { data: newCat, error: createError } = await supabase
        .from('categories')
        .insert({ user_id: user.id, name: categoryName })
        .select()
        .single()

      if (createError) {
        console.error('Category creation failed:', createError)
        throw new Error(`Category creation failed: ${createError.message} (User: ${user.id})`)
      }
      category = newCat
    }

    const { data: deck } = await supabase
      .from('decks')
      .insert({ user_id: user.id, category_id: category.id, title: file.name, source_filename: file.name })
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
    return Response.json(
      { error: err.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}
