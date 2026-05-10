export const USERS = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    password: 'password',
    role: 'employee',
    managerId: 3,
    initials: 'SC',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'James Wilson',
    email: 'james@company.com',
    password: 'password',
    role: 'employee',
    managerId: 3,
    initials: 'JW',
    department: 'Design',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    email: 'priya@company.com',
    password: 'password',
    role: 'manager',
    managerId: null,
    initials: 'PS',
    department: 'Engineering',
  },
]

export const LEAVE_BALANCE = {
  1: { total: 18, used: 6 },
  2: { total: 21, used: 3 },
  3: { total: 15, used: 2 },
}

export const LEAVE_TYPES = [
  'Annual Leave',
  'Casual Leave',
  'Sick Leave',
  'Maternity / Paternity Leave',
  'Unpaid Leave',
]

let nextId = 10

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: 1,
    employeeId: 1,
    leaveType: 'Casual Leave',
    from: '2026-05-12',
    to: '2026-05-14',
    workingDays: 3,
    reason: 'Family function in Pune',
    status: 'pending',
    submittedAt: '2026-05-10T08:30:00Z',
    managerComment: null,
    history: [
      { action: 'Submitted', actor: 'Sarah Chen', timestamp: '2026-05-10T08:30:00Z', dot: 'amber' },
    ],
  },
  {
    id: 2,
    employeeId: 1,
    leaveType: 'Annual Leave',
    from: '2026-04-01',
    to: '2026-04-03',
    workingDays: 3,
    reason: '',
    status: 'approved',
    submittedAt: '2026-03-25T10:00:00Z',
    managerComment: 'Enjoy your break!',
    history: [
      { action: 'Submitted', actor: 'Sarah Chen', timestamp: '2026-03-25T10:00:00Z', dot: 'amber' },
      { action: 'Approved by Priya Sharma', actor: 'Priya Sharma', timestamp: '2026-03-26T09:15:00Z', dot: 'green' },
    ],
  },
  {
    id: 3,
    employeeId: 2,
    leaveType: 'Sick Leave',
    from: '2026-05-08',
    to: '2026-05-09',
    workingDays: 2,
    reason: 'Fever and cold',
    status: 'approved',
    submittedAt: '2026-05-08T07:00:00Z',
    managerComment: 'Get well soon!',
    history: [
      { action: 'Submitted', actor: 'James Wilson', timestamp: '2026-05-08T07:00:00Z', dot: 'amber' },
      { action: 'Approved by Priya Sharma', actor: 'Priya Sharma', timestamp: '2026-05-08T08:30:00Z', dot: 'green' },
    ],
  },
  {
    id: 4,
    employeeId: 1,
    leaveType: 'Casual Leave',
    from: '2026-02-14',
    to: '2026-02-14',
    workingDays: 1,
    reason: 'Personal errand',
    status: 'rejected',
    submittedAt: '2026-02-10T11:00:00Z',
    managerComment: 'Critical sprint week — please reschedule.',
    history: [
      { action: 'Submitted', actor: 'Sarah Chen', timestamp: '2026-02-10T11:00:00Z', dot: 'amber' },
      { action: 'Rejected by Priya Sharma', actor: 'Priya Sharma', timestamp: '2026-02-11T09:00:00Z', dot: 'red' },
    ],
  },
]

export function createLeaveRequest(employeeId, { leaveType, from, to, workingDays, reason }, employeeName) {
  nextId++
  return {
    id: nextId,
    employeeId,
    leaveType,
    from,
    to,
    workingDays,
    reason,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    managerComment: null,
    history: [
      {
        action: 'Submitted',
        actor: employeeName,
        timestamp: new Date().toISOString(),
        dot: 'amber',
      },
    ],
  }
}
