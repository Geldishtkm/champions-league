import React, { useState } from 'react';

function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        setMessage('Registration successful! You can now log in.');
        setUsername('');
        setPassword('');
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        const error = await response.text();
        setMessage('Registration failed: ' + error);
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: 520,
      width: '100%',
      margin: '40px auto',
      padding: 28,
      borderRadius: 22,
      background: 'linear-gradient(135deg, rgba(40,20,70,0.93) 80%, rgba(246,226,122,0.10) 100%)',
      boxShadow: '0 8px 40px 0 #2a084555, 0 2px 16px 0 #fff2',
      position: 'relative',
      overflow: 'hidden',
      animation: 'slideUp 1s cubic-bezier(.77,0,.18,1)',
      backdropFilter: 'blur(18px)',
    }}>
      {/* Soft gold radial overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(230,196,99,0.10) 0%, transparent 70%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      {/* Trophy accent */}
      <div style={{ position: 'absolute', top: -56, left: '50%', transform: 'translateX(-50%)', zIndex: 3, pointerEvents: 'none' }}>
        <span style={{ fontSize: 40, color: '#e6c463', filter: 'drop-shadow(0 0 8px #e6c46388)' }}>🏆</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 3 }}>
        <div style={{
          width: '100px',
          height: '64px',
          background: 'linear-gradient(135deg, #6441a5 0%, #f6e27a 100%)',
          borderRadius: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          boxShadow: '0 4px 18px #e6c46355',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 36, color: '#e6c463', textShadow: '0 2px 8px #2a0845' }}>⚽</span>
        </div>
        <h2 style={{
          fontWeight: 900,
          color: '#fff',
          margin: 0,
          fontSize: 32,
          letterSpacing: 2,
          textShadow: '0 2px 8px #e6c463',
        }}>
          Register
        </h2>
        <div style={{
          color: '#e6c463',
          fontSize: 16,
          marginTop: 8,
          marginBottom: 0,
          fontWeight: 600,
          textShadow: '0 2px 8px #2a0845',
        }}>
          Create your Champions League account
        </div>
        <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, #e6c463 0%, transparent 100%)', margin: '18px 0 0 0', borderRadius: 2 }} />
      </div>
      <form onSubmit={handleRegister} style={{ marginTop: 24, position: 'relative', zIndex: 3 }}>
        {message && (
          <div style={{
            marginBottom: 16,
            color: '#e6c463',
            background: 'rgba(230,196,99,0.10)',
            border: '1.2px solid #e6c463',
            borderRadius: 9,
            padding: '10px 16px',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 15,
            textShadow: '0 2px 8px #2a0845',
            animation: message.startsWith('Registration successful') ? 'pulse 1s' : 'shake 0.5s',
          }}>
            {message}
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8,
            fontSize: 15,
            letterSpacing: 1,
            textShadow: '0 2px 8px #e6c463',
          }}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '13px 18px',
              borderRadius: 12,
              border: '2.5px solid #7c6ee6',
              fontSize: 16,
              background: 'rgba(255,255,255,0.13)',
              color: '#fff',
              outline: 'none',
              fontWeight: 600,
              boxShadow: '0 1px 4px #e6c46322',
              transition: 'all 0.2s',
              letterSpacing: 1,
            }}
            onFocus={e => e.target.style.border = '2.5px solid #fff'}
            onBlur={e => e.target.style.border = '2.5px solid #7c6ee6'}
            autoComplete="username"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8,
            fontSize: 15,
            letterSpacing: 1,
            textShadow: '0 2px 8px #e6c463',
          }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '13px 18px',
              borderRadius: 12,
              border: '2.5px solid #7c6ee6',
              fontSize: 16,
              background: 'rgba(255,255,255,0.13)',
              color: '#fff',
              outline: 'none',
              fontWeight: 600,
              boxShadow: '0 1px 4px #e6c46322',
              transition: 'all 0.2s',
              letterSpacing: 1,
            }}
            onFocus={e => e.target.style.border = '2.5px solid #fff'}
            onBlur={e => e.target.style.border = '2.5px solid #7c6ee6'}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px 0',
            background: 'linear-gradient(90deg, #6441a5 0%, #2a0845 100%)',
            color: '#fff',
            border: '2.5px solid #7c6ee6',
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 18px #e6c46355',
            marginTop: 8,
            transition: 'all 0.2s',
            letterSpacing: 2,
            textShadow: '0 2px 8px #e6c463',
          }}
          onMouseOver={e => {
            e.target.style.background = 'linear-gradient(90deg, #2a0845 0%, #6441a5 100%)';
            e.target.style.color = '#e6c463';
            e.target.style.transform = 'translateY(-2px) scale(1.03)';
            e.target.style.boxShadow = '0 8px 32px #e6c46344';
          }}
          onMouseOut={e => {
            e.target.style.background = 'linear-gradient(90deg, #6441a5 0%, #2a0845 100%)';
            e.target.style.color = '#fff';
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 18px #e6c46355';
          }}
        >
          Register
        </button>
        <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, transparent 0%, #e6c463 100%)', margin: '18px 0 0 0', borderRadius: 2 }} />
      </form>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default Register; 