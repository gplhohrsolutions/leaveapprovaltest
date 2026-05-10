import { useState, useEffect } from 'react'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import ApplyLeave from './components/ApplyLeave.jsx'
import MyRequests from './components/MyRequests.jsx'
import ManagerView from './components/ManagerView.jsx'
import { TabBar, Sidebar } from './components/Navigation.jsx'
import { IconCheckCircle } from './components/Icons.jsx'
import { INITIAL_LEAVE_REQUESTS, createLeaveRequest, LEAVE_BALANCE } from './data/mockData.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('dashboard')
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS)
  const [leaveBalance, setLeaveBalance] = useState(LEAVE_BALANCE)
  const [revisePrefill, setRevisePrefill] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  function handleLogin(u) {
    setUser(u)
    setTab('dashboard')
  }

  function handleLogout() {
    setUser(null)
    setTab('dashboard')
  }

  function handleApply() {
    setRevisePrefill(null)
    setTab('apply')
  }

  function handleRevise(request) {
    setRevisePrefill(request)
    setTab('apply')
  }

  function handleSubmitLeave(data) {
    const newRequest = createLeaveRequest(user.id, data, user.name)
    setLeaveRequests(prev => [newRequest, ...prev])
    setLeaveBalance(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        used: prev[user.id].used + data.workingDays,
      },
    }))
    showToast('Request submitted')
    setTab('requests')
  }

  function handleApprove(requestId) {
    setLeaveRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r
      return {
        ...r,
        status: 'approved',
        managerComment: 'Approved. Enjoy your time off!',
        history: [
          ...r.history,
          {
            action: `Approved by ${user.name}`,
            actor: user.name,
            timestamp: new Date().toISOString(),
            dot: 'green',
          },
        ],
      }
    }))
    showToast('Request approved')
  }

  function handleReject(requestId, reason) {
    setLeaveRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r
      // refund balance
      setLeaveBalance(bal => ({
        ...bal,
        [r.employeeId]: {
          ...bal[r.employeeId],
          used: Math.max(0, bal[r.employeeId].used - r.workingDays),
        },
      }))
      return {
        ...r,
        status: 'rejected',
        managerComment: reason,
        history: [
          ...r.history,
          {
            action: `Rejected by ${user.name}`,
            actor: user.name,
            timestamp: new Date().toISOString(),
            dot: 'red',
          },
        ],
      }
    }))
    showToast('Request rejected')
  }

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const balanceWithState = {
    ...leaveBalance[user.id],
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={tab}
        onTabChange={setTab}
        user={user}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />

      <div className="screen-content">
        {tab === 'dashboard' && (
          <Dashboard
            user={user}
            leaveRequests={leaveRequests}
            onApply={handleApply}
            onViewRequests={() => setTab('requests')}
            onViewApprovals={() => setTab('manager')}
            onLogout={handleLogout}
          />
        )}

        {tab === 'apply' && (
          <ApplyLeave
            user={user}
            onBack={() => setTab('dashboard')}
            onSubmit={handleSubmitLeave}
            prefill={revisePrefill}
          />
        )}

        {tab === 'requests' && (
          <MyRequests
            user={user}
            leaveRequests={leaveRequests}
            onRevise={handleRevise}
          />
        )}

        {tab === 'manager' && user.role === 'manager' && (
          <ManagerView
            leaveRequests={leaveRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>

      <TabBar
        activeTab={tab}
        onTabChange={setTab}
        user={user}
        pendingCount={pendingCount}
      />

      {toast && (
        <div className="toast">
          <IconCheckCircle />
          {toast}
        </div>
      )}
    </div>
  )
}
