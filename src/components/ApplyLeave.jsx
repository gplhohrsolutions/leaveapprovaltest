import { useState, useEffect } from 'react'
import { LEAVE_TYPES, LEAVE_BALANCE } from '../data/mockData.js'
import { getWorkingDays, todayISO } from '../utils/dateUtils.js'
import { IconChevronLeft, IconCheck, IconX } from './Icons.jsx'

export default function ApplyLeave({ user, onBack, onSubmit, prefill }) {
  const [leaveType, setLeaveType] = useState(prefill?.leaveType || LEAVE_TYPES[0])
  const [from, setFrom] = useState(prefill?.from || '')
  const [to, setTo] = useState(prefill?.to || '')
  const [reason, setReason] = useState(prefill?.reason || '')
  const [submitted, setSubmitted] = useState(false)

  const today = todayISO()
  const workingDays = getWorkingDays(from, to)
  const balance = LEAVE_BALANCE[user.id]
  const remaining = balance.total - balance.used

  const isValid = from && to && to >= from && workingDays > 0 && workingDays <= remaining

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    onSubmit({ leaveType, from, to, workingDays, reason })
    setSubmitted(true)
    setTimeout(() => {
      onBack()
    }, 1400)
  }

  if (submitted) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 16,
        padding: 40, textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--green-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <IconCheck style={{ width: 32, height: 32, color: 'var(--green)' }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Request Submitted</div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your leave request has been sent to your manager for approval.
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="nav-header">
        <button className="nav-header-back" onClick={onBack}>
          <IconChevronLeft style={{ width: 20, height: 20 }} />
        </button>
        <span className="nav-header-title">
          {prefill ? 'Revise Request' : 'Apply for Leave'}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          {/* Leave Type */}
          <div className="section-label">Request Details</div>
          <div className="form-card">
            <div className="form-row">
              <label className="form-row-label">Leave Type</label>
              <select
                className="form-row-input"
                value={leaveType}
                onChange={e => setLeaveType(e.target.value)}
              >
                {LEAVE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-row-label">From</label>
              <input
                type="date"
                className="form-row-input"
                value={from}
                min={today}
                onChange={e => {
                  setFrom(e.target.value)
                  if (to && e.target.value > to) setTo('')
                }}
                required
              />
            </div>

            <div className="form-row">
              <label className="form-row-label">To</label>
              <input
                type="date"
                className="form-row-input"
                value={to}
                min={from || today}
                onChange={e => setTo(e.target.value)}
                required
              />
            </div>

            <div className="form-row" style={{ borderBottom: 'none' }}>
              <label className="form-row-label">Reason (Optional)</label>
              <textarea
                className="form-row-input"
                placeholder="e.g. Family event, medical appointment…"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={2}
                style={{ resize: 'none', lineHeight: 1.5, paddingTop: 2 }}
              />
            </div>
          </div>

          {/* Validation Bar */}
          {from && to && (
            <div className="validation-bar">
              <div>
                <div className="validation-days">
                  {workingDays} working day{workingDays !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {remaining} days remaining
                </div>
              </div>
              {workingDays === 0 ? (
                <div className="validation-status invalid">
                  <IconX />
                  Dates invalid
                </div>
              ) : workingDays > remaining ? (
                <div className="validation-status invalid">
                  <IconX />
                  Exceeds balance
                </div>
              ) : (
                <div className="validation-status valid">
                  <IconCheck />
                  Valid
                </div>
              )}
            </div>
          )}

          {/* Balance Info */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', boxShadow: 'var(--shadow-sm)',
            display: 'flex', gap: 24,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Total</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{balance.total}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Used</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{balance.used}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Remaining</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: remaining < 5 ? 'var(--red)' : 'var(--text-primary)' }}>{remaining}</div>
            </div>
          </div>

          <div className="form-submit-area">
            <button
              type="submit"
              className="btn-primary"
              disabled={!isValid}
            >
              {prefill ? 'Resubmit Request' : 'Submit Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
