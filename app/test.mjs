import { 
    getOrCreateCategory, 
    getOrCreateDeck, 
    getInitialDashboard,
    getDueCards, 
    submitReview,
    createFlashcard, 
    calculateSM2 
} from './core.js';

async function runApplication() {
    console.log("Testing");
    // 1. Build the Database (Idempotent)
    const category = await getOrCreateCategory("Computer Science");
    const deck = await getOrCreateDeck(category.id, "Data Structures");
    
    // Create a card (Notice the specific JSON structure you requested)
    await createFlashcard(deck.id, "What is a Stack?", {
        A: { text: "FIFO", isCorrect: false, feedback: "Wrong. That's a Queue." },
        B: { text: "LIFO", isCorrect: true, feedback: "Correct! Last In, First Out." },
        C: { text: "Tree", isCorrect: false, feedback: "Wrong. A stack is linear." },
        D: { text: "Graph", isCorrect: false, feedback: "Wrong." }
    });

    // 2. The App Loads
    const dashboard = await getInitialDashboard();
    console.log("Categories loaded on screen:", dashboard.length);

    // 3. User clicks "Data Structures" to study
    const dueCards = await getDueCards(deck.id);
    
    if (dueCards.length > 0) {
        const currentCard = dueCards[0];
        console.log("Studying:", currentCard.question);
        
        // 4. User answers the question and scores a '4'
        await submitReview(currentCard, 4);
        console.log("Card updated and pushed into the future!");
    } else {
        console.log("No cards due right now. You are all caught up!");
    }
}

console.log("Testing...");

console.log("Testing...");

runApplication().catch((error) => {
    console.error("🚨 Fatal Error Caught!");
    // Target the specific properties that JSON.stringify ignores
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    
    // console.dir forces Node.js to show the raw object structure
    console.dir(error, { depth: null }); 
});
