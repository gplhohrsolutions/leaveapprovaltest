# LeaveFlow — Power Platform Setup Guide

## What's in this folder

| File | What it does |
|---|---|
| `provision-sharepoint.ps1` | **Run this first.** Creates all 3 SharePoint lists with correct columns. |
| `flows/flow-1-on-submission.json` | Blueprint for the Power Automate flow. Build it step-by-step using this file. |
| `powerapps-formulas.md` | Every Power Apps formula you need, screen by screen. |

---

## Architecture Overview

```
Employee (Power Apps)
    │
    ├─ Submits leave ──► LeaveRequests (SharePoint)
    │                          │
    │              Power Automate picks up (trigger)
    │                          │
    │                  Teams Adaptive Card ──► Manager
    │                          │
    │                  Manager clicks Approve / Reject
    │                          │
    │         ┌────────────────┴─────────────────┐
    │      Approved                           Rejected
    │         │                                   │
    │  Update Status + Balance          Update Status + Reason
    │  Notify Employee (Teams)          Notify Employee (Teams)
    │                                          │
    └──────────────── Employee revises ────────┘
                      (flow re-triggers)
```

---

## Step 1 — Provision SharePoint Lists

### Install PnP PowerShell (once)
```powershell
Install-Module PnP.PowerShell -Scope CurrentUser -Force
```

### Run the provisioning script
```powershell
.\provision-sharepoint.ps1 -SiteUrl "https://YOURTENANT.sharepoint.com/sites/YOURSITE"
```

This creates:
- **LeaveRequests** — all leave submissions
- **LeaveBalance** — annual balance per employee
- **LeaveAuditLog** — full audit trail

### After running: seed LeaveBalance
For each employee, add a row to **LeaveBalance**:
- Employee Name (Title): their display name
- Employee: their M365 account
- Employee Email: their email
- Year: 2026
- Total Days: their entitlement (e.g. 20)
- Used Days: 0

---

## Step 2 — Build the Power Automate Flow

Open Power Automate → **Create → Automated cloud flow**

### Trigger
`SharePoint — When an item is created or modified`
- Site: your SharePoint site
- List: **LeaveRequests**
- Add a **Trigger Condition**: `@equals(triggerOutputs()?['body/Status/Value'], 'Pending')`
  *(This ensures it only fires on Pending, not when you update status to Approved/Rejected)*

### Actions (follow flow-1-on-submission.json)

| Step | Action | Key Setting |
|---|---|---|
| 1 | Office 365 Users — Get user profile (V2) | userId = `EmployeeEmail` from trigger |
| 2 | Office 365 Users — Get manager (V2) | userId = `EmployeeEmail` from trigger |
| 3 | SharePoint — Update item | Write manager email back to the request |
| 4 | SharePoint — Create item (AuditLog) | Action = Submitted or Revised |
| 5 | Teams — Post Adaptive Card and wait for response | Send to manager's email; card has Approve/Reject + comment input |
| 6 | Condition | `decision` output = "Approved" |
| 6a-e | If Approved | Update status, deduct balance, log, notify employee |
| 6f-h | If Rejected | Update status, log, notify employee with reason |

### Adaptive Card JSON (paste into step 5)
Copy the `messageBody` object from `flows/flow-1-on-submission.json` into the
"Message" field of the Teams Adaptive Card action.

---

## Step 3 — Build the Power Apps Canvas App

### Create a new Canvas App
Power Apps → **Create → Canvas app from blank** → Tablet or Phone layout

### Add Data Sources
In the Data panel, add:
- `LeaveRequests` (SharePoint)
- `LeaveBalance` (SharePoint)
- `LeaveAuditLog` (SharePoint)
- `Office365Users` (connector)

### Screens to build

| Screen Name | Purpose |
|---|---|
| `scrDashboard` | Balance cards, Apply button, recent requests, manager alert |
| `scrApplyLeave` | Leave type, date pickers, working days validation, submit |
| `scrMyRequests` | Gallery of user's requests, revise button on rejected ones |
| `scrApprovals` | Manager-only: pending cards with Approve/Reject buttons |

### Paste formulas from `powerapps-formulas.md`
Each screen section in that file maps 1:1 to a screen here.

### Key controls to add per screen

**scrDashboard**
- 3× Label (balance numbers)
- 1× Button "Apply for Leave"
- 1× Gallery (recent requests, 3 items)
- 1× Button/Container (pending approvals — visible to managers only)

**scrApplyLeave**
- 1× Dropdown (`drpLeaveType`) — Items: `leaveTypeChoices`
- 2× Date Picker (`datFrom`, `datTo`)
- 1× Text Input (`txtReason`) — multiline
- 1× Label (working days + validation message)
- 1× Label (balance summary)
- 1× Button "Submit Request"

**scrMyRequests**
- 1× Gallery (`galMyRequests`) with: type label, date chips, status badge, reason, reject note, revise button

**scrApprovals**
- 1× Gallery (`galApprovals`) — Items: `colPendingApprovals`
- 1× Button "Approve" per gallery row
- 1× Button "Reject" per gallery row
- 1× Overlay/Popup container (reject reason input + confirm)

---

## Step 4 — Connect App to Flow

The Power Automate flow triggers automatically from SharePoint — no direct connection needed in Power Apps. When the app does `Patch('LeaveRequests', ...)`, the flow picks it up.

---

## Step 5 — Publish & Share

1. In Power Apps: **File → Save → Publish**
2. Share the app with your organisation: **File → Share**
3. Make sure all users have **Read/Write access to the 3 SharePoint lists**
4. The Power Automate flow needs to be shared with the account that owns it, or use a service account

---

## Tips

- **Manager detection**: The flow uses `Get manager (V2)` from Office 365 — this reads from Azure AD automatically. No manual manager field needed.
- **Working days**: Power Automate doesn't have a working-days function either. The flow just records what the app sends. Handle the calculation in Power Apps (formula is in `powerapps-formulas.md`).
- **Testing**: Add yourself as both an employee and a manager (different test accounts) to test the full flow end-to-end.
- **Teams notifications**: The Adaptive Card action requires a Teams license. If unavailable, replace with "Send an email (V2)" via Outlook.
