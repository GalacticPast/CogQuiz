import { generateQuizFromPDF } from '@/lib/gemini'

// for upload 
// this can just call one function 

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
