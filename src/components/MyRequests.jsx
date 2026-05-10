import { formatDate, formatTimestamp } from '../utils/dateUtils.js'

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>
}

export default function MyRequests({ user, leaveRequests, onRevise }) {
  const myRequests = leaveRequests
    .filter(r => r.employeeId === user.id)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  if (myRequests.length === 0) {
    return (
      <div className="fade-in">
        <div className="page-section">
          <div className="page-title" style={{ marginBottom: 24 }}>My Leaves</div>
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
            <div className="empty-title">No Requests Yet</div>
            <div className="empty-desc">Your leave requests will appear here once you apply.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-section">
        <div className="page-title" style={{ marginBottom: 4 }}>My Leaves</div>
        <div className="page-subtitle" style={{ marginBottom: 24 }}>{myRequests.length} request{myRequests.length !== 1 ? 's' : ''}</div>

        <div className="card-list">
          {myRequests.map(r => (
            <RequestCard key={r.id} request={r} onRevise={onRevise} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RequestCard({ request, onRevise }) {
  const { leaveType, from, to, workingDays, status, reason, managerComment, history } = request
  const fromFmt = formatDate(from)
  const toFmt = formatDate(to)

  return (
    <div className="leave-card" style={{ cursor: 'default' }}>
      <div className="leave-card-header">
        <div>
          <div className="leave-card-name">{leaveType}</div>
          <div className="leave-card-type">{workingDays} working day{workingDays !== 1 ? 's' : ''}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="leave-card-dates">
        <span className="leave-date-chip">{fromFmt}</span>
        <span className="leave-date-sep">→</span>
        <span className="leave-date-chip">{toFmt}</span>
      </div>

      {reason ? (
        <div className="leave-card-reason">"{reason}"</div>
      ) : null}

      {status === 'approved' && managerComment && (
        <div style={{
          marginTop: 10, background: 'var(--green-bg)', borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>
            Manager Note
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{managerComment}</div>
        </div>
      )}

      {status === 'rejected' && (
        <>
          <div className="rejection-note">
            <div className="rejection-note-label">Rejection Reason</div>
            <div className="rejection-note-text">{managerComment || 'No reason provided.'}</div>
          </div>
          <button className="btn-revise" onClick={() => onRevise(request)}>
            Revise &amp; Resubmit
          </button>
        </>
      )}

      {history && history.length > 0 && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid var(--separator)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 8 }}>
            History
          </div>
          {history.map((h, i) => (
            <div key={i} className="audit-item">
              <div className={`audit-dot ${h.dot}`} />
              <div>
                <div className="audit-action">{h.action}</div>
                <div className="audit-time">{formatTimestamp(h.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
