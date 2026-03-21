import { createClient } from '@supabase/supabase-js';

// Initialize a plain, cookie-free client specifically for this script
const supabaseUrl = 'Your url'
const supabaseKey = "Your key" 

const supabase = createClient(supabaseUrl, supabaseKey);
// ==========================================
// 1. DASHBOARD BOOTSTRAPPING
// ==========================================

/**
 * Runs immediately when the app loads.
 * WHY: Solves the "chicken and egg" problem. It fetches the entire structure 
 * (Categories and decks_flashcard) in a single network request so the frontend has all the IDs.
 */
export async function getInitialDashboard() {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            id, 
            name, 
            decks_flashcard( id, title )
        `);

    if (error) throw error;
    return data;
}

// ==========================================
// 2. IDEMPOTENT GENERATION (Find-or-Create)
// ==========================================

/**
 * WHY: If you run your setup script twice, it shouldn't crash or create duplicates.
 * .maybeSingle() elegantly checks for existence before attempting an insert.
 */
export async function getOrCreateCategory(name) {
    const { data: existing } = await supabase.from('categories').select('*').eq('name', name).maybeSingle();
    if (existing) return existing;

    const { data: created, error } = await supabase.from('categories').insert([{ name }]).select().single();
    if (error) throw error;
    return created;
}

export async function getOrCreateDeck(categoryId, title) {
    const { data: existing } = await supabase.from('decks_flashcard')
        .select('*').eq('category_id', categoryId).eq('title', title).maybeSingle();
    if (existing) return existing;

    const { data: created, error } = await supabase.from('decks_flashcard')
        .insert([{ category_id: categoryId, title }]).select().single();
    if (error) throw error;
    return created;
}

/**
 * Creates a flashcard with your specific JSONB option structure.
 */
export async function createFlashcard(deckId, question, optionsPayload) {
    const { data, error } = await supabase.from('flashcards')
        .insert([{ deck_id: deckId, question: question, options: optionsPayload }])
        .select().single();
    
    if (error) throw error;
    return data;
}

// ==========================================
// 3. STUDY TIME (Spaced Repetition Engine)
// ==========================================

/**
 * Fetches the daily study queue.
 * WHY: We don't update statuses overnight. We just ask the database to give us 
 * any card whose 'next_review' timestamp is in the past. Time naturally reveals the cards.
 */
export async function getDueCards(deckId) {
    const rightNow = new Date().toISOString(); 

    const { data, error } = await supabase.from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .lte('next_review', rightNow) // Less than or equal to RIGHT NOW
        .order('next_review', { ascending: true }); 

    if (error) throw error;
    return data;
}

/**
 * The pure math SM-2 Engine.
 */
export function calculateSM2(card, quality) {
    let { repetitions, easiness, interval } = card;
    const q = Math.max(0, Math.min(5, quality)); 

    if (q >= 3) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.ceil(interval * easiness);
        repetitions += 1;
    } else {
        repetitions = 0;
        interval = 1; 
    }

    easiness = Math.max(1.3, easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return { repetitions, easiness, interval, nextReview: nextReviewDate.toISOString() };
}

/**
 * User answers a card, we calculate the math, and save it back to Supabase.
 */
export async function submitReview(card, userScore) {
    const newSm2Data = calculateSM2(card, userScore);

    const { error } = await supabase.from('flashcards')
        .update({
            repetitions: newSm2Data.repetitions,
            easiness: newSm2Data.easiness,
            interval: newSm2Data.interval,
            next_review: newSm2Data.nextReview
        })
        .eq('id', card.id);

    if (error) throw error;
    return true; 
}
