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
    console.log('Gemini output:', JSON.stringify(quiz).substring(0, 100))

    // Ensure a profile exists to satisfy foreign key constraints on the categories table
    console.log('Syncing profile for user:', user.id)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id })
    
    if (profileError) {
      console.error('Profile sync failed:', profileError.message)
    }

    // Create a new deck for this PDF and insert generated cards
    // Sometimes Gemini 2.5 returns just an array, sometimes an object with 'category'
    const isArrayFormat = Array.isArray(quiz);
    const categoryName = (!isArrayFormat && quiz.category) ? quiz.category : 'UploadedPDF-' + file.name.substring(0, 10);
    console.log('Category name:', categoryName)

    // Use a safer find-or-create pattern. 
    // Optimization: If a category with this name exists but belongs to NO ONE or SOMEONE ELSE, 
    // and the table has a global unique constraint on 'name', we must reuse it.
    let { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .maybeSingle()

    if (catError) {
      console.error('Category select error:', catError)
      throw new Error(catError.message)
    }

    if (!category) {
      console.log('Creating new category...')
      // Try to insert. If it fails due to race condition, we catch it below.
      const { data: newCat, error: createError } = await supabase
        .from('categories')
        .insert({ user_id: user.id, name: categoryName })
        .select()
        .single()

      if (createError) {
        // If it's a duplicate key error (23505), someone just created it. Fetch it.
        if (createError.code === '23505') {
          const { data: recat } = await supabase.from('categories').select('id').eq('name', categoryName).single()
          category = recat
        } else {
          console.error('Category creation failed:', createError)
          throw new Error(`Category creation failed: ${createError.message}`)
        }
      } else {
        category = newCat
      }
    }
    console.log('Category ID:', category?.id)

    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert({ 
        user_id: user.id, 
        category_id: category.id, 
        title: file.name, 
        source_filename: file.name 
      })
      .select()
      .single()
    
    if (deckError) throw new Error(`Deck creation failed: ${deckError.message}`)

      // Map quiz questions to card records (supports legacy and current Gemini shapes).
      const questionsArray = isArrayFormat ? quiz : (quiz.questions || []);
      const cards = questionsArray.map(q => {
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
