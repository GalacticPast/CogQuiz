"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData, getDueCards, getSession } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  // do we require a setCategory function here?
  const [categories, setCategories] = useState([]);
  const [dueCards, setDueCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (!session) {
          router.push("/login");
          return Promise.resolve();
        }

        return Promise.all([
          getDashboardData().then((data) => {
            if (active) setCategories(Array.isArray(data) ? data : []);
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
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "easy") return { bg: "#d4edda", text: "#2d6a35" };
    if (difficulty === "medium") return { bg: "#fff3cd", text: "#856404" };
    return { bg: "#fde8e8", text: "#8b2020" };
  };

  if (authLoading)
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
        Checking session...
      </div>
    );

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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f0e8",
        fontFamily: "'Inter', sans-serif",
        padding: "32px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                color: "#3d2b1f",
                fontSize: "1.8rem",
                fontWeight: "700",
                margin: "0 0 4px",
              }}
            >
              Dashboard
            </h1>
            <p style={{ color: "#8a6a50", margin: 0, fontSize: "14px" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => router.push("/upload")}
            style={{
              padding: "10px 18px",
              backgroundColor: "#6B4226",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Upload
          </button>
        </div>

        {/* Stats Row */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            {/* Streak */}
            <div
              style={{
                backgroundColor: "#fffdf7",
                border: "1px solid #e8ddd0",
                borderRadius: "14px",
                padding: "18px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>🔥</div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#6B4226",
                  lineHeight: 1,
                }}
              >
                {stats.streak}
              </div>
              <div
                style={{ color: "#8a6a50", fontSize: "13px", marginTop: "4px" }}
              >
                Day streak
              </div>
            </div>

            {/* Accuracy */}
            <div
              style={{
                backgroundColor: "#fffdf7",
                border: "1px solid #e8ddd0",
                borderRadius: "14px",
                padding: "18px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>🎯</div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#6B4226",
                  lineHeight: 1,
                }}
              >
                {stats.accuracy}%
              </div>
              <div
                style={{ color: "#8a6a50", fontSize: "13px", marginTop: "4px" }}
              >
                Accuracy
              </div>
            </div>

            {/* Total studied */}
            <div
              style={{
                backgroundColor: "#fffdf7",
                border: "1px solid #e8ddd0",
                borderRadius: "14px",
                padding: "18px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>📚</div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#6B4226",
                  lineHeight: 1,
                }}
              >
                {stats.totalStudied}
              </div>
              <div
                style={{ color: "#8a6a50", fontSize: "13px", marginTop: "4px" }}
              >
                Cards studied
              </div>
            </div>

            {/* Decks */}
            <div
              style={{
                backgroundColor: "#fffdf7",
                border: "1px solid #e8ddd0",
                borderRadius: "14px",
                padding: "18px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>🗂️</div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#6B4226",
                  lineHeight: 1,
                }}
              >
                {stats.decks}
              </div>
              <div
                style={{ color: "#8a6a50", fontSize: "13px", marginTop: "4px" }}
              >
                Decks
              </div>
            </div>
          </div>
        )}

        {/* Due Today Section */}
        <div
          style={{
            backgroundColor: "#fffdf7",
            border: "1px solid #e8ddd0",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                color: "#3d2b1f",
                fontSize: "1.1rem",
                fontWeight: "600",
                margin: 0,
              }}
            >
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
              {dueCards.map((card) => {
                const diff = getDifficultyColor(card.difficulty);
                return (
                  <div
                    key={card.id}
                    style={{
                      padding: "14px",
                      margin: "8px 0",
                      backgroundColor: "#f5f0e8",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#3d2b1f",
                          margin: "0 0 4px",
                          fontSize: "14px",
                          fontWeight: "500",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {card.question}
                      </p>
                      <p
                        style={{
                          color: "#8a6a50",
                          margin: 0,
                          fontSize: "12px",
                        }}
                      >
                        {card.deck}
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
                onClick={() => router.push("/quiz")}
                style={{
                  width: "100%",
                  padding: "13px",
                  backgroundColor: "#6B4226",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginTop: "16px",
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
      `}</style>
    </div>
  );
}
