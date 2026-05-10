import { LEAVE_BALANCE, USERS } from '../data/mockData.js'
import { formatTimestamp } from '../utils/dateUtils.js'
import { IconPlus, IconChevronRight, IconLogout } from './Icons.jsx'

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>
}

export default function Dashboard({ user, leaveRequests, onApply, onViewRequests, onViewApprovals, onLogout }) {
  const balance = LEAVE_BALANCE[user.id]
  const remaining = balance.total - balance.used
  const myRecent = leaveRequests
    .filter(r => r.employeeId === user.id)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 3)

  const pending = leaveRequests.filter(
    r => r.status === 'pending' && user.role === 'manager'
  )

  return (
    <div className="fade-in">
      <div className="page-section">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="page-title">Hello, {user.name.split(' ')[0]}</div>
            <div className="page-subtitle">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'var(--bg-dark)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, flexShrink: 0
            }}>
              {user.initials}
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                background: 'var(--bg-card)', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', width: 36, height: 36,
                borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
              }}
            >
              <IconLogout width={18} height={18} />
            </button>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="section-label">Leave Balance</div>
        <div className="balance-grid" style={{ marginBottom: 28 }}>
          <div className="balance-card accent">
            <div className="balance-number">{remaining}</div>
            <div className="balance-label">Days Remaining</div>
          </div>
          <div className="balance-card">
            <div className="balance-number">{balance.used}</div>
            <div className="balance-label">Used This Year</div>
          </div>
          <div className="balance-card">
            <div className="balance-number">{balance.total}</div>
            <div className="balance-label">Total Entitled</div>
          </div>
        </div>

        {/* Quick Action */}
        <button className="action-card" onClick={onApply}>
          <div className="action-icon">
            <IconPlus />
          </div>
          <div className="action-text">
            <div className="action-title">Apply for Leave</div>
            <div className="action-desc">Submit a new leave request</div>
          </div>
          <IconChevronRight className="action-chevron" style={{ color: 'rgba(255,255,255,0.4)', width: 18, height: 18 }} />
        </button>

        {/* Manager pending alert */}
        {user.role === 'manager' && pending.length > 0 && (
          <button onClick={onViewApprovals} style={{
            background: 'var(--amber-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            textAlign: 'left',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber)' }}>
                {pending.length} Pending Approval{pending.length > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                Review your team's requests
              </div>
            </div>
            <IconChevronRight width={18} height={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          </button>
        )}

        {/* Recent Requests */}
        {myRecent.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="section-label" style={{ margin: 0 }}>Recent Requests</div>
              <button
                style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={onViewRequests}
              >
                View All
              </button>
            </div>
            <div className="card-list">
              {myRecent.map(r => (
                <RecentCard key={r.id} request={r} />
              ))}
            </div>
          </>
        )}

        {myRecent.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 14 }}>
            No leave requests yet
          </div>
        )}
      </div>
    </div>
  )
}

function RecentCard({ request }) {
  const { leaveType, from, to, workingDays, status } = request
  const fromDate = new Date(from + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const toDate = new Date(to + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

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
        <span className="leave-date-chip">{fromDate}</span>
        <span className="leave-date-sep">→</span>
        <span className="leave-date-chip">{toDate}</span>
      </div>
    </div>
  )
}
