import { createClient } from '@/lib/supabase-server.js'

// ==========================================
// 1. DASHBOARD BOOTSTRAPPING
// ==========================================

// Initialize a plain, cookie-free client specifically for this script
//const supabaseUrl = "https://rjjcadsmizcnnkmwjqtn.supabase.co"
//nst supabaseKey = "sb_publishable_Qt3Mfgby1xC_QaCuKilNeg_YuB2wOpy"

export async function getInitialDashboard() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      decks ( id, title )
    `)

  if (error) throw error
  return data
}

// ==========================================
// 2. FIND OR CREATE (Idempotent)
// ==========================================

export async function getOrCreateCategory(name) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('categories')
    .insert([{ name, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  return created
}

export async function getOrCreateDeck(categoryId, title) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('decks')
    .select('*')
    .eq('category_id', categoryId)
    .eq('title', title)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('decks')
    .insert([{ category_id: categoryId, title, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  return created
}

export async function createFlashcard(deckId, question, optionsPayload) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('cards')                        // was 'flashcards' — matches your schema
    .insert([{
      deck_id: deckId,
      user_id: user.id,
      question,
      options: optionsPayload
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// ==========================================
// 3. SPACED REPETITION ENGINE
// ==========================================

export async function getDueCards(deckId) {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]  // YYYY-MM-DD

  const { data, error } = await supabase
    .from('cards')                        // was 'flashcards'
    .select('*')
    .eq('deck_id', deckId)
    .lte('due_date', today)               // was 'next_review' — matches your schema
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

export function calculateSM2(card, quality) {
  let { repetitions, easiness_factor, interval_days } = card   // fixed field names
  const q = Math.max(0, Math.min(5, quality))

  if (q >= 3) {
    if (repetitions === 0) interval_days = 1
    else if (repetitions === 1) interval_days = 6
    else interval_days = Math.ceil(interval_days * easiness_factor)
    repetitions += 1
  } else {
    repetitions = 0
    interval_days = 1
  }

  easiness_factor = Math.max(
    1.3,
    easiness_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  )

  const nextDue = new Date()
  nextDue.setDate(nextDue.getDate() + interval_days)
  const due_date = nextDue.toISOString().split('T')[0]  // store as date not timestamp

  return { repetitions, easiness_factor, interval_days, due_date }
}

export async function submitReview(card, userScore) {
  const supabase = await createClient()

  const newData = calculateSM2(card, userScore)

  const { error } = await supabase
    .from('cards')                        // was 'flashcards'
    .update({
      repetitions: newData.repetitions,
      easiness_factor: newData.easiness_factor,   // fixed field name
      interval_days: newData.interval_days,       // fixed field name
      due_date: newData.due_date                  // fixed field name
    })
    .eq('id', card.id)

  if (error) throw error
  return true
}

export async function getCardsByDeckId(deckId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .eq('user_id', user.id)
    .order('id', { ascending: true })

  if (error) throw error
  return data
}

export async function processUploadedPdf(file) {
  // Check file type and throw an error if invalid
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please upload a PDF file only.');
  }

  try {
    // Ensure a default category exists
    //const categoryRes = await ensureDefaultCategory();
    //if (categoryRes.status === 401) {
    //  throw new Error('Unauthorized: Please log in again.');
    //}

    // Generate the quiz
    const uploadRes = await generateQuizFromPDF(file);
    if (uploadRes.status === 401) {
      throw new Error('Unauthorized: Please log in again.');
    }
    
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error('Failed to generate quiz from PDF.');
    }

    // Fetch the resulting cards
    await fetchCards(uploadData.deck_id);
    
  } catch (err) {
    // If it's already one of our custom errors above, re-throw it.
    // Otherwise, throw a generic fallback error.
    throw new Error(err.message || 'Something went wrong. Please try again.');
  }
}
