import { IconHome, IconCalendar, IconList, IconInbox, IconLogout, IconLogo } from './Icons.jsx'

const tabs = (role) => [
  { id: 'dashboard', label: 'Home', Icon: IconHome },
  { id: 'apply', label: 'Apply', Icon: IconCalendar },
  { id: 'requests', label: 'My Leaves', Icon: IconList },
  ...(role === 'manager' ? [{ id: 'manager', label: 'Approvals', Icon: IconInbox }] : []),
]

export function TabBar({ activeTab, onTabChange, user, pendingCount }) {
  return (
    <nav className="tab-bar">
      {tabs(user.role).map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`tab-item${activeTab === id ? ' active' : ''}`}
          onClick={() => onTabChange(id)}
        >
          {id === 'manager' && pendingCount > 0 && (
            <span className="tab-badge">{pendingCount}</span>
          )}
          <Icon />
          <span className="tab-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}

export function Sidebar({ activeTab, onTabChange, user, onLogout, pendingCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <IconLogo style={{ width: 18, height: 18, color: 'white' }} />
        </div>
        <span className="sidebar-brand-name">LeaveFlow</span>
      </div>

      <nav className="sidebar-nav">
        {tabs(user.role).map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sidebar-item${activeTab === id ? ' active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <Icon />
            {label}
            {id === 'manager' && pendingCount > 0 && (
              <span className="sidebar-badge">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
          <button className="sidebar-signout" onClick={onLogout} title="Sign out">
            <IconLogout style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
