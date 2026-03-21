export default function CogQuizLogo({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      {/* outer ring */}
      <circle
        cx="55" cy="55" r="48"
        fill="none"
        stroke="#6B4226"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* gear teeth */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <rect
          key={i}
          x="51" y="4"
          width="8" height="10"
          rx="2"
          fill="#6B4226"
          transform={`rotate(${angle} 55 55)`}
        />
      ))}
      {/* inner circle */}
      <circle cx="55" cy="55" r="22" fill="#6B4226" />
      {/* Q letter */}
      <text
        x="55" y="63"
        textAnchor="middle"
        fill="#f5f0e8"
        fontSize="26"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        Q
      </text>
    </svg>
  )
}