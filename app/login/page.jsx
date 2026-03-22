'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { signInWithGoogle, signInWithEmail } from '@/lib/api'
import CogQuizLogo from '@/components/CogQuizLogo'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const [showPassword, setShowPassword] = useState(false)  // ← add this

  const handleLogin = async () => {
  setLoading(true)
  try {
    await signInWithEmail(email, password)
    window.location.href = '/dashboard'
  } catch (e) {
    alert(e.message)
  } finally {
    setLoading(false)
  }
}

  const handleGoogleLogin = async () => {
  await signInWithGoogle()
}

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f0e8',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      color: '#3d2b1f',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      {/* ── WAVY BACKGROUND ── */}
<div style={{
  position: 'fixed', inset: 0,
  pointerEvents: 'none', zIndex: 0,
  overflow: 'hidden'
}}>
  {/* blobs */}
  <div style={{
    position: 'absolute', top: '-150px', left: '-120px',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(180,130,90,0.22) 0%, transparent 60%)',
    animation: 'floatSlow1 18s ease-in-out infinite'
  }}/>
  <div style={{
    position: 'absolute', top: '-80px', right: '-100px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(210,185,150,0.24) 0%, transparent 60%)',
    animation: 'floatSlow2 22s ease-in-out infinite'
  }}/>
  <div style={{
    position: 'absolute', bottom: '-120px', left: '25%',
    width: '550px', height: '450px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(160,110,70,0.20) 0%, transparent 60%)',
    animation: 'floatSlow3 26s ease-in-out infinite'
  }}/>
  {/* wavy SVG pattern */}
  <svg style={{
    position: 'absolute', bottom: 0, left: 0,
    width: '100%', opacity: 0.15
  }} viewBox="0 0 1440 320" preserveAspectRatio="none">
    <path fill="#6B4226" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,90.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
  </svg>
  <svg style={{
    position: 'absolute', bottom: 0, left: 0,
    width: '100%', opacity: 0.08
  }} viewBox="0 0 1440 320" preserveAspectRatio="none">
    <path fill="#6B4226" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
  </svg>
  {/* breathing glow */}
  <div style={{
    position: 'absolute', inset: 0,
    background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.25), transparent 70%)',
    animation: 'breathe 10s ease-in-out infinite'
  }}/>
</div>
      {/* Logo + Title */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '32px',
        animation: 'fadeDown 0.5s ease',
        position: 'relative',
        zIndex: 1,
      }}>
<CogQuizLogo size={90} />
<h1 style={{
  fontSize: '2rem',
  fontWeight: '700',
  margin: '8px 0 6px 0',
  letterSpacing: '-0.5px',
  color: '#3d2b1f'
}}>
  CogQuiz
</h1>
<p style={{ 
  color: '#8a6a50', 
  margin: 0, 
  fontSize: '14px',
  letterSpacing: '0.3px'
}}>
  Turn your lectures into quizzes
</p>
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: '#fffdf7',
        border: '1px solid #e8ddd0',
        borderRadius: '20px',
        padding: '36px',
        width: '100%',
        maxWidth: '380px',
        boxSizing: 'border-box',
        boxShadow: '0 4px 24px rgba(101, 72, 42, 0.08)',
        animation: 'fadeUp 0.5s ease'
      }}>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#f5f0e8',
            color: '#3d2b1f',
            border: '1px solid #d4c4b0',
            borderRadius: '10px',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '24px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#8B5E3C'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#d4c4b0'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d5c8' }} />
          <span style={{ color: '#b09880', fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d5c8' }} />
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontSize: '13px',
            color: '#8a6a50',
            display: 'block',
            marginBottom: '6px',
            fontWeight: '500'
          }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: `1px solid ${focused === 'email' ? '#8B5E3C' : '#d4c4b0'}`,
              backgroundColor: '#f5f0e8',
              color: '#3d2b1f',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
              boxShadow: focused === 'email' ? '0 0 0 3px rgba(139,94,60,0.12)' : 'none'
            }}
          />
        </div>

        {/* Password Input */}
<div style={{ marginBottom: '24px' }}>
  <label style={{
    fontSize: '13px',
    color: '#8a6a50',
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500'
  }}>
    Password
  </label>
  <div style={{ position: 'relative' }}>
    <input
      type={showPassword ? 'text' : 'password'}
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      onFocus={() => setFocused('password')}
      onBlur={() => setFocused('')}
      style={{
        width: '100%',
        padding: '12px 44px 12px 14px',
        borderRadius: '10px',
        border: `1px solid ${focused === 'password' ? '#8B5E3C' : '#d4c4b0'}`,
        backgroundColor: '#f5f0e8',
        color: '#3d2b1f',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        boxShadow: focused === 'password' ? '0 0 0 3px rgba(139,94,60,0.12)' : 'none'
      }}
    />
    <button
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#8a6a50',
        fontSize: '16px',
        padding: '0',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {showPassword ? '🙈' : '👁️'}
    </button>
  </div>
</div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            backgroundColor: '#6B4226',
            color: '#fff8f0',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(107,66,38,0.3)'
          }}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.backgroundColor = '#8B5E3C' }}
          onMouseLeave={e => { if(!loading) e.currentTarget.style.backgroundColor = '#6B4226' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Signup Link */}
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          color: '#a08060',
          fontSize: '14px',
          margin: '20px 0 0 0'
        }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{
            color: '#6B4226',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Sign up
          </a>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        input::placeholder {
          color: #b09880;
       }
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear,
          input[type="search"]::-webkit-search-decoration,
          input[type="search"]::-webkit-search-cancel-button {
          display: none;

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
      `}</style>
    </div>
  )
}