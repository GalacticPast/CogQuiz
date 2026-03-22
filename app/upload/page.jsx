"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { processUploadedPdf } from "../../lib/api";

export default function UploadPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleUpload = async (file) => {
    try {
      setError("")
      setUploading(true)
      const newDeckId = await processUploadedPdf(file)
      setUploading(false)
      router.push(`/dashboard/`)
    } catch (err) {
      setUploading(false)
      setError(err.message)
    }
  }

  if (authLoading) return (
    <div style={{ display: "flex", alignItems: "center",
      justifyContent: "center", height: "100vh",
      backgroundColor: "#f5f0e8", color: "#6B4226" }}>
      Checking session...
    </div>
  )

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f0e8",
      fontFamily: "'Inter', sans-serif",
      padding: "40px 20px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-120px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,130,90,0.22) 0%, transparent 60%)',
          animation: 'floatSlow1 18s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', top: '-80px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(210,185,150,0.24) 0%, transparent 60%)',
          animation: 'floatSlow2 22s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: '-120px', left: '25%',
          width: '550px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,110,70,0.20) 0%, transparent 60%)',
          animation: 'floatSlow3 26s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(107,66,38,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,66,38,0.03) 1px, transparent 1px)
          `, backgroundSize: '40px 40px' }}/>
      </div>

      <div style={{ maxWidth: "500px", margin: "0 auto",
        position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ color: "#3d2b1f", fontSize: "1.8rem",
            fontWeight: "700", marginBottom: "8px" }}>
            Upload Lecture
          </h1>
          <p style={{ color: "#8a6a50", margin: 0 }}>
            Drop your PDF and we&apos;ll generate a quiz instantly
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: "#fff0f0",
            border: "1px solid #ffcccc", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "20px",
            color: "#cc4444", fontSize: "14px" }}>
            ⚠️ {error}
            <button onClick={() => setError(null)}
              style={{ float: "right", background: "none",
                border: "none", cursor: "pointer", color: "#cc4444" }}>
              ✕
            </button>
          </div>
        )}

        {/* Upload Box */}
        {cards.length === 0 && !uploading && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById("fileInput").click()}
            style={{
              backgroundColor: dragOver ? "#f0e8dc" : "rgba(255,253,247,0.9)",
              border: `2px dashed ${dragOver ? "#6B4226" : "#d4c4b0"}`,
              borderRadius: "20px",
              padding: "60px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 24px rgba(101,72,42,0.06)"
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <p style={{ color: "#6B4226", fontWeight: "600",
              margin: "0 0 8px", fontSize: "16px" }}>
              Drag & drop your PDF here
            </p>
            <p style={{ color: "#b09880", fontSize: "13px", margin: 0 }}>
              or click to browse
            </p>
            <input id="fileInput" type="file" accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => handleUpload(e.target.files[0])} />
          </div>
        )}

        {/* Uploading State */}
        {uploading && (
          <div style={{
            backgroundColor: 'rgba(255,253,247,0.95)',
            border: '1px solid #e8ddd0',
            borderRadius: '20px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(101,72,42,0.08)',
            animation: 'fadeUp 0.4s ease'
          }}>
            {/* Double ring spinner with PDF icon */}
            <div style={{ position: 'relative', width: '80px',
              height: '80px', margin: '0 auto 28px' }}>
              <div style={{ position: 'absolute', inset: 0,
                borderRadius: '50%', border: '3px solid #e8ddd0' }}/>
              <div style={{ position: 'absolute', inset: 0,
                borderRadius: '50%', border: '3px solid transparent',
                borderTopColor: '#6B4226',
                animation: 'spin 0.9s linear infinite' }}/>
              <div style={{ position: 'absolute', inset: '10px',
                borderRadius: '50%', border: '2px solid transparent',
                borderTopColor: '#8B5E3C',
                animation: 'spin 1.4s linear infinite reverse' }}/>
              <div style={{ position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '26px' }}>
                📄
              </div>
            </div>

            <h2 style={{ color: '#3d2b1f', fontSize: '1.3rem',
              fontWeight: '700', margin: '0 0 10px' }}>
              Analyzing your PDF...
            </h2>
            <p style={{ color: '#8a6a50', fontSize: '14px',
              margin: '0 0 28px', lineHeight: '1.6' }}>
              Gemini AI is reading your lecture and generating quiz questions.
              This takes about 10–15 seconds.
            </p>

            {/* Bouncing dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#6B4226',
                  animation: `dotBounce 1s ease-in-out infinite ${i * 0.15}s`
                }}/>
              ))}
            </div>

            <p style={{ color: '#b09880', fontSize: '12px',
              margin: '20px 0 0', fontStyle: 'italic' }}>
              Do not close this page
            </p>
          </div>
        )}

        {/* Success State */}
        {cards.length > 0 && (
          <div>
            <div style={{ backgroundColor: "#f0ede6",
              border: "1px solid #d4c4b0", borderRadius: "12px",
              padding: "16px 20px", marginBottom: "24px",
              display: "flex", alignItems: "center", gap: "12px" }}>
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
              <div style={{ backgroundColor: "#fffdf7",
                border: "1px solid #e8ddd0", borderRadius: "12px",
                padding: "20px", marginBottom: "16px" }}>
                <p style={{ color: "#8a6a50", fontSize: "12px",
                  margin: "0 0 8px", textTransform: "uppercase",
                  letterSpacing: "0.5px" }}>
                  Preview — Question 1
                </p>
                <p style={{ color: "#3d2b1f", fontWeight: "600",
                  margin: "0 0 12px" }}>
                  {cards[0].question}
                </p>
                {cards[0].options?.map((opt, i) => (
                  <div key={i} style={{ padding: "8px 12px", margin: "4px 0",
                    backgroundColor: "#f5f0e8", borderRadius: "8px",
                    color: "#6B4226", fontSize: "14px" }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => router.push("/quiz")}
              style={{ width: "100%", padding: "14px",
                backgroundColor: "#6B4226", color: "white",
                border: "none", borderRadius: "10px",
                fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
              Start Quiz →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
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
      `}</style>
    </div>
  );
}