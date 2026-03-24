// main page
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    // After 2s start fade out
    const fadeOut = setTimeout(() => setPhase("exit"), 2000);
    // After 2.5s go to login
    const redirect = setTimeout(() => router.push("/login"), 2500);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f0e8",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "scale(1.05)" : "scale(1)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* background blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "-120px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(180,130,90,0.22) 0%, transparent 60%)",
            animation: "floatSlow1 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(210,185,150,0.24) 0%, transparent 60%)",
            animation: "floatSlow2 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "25%",
            width: "550px",
            height: "450px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(160,110,70,0.20) 0%, transparent 60%)",
            animation: "floatSlow3 26s ease-in-out infinite",
          }}
        />
      </div>

      {/* logo + name */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          position: "relative",
          zIndex: 1,
          animation: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        {/* ANIMATED SVG LOGO */}
        <svg width="110" height="110" viewBox="0 0 110 110">
          {/* outer ring */}
          <circle
            cx="55"
            cy="55"
            r="48"
            fill="none"
            stroke="#6B4226"
            strokeWidth="3"
            strokeDasharray="301"
            strokeDashoffset="301"
            strokeLinecap="round"
            style={{ animation: "drawCircle 1s ease forwards 0.2s" }}
          />
          {/* gear teeth — 8 small rects rotated */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <rect
              key={i}
              x="51"
              y="4"
              width="8"
              height="10"
              rx="2"
              fill="#6B4226"
              transform={`rotate(${angle} 55 55)`}
              style={{
                opacity: 0,
                animation: `fadeInTooth 0.2s ease forwards ${0.8 + i * 0.06}s`,
              }}
            />
          ))}
          {/* inner circle */}
          <circle
            cx="55"
            cy="55"
            r="22"
            fill="#6B4226"
            style={{
              opacity: 0,
              animation: "fadeScale 0.4s ease forwards 1s",
            }}
          />
          {/* Q letter */}
          <text
            x="55"
            y="63"
            textAnchor="middle"
            fill="#f5f0e8"
            fontSize="26"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            style={{
              opacity: 0,
              animation: "fadeScale 0.4s ease forwards 1.2s",
            }}
          >
            Q
          </text>
        </svg>

        {/* brand name */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: "800",
              color: "#3d2b1f",
              margin: "0 0 6px",
              letterSpacing: "-1px",
              opacity: 0,
              animation: "slideUp 0.5s ease forwards 1.3s",
            }}
          >
            CogQuiz
          </h1>
          <p
            style={{
              color: "#8a6a50",
              fontSize: "14px",
              margin: 0,
              opacity: 0,
              animation: "slideUp 0.5s ease forwards 1.5s",
            }}
          >
            Turn lectures into quizzes
          </p>
        </div>
      </div>

      {/* loading dots at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          display: "flex",
          gap: "8px",
          opacity: 0,
          animation: "fadeIn 0.4s ease forwards 1.6s",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#6B4226",
              animation: `dotBounce 0.8s ease-in-out infinite ${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeInTooth {
          to { opacity: 1; }
        }
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-6px); opacity: 1; }
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
