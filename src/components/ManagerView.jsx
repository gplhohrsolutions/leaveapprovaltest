import { useState } from 'react'
import { USERS } from '../data/mockData.js'
import { formatDate, formatTimestamp } from '../utils/dateUtils.js'
import { IconCheck, IconX } from './Icons.jsx'

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>
}

export default function ManagerView({ leaveRequests, onApprove, onReject }) {
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const pending = leaveRequests
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))

  const resolved = leaveRequests
    .filter(r => r.status !== 'pending')
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 10)

  function confirmReject() {
    if (!rejectReason.trim()) return
    onReject(rejectTarget.id, rejectReason.trim())
    setRejectTarget(null)
    setRejectReason('')
  }

  function getEmployee(id) {
    return USERS.find(u => u.id === id) || { name: 'Unknown', initials: '?', department: '' }
  }

  return (
    <div className="fade-in">
      <div className="page-section">
        <div className="page-title" style={{ marginBottom: 4 }}>Approvals</div>
        <div className="page-subtitle" style={{ marginBottom: 24 }}>
          {pending.length} pending · {resolved.length} resolved
        </div>

        {pending.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <IconCheck style={{ width: 28, height: 28 }} />
            </div>
            <div className="empty-title">All Caught Up</div>
            <div className="empty-desc">No pending leave requests to review.</div>
          </div>
        )}

        {pending.length > 0 && (
          <>
            <div className="section-label" style={{ marginBottom: 12 }}>Pending Review</div>
            <div className="card-list" style={{ marginBottom: 32 }}>
              {pending.map(r => {
                const emp = getEmployee(r.employeeId)
                return (
                  <div key={r.id} className="manager-card">
                    <div className="manager-card-header">
                      <div className="employee-avatar">{emp.initials}</div>
                      <div>
                        <div className="employee-name">{emp.name}</div>
                        <div className="employee-meta">{emp.department} · Submitted {formatTimestamp(r.submittedAt)}</div>
                      </div>
                    </div>

                    <div className="manager-card-detail">
                      <div>
                        <div className="detail-item-label">Leave Type</div>
                        <div className="detail-item-value">{r.leaveType}</div>
                      </div>
                      <div>
                        <div className="detail-item-label">Working Days</div>
                        <div className="detail-item-value">{r.workingDays} day{r.workingDays !== 1 ? 's' : ''}</div>
                      </div>
                      <div>
                        <div className="detail-item-label">From</div>
                        <div className="detail-item-value">{formatDate(r.from)}</div>
                      </div>
                      <div>
                        <div className="detail-item-label">To</div>
                        <div className="detail-item-value">{formatDate(r.to)}</div>
                      </div>
                    </div>

                    {r.reason ? (
                      <div style={{
                        fontSize: 13, color: 'var(--text-secondary)',
                        background: 'var(--bg-primary)', borderRadius: 'var(--radius-xs)',
                        padding: '10px 12px', marginBottom: 14, lineHeight: 1.5,
                      }}>
                        "{r.reason}"
                      </div>
                    ) : (
                      <div style={{ height: 0, marginBottom: 14 }} />
                    )}

                    <div className="manager-actions">
                      <button className="btn-approve" onClick={() => onApprove(r.id)}>
                        Approve
                      </button>
                      <button className="btn-reject-trigger" onClick={() => { setRejectTarget(r); setRejectReason('') }}>
                        Reject
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {resolved.length > 0 && (
          <>
            <div className="section-label" style={{ marginBottom: 12 }}>Recent Decisions</div>
            <div className="card-list">
              {resolved.map(r => {
                const emp = getEmployee(r.employeeId)
                return (
                  <div key={r.id} className="leave-card" style={{ cursor: 'default' }}>
                    <div className="leave-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--bg-dark)', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600, flexShrink: 0,
                        }}>{emp.initials}</div>
                        <div>
                          <div className="leave-card-name">{emp.name}</div>
                          <div className="leave-card-type">{r.leaveType} · {r.workingDays} day{r.workingDays !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="leave-card-dates">
                      <span className="leave-date-chip">{formatDate(r.from)}</span>
                      <span className="leave-date-sep">→</span>
                      <span className="leave-date-chip">{formatDate(r.to)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setRejectTarget(null) }}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">Reject Request</div>
            <div className="modal-subtitle">
              Provide a reason for {getEmployee(rejectTarget.employeeId).name}'s {rejectTarget.leaveType} request.
              They'll be notified and can revise it.
            </div>
            <textarea
              className="modal-textarea"
              placeholder="e.g. Critical deadline this week, please reschedule…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn-reject-confirm"
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
              >
                Reject Request
              </button>
              <button className="btn-cancel" onClick={() => setRejectTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
