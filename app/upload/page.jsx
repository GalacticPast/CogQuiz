"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { processUploadedPdf } from "../../lib/api"; // <--- IMPORT IT HERE

export default function UploadPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [cards, setCards] = useState([]);
  // change after pranay provides me the real auth function .
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleUpload = async (file) => {
    try {
      setError("");

      // It now returns the deck_id upon success
      // ?
      // need a bufferring sign which shows up while uploading take place 
      const newDeckId = await processUploadedPdf(file);

      // after teh file is succefully uploaded show that the file is uploaded !! 
       router.push(`/dashboard/`)
    } catch (err) {
      setError(err.message);
      // router.push('/dashboard'); // Only do this if you actually want them to leave the page on error
    }
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
        }}
      >
        Checking session...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f0e8",
        fontFamily: "'Inter', sans-serif",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1
          style={{
            color: "#3d2b1f",
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Upload Lecture
        </h1>
        <p style={{ color: "#8a6a50", marginBottom: "32px" }}>
          Drop your PDF and we&apos;ll generate a quiz instantly
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fff0f0",
              border: "1px solid #ffcccc",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "20px",
              color: "#cc4444",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
            <button
              onClick={() => setError(null)}
              style={{
                float: "right",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#cc4444",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {cards.length === 0 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleUpload(e.dataTransfer.files[0]);
            }}
            style={{
              border: `2px dashed ${dragOver ? "#6B4226" : "#d4c4b0"}`,
              borderRadius: "16px",
              padding: "60px 20px",
              textAlign: "center",
              backgroundColor: dragOver ? "#f0e8dc" : "#fffdf7",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
            <p
              style={{ color: "#6B4226", fontWeight: "600", margin: "0 0 6px" }}
            >
              {uploading
                ? "Generating your quiz..."
                : "Drag & drop your PDF here"}
            </p>
            <p style={{ color: "#b09880", fontSize: "13px", margin: 0 }}>
              {uploading
                ? "This takes about 10–15 seconds"
                : "or click to browse"}
            </p>
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </div>
        )}

        {uploading  && (
          <div
            style={{ textAlign: "center", marginTop: "24px", color: "#8a6a50" }}
          >
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
            Analyzing your PDF...
          </div>
        )}

        {cards.length > 0 && (
          <div>
            <div
              style={{
                backgroundColor: "#f0ede6",
                border: "1px solid #d4c4b0",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "24px" }}>✅</span>
              <div>
                <p style={{ margin: 0, fontWeight: "600", color: "#3d2b1f" }}>
                  Quiz ready! {cards.length} questions generated.
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#8a6a50" }}>
                  Your study cards have been saved.
                </p>
              </div>
            </div>

            {cards[0] && (
              <div
                style={{
                  backgroundColor: "#fffdf7",
                  border: "1px solid #e8ddd0",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    color: "#8a6a50",
                    fontSize: "12px",
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Preview — Question 1
                </p>
                <p
                  style={{
                    color: "#3d2b1f",
                    fontWeight: "600",
                    margin: "0 0 12px",
                  }}
                >
                  {cards[0].question}
                </p>
                {cards[0].options?.map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      margin: "4px 0",
                      backgroundColor: "#f5f0e8",
                      borderRadius: "8px",
                      color: "#6B4226",
                      fontSize: "14px",
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/quiz")}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#6B4226",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Start Quiz →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
