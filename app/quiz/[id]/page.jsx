'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'


// I want this inside the 



const FAKE_CARDS = [
  {
    id: 1,
    question: "What is the powerhouse of the cell?",
    options: { A: "Nucleus", B: "Mitochondria", C: "Ribosome", D: "Golgi body" },
    answer: "B",
    explanation: "Mitochondria produce ATP energy for the cell."
  },
  {
    id: 2,
    question: "What does DNA stand for?",
    options: { A: "Deoxyribonucleic Acid", B: "Dynamic Nuclear Array", C: "Dense Neutron Atom", D: "None of these" },
    answer: "A",
    explanation: "DNA carries genetic information in all living organisms."
  },
  {
    id: 3,
    question: "What is Newton's First Law?",
    options: { A: "F = ma", B: "Every action has reaction", C: "Objects stay at rest unless acted upon", D: "Energy is conserved" },
    answer: "C",
    explanation: "Newton's First Law is the law of inertia."
  }
]

export default function QuizPage({ params }) {

  // TODO: replace with real endpoint when Brizein is ready
  // const cards == await getCardsByDeck(deckId)
  const resolvedParams = use(params)
  const deckId = resolvedParams.id //deck id

  const router = useRouter()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    /**
     * @function loadCards
     * @description Fetches cards for the current deck from the database.
     * Normalized data ensures compatibility between the database format 
     * (arrays/numbers) and our UI format (objects/keys).
     * Brizein: This replaces the FAKE_CARDS once the upload integration is stable.
     */
    const loadCards = async () => {
      if (!deckId) return
      
      try {
        const res = await fetch(`/api/decks/${deckId}/cards`)
        const data = await res.json()

        if (data.success && data.cards && data.cards.length > 0) {
          // Normalize DB data to match our JSON UI format (Options as {A: "...", B: "..."})
          const normalized = data.cards.map(c => ({
            ...c,
            options: Array.isArray(c.options) 
              ? c.options.reduce((acc, opt, i) => { 
                  acc[String.fromCharCode(65 + i)] = opt; 
                  return acc; 
                }, {}) 
              : c.options,
            answer: typeof c.answer === 'number' 
              ? String.fromCharCode(65 + c.answer) 
              : c.answer
          }))
          setCards(normalized)
        } else {
          setCards(FAKE_CARDS)
        }
      } catch (err) {
        setCards(FAKE_CARDS)
      }
      setLoading(false)
    }
    loadCards()
  }, [deckId])

  const handleAnswer = (option) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)
    if (option === cards[current].answer) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (current + 1 >= cards.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const getOptionStyle = (option) => {
    const base = {
      width: '100%',
      padding: '14px 16px',
      margin: '8px 0',
      borderRadius: '10px',
      border: '1px solid #d4c4b0',
      backgroundColor: '#f5f0e8',
      color: '#3d2b1f',
      fontSize: '15px',
      textAlign: 'left',
      cursor: answered ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: "'Inter', sans-serif"
    }

    if (!answered) return base

    if (option === cards[current].answer) {
      return {
        ...base, backgroundColor: '#d4edda',
        border: '1px solid #82c98a', color: '#2d6a35'
      }
    }
    if (option === selected && option !== cards[current].answer) {
      return {
        ...base, backgroundColor: '#fde8e8',
        border: '1px solid #e88282', color: '#8b2020'
      }
    }
    return { ...base, opacity: 0.5 }
  }

  // Loading state
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      backgroundColor: '#f5f0e8', color: '#6B4226',
      fontFamily: "'Inter', sans-serif"
    }}>
      Loading your quiz...
    </div>
  )

  // Empty state
  if (cards.length === 0) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', backgroundColor: '#f5f0e8',
      fontFamily: "'Inter', sans-serif", color: '#3d2b1f'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
      <h2 style={{ margin: '0 0 8px' }}>No cards due today!</h2>
      <p style={{ color: '#8a6a50' }}>Upload a lecture to get started.</p>
      <button
        onClick={() => router.push('/upload')}
        style={{
          marginTop: '20px', padding: '12px 32px',
          backgroundColor: '#6B4226', color: 'white',
          border: 'none', borderRadius: '10px',
          fontSize: '15px', cursor: 'pointer'
        }}>
        Upload PDF
      </button>
    </div>
  )

  // Finished state
  if (finished) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#f5f0e8',
      fontFamily: "'Inter', sans-serif", color: '#3d2b1f',
      padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>
        {score === cards.length ? '🏆' : score >= cards.length / 2 ? '👍' : '📖'}
      </div>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px' }}>Quiz Complete!</h1>
      <p style={{ color: '#8a6a50', marginBottom: '32px' }}>
        You got {score} out of {cards.length} correct
      </p>

      <div style={{
        width: '100%', maxWidth: '380px',
        backgroundColor: '#fffdf7', border: '1px solid #e8ddd0',
        borderRadius: '16px', padding: '24px',
        boxSizing: 'border-box', textAlign: 'center'
      }}>
        <div style={{
          fontSize: '3rem', fontWeight: '700',
          color: '#6B4226', marginBottom: '4px'
        }}>
          {Math.round((score / cards.length) * 100)}%
        </div>
        <p style={{ color: '#8a6a50', margin: '0 0 24px' }}>
          {score === cards.length ? 'Perfect score! Outstanding!' :
            score >= cards.length / 2 ? 'Good job! Keep studying!' :
              'Keep practicing, you\'ll get there!'}
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%', padding: '13px',
            backgroundColor: '#6B4226', color: 'white',
            border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '600',
            cursor: 'pointer', marginBottom: '10px'
          }}>
          View Dashboard
        </button>
        <button
          onClick={() => {
            setCurrent(0); setSelected(null)
            setAnswered(false); setScore(0); setFinished(false)
          }}
          style={{
            width: '100%', padding: '13px',
            backgroundColor: 'transparent', color: '#6B4226',
            border: '1px solid #6B4226', borderRadius: '10px',
            fontSize: '15px', fontWeight: '600', cursor: 'pointer'
          }}>
          Retry Quiz
        </button>
      </div>
    </div>
  )

  const card = cards[current]

  // Main quiz screen
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f5f0e8',
      fontFamily: "'Inter', sans-serif", padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>

        {/* Progress bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#8a6a50', fontSize: '13px' }}>
              Question {current + 1} of {cards.length}
            </span>
            <span style={{ color: '#8a6a50', fontSize: '13px' }}>
              Score: {score}
            </span>
          </div>
          <div style={{
            height: '6px', backgroundColor: '#e0d5c8',
            borderRadius: '99px', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${((current + 1) / cards.length) * 100}%`,
              backgroundColor: '#6B4226',
              borderRadius: '99px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{
          backgroundColor: '#fffdf7',
          border: '1px solid #e8ddd0', borderRadius: '16px',
          padding: '28px', marginBottom: '16px',
          boxShadow: '0 4px 24px rgba(101,72,42,0.06)'
        }}>
          <p style={{
            color: '#8a6a50', fontSize: '12px',
            margin: '0 0 12px', textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Question {current + 1}
          </p>
          <h2 style={{
            color: '#3d2b1f', fontSize: '1.2rem',
            fontWeight: '600', margin: '0', lineHeight: '1.5'
          }}>
            {card.question}
          </h2>
        </div>

        {/* Options */}
        <div style={{ marginBottom: '16px' }}>
          {Object.entries(card.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              style={getOptionStyle(key)}
            >
              {key}. {value}
            </button>
          ))}
        </div>

        {/* Explanation (shows after answering) */}
        {answered && (
          <div style={{
            backgroundColor: selected === card.answer ? '#d4edda' : '#fde8e8',
            border: `1px solid ${selected === card.answer ? '#82c98a' : '#e88282'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            animation: 'fadeUp 0.3s ease'
          }}>
            <p style={{
              margin: '0 0 4px', fontWeight: '600',
              color: selected === card.answer ? '#2d6a35' : '#8b2020'
            }}>
              {selected === card.answer ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p style={{
              margin: 0, fontSize: '14px',
              color: selected === card.answer ? '#2d6a35' : '#8b2020'
            }}>
              {card.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: '#6B4226', color: 'white',
              border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', animation: 'fadeUp 0.3s ease'
            }}>
            {current + 1 >= cards.length ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}