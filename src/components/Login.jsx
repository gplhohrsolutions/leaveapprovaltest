import { useState } from 'react'
import { USERS } from '../data/mockData.js'
import { IconLogo } from './Icons.jsx'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const user = USERS.find(u => u.email === email.trim().toLowerCase() && u.password === password)
    if (user) {
      onLogin(user)
    } else {
      setError('Incorrect email or password.')
    }
  }

  function fillDemo(user) {
    setEmail(user.email)
    setPassword(user.password)
    setError('')
  }

  return (
    <div className="login-screen fade-in">
      <div className="login-logo">
        <IconLogo />
      </div>
      <div className="login-title">LeaveFlow</div>
      <div className="login-subtitle">Simple leave management for your team</div>

      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            required
          />
        </div>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 500, paddingLeft: 4 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
          Sign In
        </button>
      </form>

      <div className="login-hint">
        <div className="login-hint-title">Demo Accounts</div>
        {USERS.map(u => (
          <button
            key={u.id}
            className="login-hint-row"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '6px 0' }}
            onClick={() => fillDemo(u)}
          >
            <div>
              <div className="hint-name">{u.name}</div>
              <div className="hint-role" style={{ textTransform: 'capitalize' }}>{u.role}</div>
            </div>
            <div className="hint-cred">{u.email}</div>
          </button>
        ))}
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
          Password for all accounts: <span style={{ fontFamily: 'var(--font-mono)' }}>password</span>
        </div>
      </div>
    </div>
  )
}
