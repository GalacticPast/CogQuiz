"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData, getDueCards, getSession } from "../../lib/api";
import CogQuizLogo from "@/components/CogQuizLogo";
function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export default function DashboardPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [dueCards, setDueCards] = useState([])
  const [stats, setStats] = useState({
    streak: 0,
    accuracy: 0,
    totalStudied: 0,
    decks: 0
  })
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  // ── YOUR ORIGINAL AUTH — NOT TOUCHED ──
  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (!session) {
          router.push("/login");
          return;
        }

        // Parallel fetch for categories/decks and due cards
        return Promise.all([
          getDashboardData().then((data) => {
            if (active) {
              const cats = Array.isArray(data) ? data : [];
              setCategories(cats);
              // Simple stat calculation for now
              setStats(prev => ({
                ...prev,
                decks: cats.reduce((sum, c) => sum + (c.decks?.length || 0), 0)
              }));
            }
          }),
          getDueCards().then((data) => {
            if (active) setDueCards(Array.isArray(data) ? data : []);
          }),
        ]);
      })
      .catch(console.error)
      .finally(() => {
        if (active) {
          setAuthLoading(false);
          setLoading(false);
          setVisible(true);
        }
      });

    return () => { active = false; };
  }, [router]);

  // ── YOUR ORIGINAL FUNCTION — NOT TOUCHED ──
  const getDifficultyColor = (difficulty) => {
    if (difficulty === "easy") return { bg: "#d4edda", text: "#2d6a35" };
    if (difficulty === "medium") return { bg: "#fff3cd", text: "#856404" };
    return { bg: "#fde8e8", text: "#8b2020" };
  };

  const animatedStreak = useCountUp(stats?.streak ?? 0)
  const animatedAccuracy = useCountUp(stats?.accuracy ?? 0)
  const animatedStudied = useCountUp(stats?.totalStudied ?? 0)
  const animatedDecks = useCountUp(stats?.decks ?? 0)

  if (authLoading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      backgroundColor: '#f5f0e8', color: '#6B4226',
      fontFamily: "'Inter', sans-serif"
    }}>
      Checking session...
    </div>
  )

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f5f0e8",
          color: "#6B4226",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid #d4c4b0",
              borderTop: "3px solid #6B4226",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Loading your dashboard...
        </div>
      </div>
    );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f0e8',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    }}>

      {/* ── ENHANCED CALM ANIMATED BACKGROUND ── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-150px', left: '-120px',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,130,90,0.22) 0%, transparent 60%)',
          animation: 'floatSlow1 18s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '-80px', right: '-100px',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(210,185,150,0.24) 0%, transparent 60%)',
          animation: 'floatSlow2 22s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-120px', left: '25%',
          width: '550px', height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,110,70,0.20) 0%, transparent 60%)',
          animation: 'floatSlow3 26s ease-in-out infinite'
        }} />
        {/* breathing center glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.60), transparent 300%)',
          animation: 'breathe 10s ease-in-out infinite'
        }} />
        {/* subtle moving light sweep */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.08), transparent 60%)',
          animation: 'lightSweep 12s linear infinite'
        }} />
        {/* grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(107,66,38,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,66,38,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        {/* vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(180,140,100,0.08) 100%)'
        }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        backgroundColor: 'rgba(255,253,247,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(232,221,208,0.8)',
        padding: '0 20px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CogQuizLogo size={40} />
          <span style={{ fontWeight: '700', color: '#3d2b1f', fontSize: '16px' }}>
            CogQuiz
          </span>
        </div>
        <button
          onClick={() => router.push('/upload')}
          style={{
            padding: '8px 18px',
            backgroundColor: '#6B4226',
            color: 'white', border: 'none',
            borderRadius: '8px', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer',
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.backgroundColor = '#8B5E3C'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.backgroundColor = '#6B4226'
          }}
        >
          + Upload
        </button>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        maxWidth: '560px', margin: '0 auto',
        padding: '28px 16px',
        position: 'relative', zIndex: 1
      }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            color: '#3d2b1f', fontSize: '1.8rem',
            fontWeight: '700', margin: '0 0 4px'
          }}>
            Dashboard
          </h1>
          <p style={{ color: '#8a6a50', margin: 0, fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-US',
              { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '12px', marginBottom: '28px'
          }}>
{[
  { emoji: '🔥', value: animatedStreak, label: 'Day streak' },
  { emoji: '🎯', value: `${animatedAccuracy}%`, label: 'Accuracy' },
  { emoji: '📚', value: animatedStudied, label: 'Cards studied' },
  { emoji: '🗂️', value: animatedDecks, label: 'Category', clickable: true },
].map((stat, i) => (
  <div
    key={i}
    className={stat.clickable ? 'stat-card category-card' : 'stat-card'}
    onClick={() => stat.clickable && router.push('/categories_deck')}
    style={{
      backgroundColor: 'rgba(255,253,247,0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: stat.clickable ? '1px solid #6B4226' : '1px solid rgba(232,221,208,0.9)',
      borderRadius: '14px',
      padding: '18px',
      boxSizing: 'border-box',
      cursor: stat.clickable ? 'pointer' : 'default',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
      position: 'relative'
    }}
  >
    <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.emoji}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: '700',
      color: '#6B4226', lineHeight: 1 }}>
      {stat.value}
    </div>
    <div style={{ color: '#8a6a50', fontSize: '13px', marginTop: '4px' }}>
      {stat.label}
    </div>
    {stat.clickable && (
      <div style={{
        position: 'absolute', top: '12px', right: '12px',
        color: '#6B4226', fontSize: '14px'
      }}>
        →
      </div>
    )}
  </div>
))}
  </div>
        )}
        {/* Due Today */}
        <div style={{
          backgroundColor: 'rgba(255,253,247,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(232,221,208,0.9)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          animation: 'fadeUp 0.4s ease 0.3s both'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px'
          }}>
            <h2 style={{
              color: '#3d2b1f', fontSize: '1.1rem',
              fontWeight: '600', margin: 0
            }}>
              Due Today
            </h2>
            <span
              style={{
                backgroundColor: "#6B4226",
                color: "white",
                borderRadius: "99px",
                padding: "3px 10px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {dueCards.length} cards
            </span>
          </div>

          {dueCards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
              <p
                style={{
                  color: "#6B4226",
                  fontWeight: "600",
                  margin: "0 0 4px",
                }}
              >
                All caught up!
              </p>
              <p style={{ color: "#8a6a50", fontSize: "13px", margin: 0 }}>
                No cards due today. Upload more lectures!
              </p>
            </div>
          ) : (
            <>
              {dueCards.map((card, i) => {
                const diff = getDifficultyColor(card.difficulty)
                return (
                  <div
                    key={card.id}
                    className="card-row"
                    style={{
                      padding: '14px',
                      margin: '8px 0',
                      backgroundColor: 'rgba(245,240,232,0.8)',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      animation: `fadeUp 0.3s ease ${0.35 + i * 0.05}s both`
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: '#3d2b1f', margin: '0 0 4px',
                        fontSize: '14px', fontWeight: '500',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {card.question}
                      </p>
                      <p style={{ color: '#8a6a50', margin: 0, fontSize: '12px' }}>
                        {card.deck} • {categories.find(c => c.id === card.category_id)?.name || 'General'}
                      </p>
                    </div>
                    <span
                      style={{
                        backgroundColor: diff.bg,
                        color: diff.text,
                        borderRadius: "99px",
                        padding: "3px 10px",
                        fontSize: "12px",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {card.difficulty}
                    </span>
                  </div>
                );
              })}

              <button
                className="primary-btn"
                onClick={() => router.push('/quiz')}
                style={{
                  width: '100%', padding: '13px',
                  backgroundColor: '#6B4226', color: 'white',
                  border: 'none', borderRadius: '10px',
                  fontSize: '15px', fontWeight: '600',
                  cursor: 'pointer', marginTop: '16px',
                  transition: 'transform 0.15s ease, background-color 0.15s ease'
                }}
              >
                Start Studying ({dueCards.length} cards) →
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatSlow1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.06); }
        }
        @keyframes floatSlow3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -35px) scale(1.07); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.35; }
        }
        @keyframes lightSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .stat-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 24px rgba(107,66,38,0.12) !important;
        }
        .category-box:hover {
          transform: translateY(-4px) !important;
          background-color: #fff !important;
          box-shadow: 0 8px 20px rgba(107,66,38,0.10) !important;
          border-color: #6B4226 !important;
        }
        .card-row:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(107,66,38,0.10) !important;
        }
        .primary-btn:hover {
          transform: translateY(-2px) !important;
          background-color: #8B5E3C !important;
        }
        .primary-btn:active {
          transform: translateY(0px) !important;
        }
        .category-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 8px 24px rgba(107,66,38,0.18) !important;
        background-color: rgba(107,66,38,0.06) !important;
        }

        @media (max-width: 480px) {
          nav { padding: 0 12px !important; }
        }
      `}</style>
    </div>
  );
}
