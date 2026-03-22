"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CogQuizLogo from "@/components/CogQuizLogo";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [decksByCategory, setDecksByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // TODO: swap with real API when Brizein is ready
        const res = await fetch("/api/categories", { method: "POST" });
        if (!res.ok) {
        }

        const data = await res.json();
        const categories = data.category;
        setCategories(categories);

        // 3. Fetch all decks in parallel!
        const decksMap = {};

        await Promise.all(
          categories.map(async (cat) => {
            try {
              // 1. Pass the category ID in the body so the API knows what to fetch!
              const res = await fetch("/api/decks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId: cat.id }), // <-- Added this!
              });

              // 2. Parse the raw Response object into actual JSON data
              const data = await res.json();

              // Now data.success and data.decks actually exist!
              console.log(`Success for category ${cat.id}:`, data.success);

              // 3. Error checking!
              if (data.success) {
                decksMap[cat.id] = data.decks;
              } else {
                console.error(`API returned an error for category ${cat.id}`);
                decksMap[cat.id] = [];
              }
            } catch (error) {
              // 4. Catch network crashes (e.g., user loses internet)
              console.error(`Network error for category ${cat.id}:`, error);
              decksMap[cat.id] = [];
            }
          }),
        );
        console.log(decksMap);
        setDecksByCategory(decksMap);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

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
          Loading categories...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  console.log(categories);
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f0e8",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          backgroundColor: "rgba(255,253,247,0.95)",
          borderBottom: "1px solid rgba(232,221,208,0.8)",
          padding: "0 20px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CogQuizLogo size={36} />
          <span
            style={{ fontWeight: "700", color: "#3d2b1f", fontSize: "16px" }}
          >
            CogQuiz
          </span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#6B4226",
            border: "1px solid #6B4226",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          ← Dashboard
        </button>
      </nav>

      <div
        style={{ maxWidth: "560px", margin: "0 auto", padding: "28px 16px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
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
              Categories
            </h1>
            <p style={{ color: "#8a6a50", margin: 0, fontSize: "14px" }}>
              {categories.length} subjects
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d4c4b0",
              backgroundColor: "#fffdf7",
              color: "#6B4226",
              fontSize: "13px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">A → Z</option>
          </select>
        </div>

        {/* Categories List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{ animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}
            >
              {/* Category Row */}
              <div
                onClick={() =>
                  setExpandedId(expandedId === cat.id ? null : cat.id)
                }
                style={{
                  backgroundColor: "rgba(255,253,247,0.9)",
                  border: `1px solid ${expandedId === cat.id ? "#6B4226" : "rgba(232,221,208,0.9)"}`,
                  borderRadius:
                    expandedId === cat.id ? "14px 14px 0 0" : "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="category-row"
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      backgroundColor: "#f5f0e8",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    📚
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#3d2b1f",
                        margin: "0 0 3px",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      {cat.name}
                    </p>
                    <p
                      style={{ color: "#8a6a50", margin: 0, fontSize: "12px" }}
                    >
                      {decksByCategory[cat.id].length || 0}{" "}
                      {decksByCategory[cat.id].length === 1 ? "deck" : "decks"}{" "}
                      •{" "}
                      {new Date(cat.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    color: "#6B4226",
                    fontSize: "18px",
                    transition: "transform 0.2s ease",
                    transform:
                      expandedId === cat.id ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  →
                </div>
              </div>

              {/* Expanded Decks */}
              {expandedId === cat.id && (
                <div
                  style={{
                    backgroundColor: "rgba(245,240,232,0.6)",
                    border: "1px solid #6B4226",
                    borderTop: "none",
                    borderRadius: "0 0 14px 14px",
                    padding: "8px 12px 12px",
                  }}
                >
                  {decksByCategory[cat.id].length === 0 ? (
                    <p
                      style={{
                        color: "#8a6a50",
                        fontSize: "13px",
                        textAlign: "center",
                        padding: "12px 0",
                        margin: 0,
                      }}
                    >
                      No decks yet
                    </p>
                  ) : (
                    decksByCategory[cat.id].map((deck, j) => (
                      <div
                        key={deck.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                          margin: "6px 0",
                          backgroundColor: "rgba(255,253,247,0.9)",
                          borderRadius: "10px",
                          gap: "12px",
                          animation: `fadeUp 0.2s ease ${j * 0.04}s both`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div style={{ fontSize: "18px" }}>📄</div>
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                color: "#3d2b1f",
                                margin: "0 0 2px",
                                fontSize: "13px",
                                fontWeight: "600",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {deck.name}
                            </p>
                            <p
                              style={{
                                color: "#8a6a50",
                                margin: 0,
                                fontSize: "11px",
                              }}
                            >
                              {decksByCategory[cat.id].title}
                              {decksByCategory[cat.id].length} cards •{" "}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/quiz?deckId=${deck.id}`);
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#6B4226",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            transition:
                              "transform 0.15s ease, background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.backgroundColor = "#8B5E3C";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.backgroundColor = "#6B4226";
                          }}
                        >
                          Start Quiz →
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .category-row:hover {
          background-color: rgba(107,66,38,0.04) !important;
        }
      `}</style>
    </div>
  );
}
