# Power Apps — Screen-by-Screen Formulas

## App Setup

### App.OnStart
```
// Load logged-in user and their balance
Set(gCurrentUser, Office365Users.MyProfileV2());
Set(gCurrentYear, Year(Now()));

// Load leave balance for current user
ClearCollect(
    colLeaveBalance,
    Filter(
        'LeaveBalance',
        EmployeeEmail = gCurrentUser.mail,
        BalanceYear = gCurrentYear
    )
);
Set(gBalance, First(colLeaveBalance));

// Load this user's leave requests
ClearCollect(
    colMyRequests,
    SortByColumns(
        Filter('LeaveRequests', EmployeeEmail = gCurrentUser.mail),
        "SubmittedDate", Descending
    )
);

// If manager: load pending requests
If(
    gCurrentUser.jobTitle = "Manager",   // adjust to your org's manager detection
    ClearCollect(
        colPendingApprovals,
        Filter('LeaveRequests', Status.Value = "Pending")
    )
);

// Navigate to dashboard
Navigate(scrDashboard, ScreenTransition.Fade)
```

---

## Screen: Login (scrLogin)

Power Apps uses Azure AD automatically — no login screen needed.
Use `Office365Users.MyProfileV2()` in App.OnStart to get the signed-in user.
Skip this screen; go straight to the dashboard.

---

## Screen: Dashboard (scrDashboard)

### Labels
```
// Welcome label
"Hello, " & First(Split(gCurrentUser.displayName, " ")).Result

// Remaining days
Text(gBalance.TotalDays - gBalance.UsedDays, "0")

// Used days
Text(gBalance.UsedDays, "0")

// Total days
Text(gBalance.TotalDays, "0")
```

### Pending Approvals banner (visible to managers only)
```
// Visible property
gCurrentUser.jobTitle = "Manager" && CountRows(colPendingApprovals) > 0

// Label text
Text(CountRows(colPendingApprovals), "0") & " Pending Approval(s)"

// OnSelect
Navigate(scrApprovals, ScreenTransition.Slide)
```

### Apply for Leave button
```
// OnSelect
Set(gEditRequest, Blank());   // clear any prefill
Navigate(scrApplyLeave, ScreenTransition.Slide)
```

### Recent Requests Gallery (galRecentRequests)
```
// Items
FirstN(colMyRequests, 3)

// Status badge color (label Color property)
Switch(
    ThisItem.Status.Value,
    "Approved",  RGBA(48, 209, 88, 1),
    "Rejected",  RGBA(255, 69, 58, 1),
    RGBA(255, 159, 10, 1)   // Pending = amber
)
```

---

## Screen: Apply for Leave (scrApplyLeave)

### Working Days Calculation
Power Apps has no built-in working-day counter. Use this formula on a label:

```
// Place this in a label's Text property bound to a variable
// Call Set(gWorkingDays, ...) when dates change

// OnChange of datFrom or datTo pickers:
Set(
    gWorkingDays,
    With(
        {
            startDate: DateValue(datFrom.SelectedDate),
            endDate:   DateValue(datTo.SelectedDate)
        },
        // Count calendar days, subtract weekends
        With(
            { totalDays: DateDiff(startDate, endDate, Days) + 1 },
            totalDays
            - RoundDown((totalDays + Weekday(startDate, StartOfWeek.Monday) - 1) / 7, 0) * 2
            - If(Weekday(startDate, StartOfWeek.Monday) = 6, 1, 0)  // starts Saturday
            - If(
                Mod(totalDays + Weekday(startDate, StartOfWeek.Monday) - 1, 7) >= 6,
                1, 0
            )  // ends Saturday
        )
    )
);
```

> Tip: For simplicity, many teams just use calendar days. Swap gWorkingDays for DateDiff(datFrom.SelectedDate, datTo.SelectedDate, Days) + 1.

### Validation label
```
// Text
If(
    IsBlank(datFrom.SelectedDate) || IsBlank(datTo.SelectedDate),
    "",
    If(
        datTo.SelectedDate < datFrom.SelectedDate,
        "❌  End date must be after start date",
        If(
            gWorkingDays > (gBalance.TotalDays - gBalance.UsedDays),
            "❌  Exceeds your remaining balance (" & (gBalance.TotalDays - gBalance.UsedDays) & " days)",
            "✅  " & gWorkingDays & " working day(s) · valid"
        )
    )
)

// Color
If(
    StartsWith(Self.Text, "✅"),
    RGBA(48, 209, 88, 1),
    RGBA(255, 69, 58, 1)
)
```

### Submit Button
```
// DisplayMode
If(
    IsBlank(datFrom.SelectedDate) ||
    IsBlank(datTo.SelectedDate) ||
    datTo.SelectedDate < datFrom.SelectedDate ||
    gWorkingDays <= 0 ||
    gWorkingDays > (gBalance.TotalDays - gBalance.UsedDays),
    DisplayMode.Disabled,
    DisplayMode.Edit
)

// OnSelect
If(
    IsBlank(gEditRequest),

    // New submission
    Patch(
        'LeaveRequests',
        Defaults('LeaveRequests'),
        {
            Title:         "Leave - " & gCurrentUser.displayName & " - " & Text(Now(), "dd-mm-yyyy"),
            EmployeeEmail: gCurrentUser.mail,
            LeaveType:     { Value: drpLeaveType.Selected.Value },
            FromDate:       datFrom.SelectedDate,
            ToDate:         datTo.SelectedDate,
            WorkingDays:   gWorkingDays,
            Reason:        txtReason.Text,
            Status:        { Value: "Pending" },
            SubmittedDate: Now(),
            RevisionCount: 0
        }
    ),

    // Resubmission (revision)
    Patch(
        'LeaveRequests',
        LookUp('LeaveRequests', ID = gEditRequest.ID),
        {
            LeaveType:        { Value: drpLeaveType.Selected.Value },
            FromDate:          datFrom.SelectedDate,
            ToDate:            datTo.SelectedDate,
            WorkingDays:      gWorkingDays,
            Reason:           txtReason.Text,
            Status:           { Value: "Pending" },
            ManagerComment:   "",
            ResubmittedDate:  Now(),
            RevisionCount:    gEditRequest.RevisionCount + 1
        }
    )
);

// Refresh collections
ClearCollect(
    colMyRequests,
    SortByColumns(
        Filter('LeaveRequests', EmployeeEmail = gCurrentUser.mail),
        "SubmittedDate", Descending
    )
);

// Show confirmation and go back
Notify("Request submitted! Your manager will be notified.", NotificationType.Success);
Navigate(scrMyRequests, ScreenTransition.Slide)
```

---

## Screen: My Requests (scrMyRequests)

### Gallery (galMyRequests)
```
// Items
colMyRequests

// Status badge background color
Switch(
    ThisItem.Status.Value,
    "Approved", RGBA(232, 249, 238, 1),
    "Rejected",  RGBA(255, 235, 234, 1),
    RGBA(255, 244, 224, 1)
)

// Status badge text color
Switch(
    ThisItem.Status.Value,
    "Approved", RGBA(48, 209, 88, 1),
    "Rejected",  RGBA(255, 69, 58, 1),
    RGBA(255, 159, 10, 1)
)
```

### "Revise" button (visible on rejected requests)
```
// Visible property
ThisItem.Status.Value = "Rejected"

// OnSelect
Set(gEditRequest, ThisItem);
Set(gWorkingDays, ThisItem.WorkingDays);
Navigate(scrApplyLeave, ScreenTransition.Slide)
```

### Prefill Apply screen when revising
In scrApplyLeave — set DefaultDate on pickers and Default on dropdown:
```
// drpLeaveType Default
If(IsBlank(gEditRequest), First(leaveTypeChoices).Value, gEditRequest.LeaveType.Value)

// datFrom DefaultDate
If(IsBlank(gEditRequest), Today(), gEditRequest.FromDate)

// datTo DefaultDate
If(IsBlank(gEditRequest), Today(), gEditRequest.ToDate)

// txtReason Default
If(IsBlank(gEditRequest), "", gEditRequest.Reason)
```

---

## Screen: Approvals (scrApprovals) — Manager only

### Gallery (galApprovals)
```
// Items
colPendingApprovals
```

### Approve Button
```
// OnSelect
Patch(
    'LeaveRequests',
    ThisItem,
    {
        Status:         { Value: "Approved" },
        ManagerComment: "Approved. Enjoy your time off!"
    }
);
// Update LeaveBalance
With(
    { bal: LookUp('LeaveBalance', EmployeeEmail = ThisItem.EmployeeEmail && BalanceYear = gCurrentYear) },
    Patch('LeaveBalance', bal, { UsedDays: bal.UsedDays + ThisItem.WorkingDays })
);
// Log it
Patch(
    'LeaveAuditLog',
    Defaults('LeaveAuditLog'),
    {
        Title:        "Log entry",
        RequestId:    ThisItem.ID,
        LogAction:    { Value: "Approved" },
        ActorEmail:   gCurrentUser.mail,
        LogTimestamp: Now(),
        LogNotes:     "Approved via Power Apps"
    }
);
// Refresh
ClearCollect(colPendingApprovals, Filter('LeaveRequests', Status.Value = "Pending"));
Notify("Approved!", NotificationType.Success)
```

### Reject Button — opens a popup/overlay with reason input
```
// Show overlay
Set(gRejectTarget, ThisItem);
Set(gShowRejectPanel, true)
```

### Confirm Reject (inside overlay)
```
// OnSelect (Confirm button in overlay)
If(
    IsBlank(txtRejectReason.Text),
    Notify("Please enter a reason.", NotificationType.Warning),

    Patch(
        'LeaveRequests',
        gRejectTarget,
        {
            Status:         { Value: "Rejected" },
            ManagerComment: txtRejectReason.Text
        }
    );
    Patch(
        'LeaveAuditLog',
        Defaults('LeaveAuditLog'),
        {
            Title:        "Log entry",
            RequestId:    gRejectTarget.ID,
            LogAction:    { Value: "Rejected" },
            ActorEmail:   gCurrentUser.mail,
            LogTimestamp: Now(),
            LogNotes:     txtRejectReason.Text
        }
    );
    ClearCollect(colPendingApprovals, Filter('LeaveRequests', Status.Value = "Pending"));
    Set(gShowRejectPanel, false);
    Notify("Request rejected.", NotificationType.Warning)
)
```

---

## Navigation Bar (component or per-screen)
```
// Go to Dashboard
Navigate(scrDashboard, ScreenTransition.Fade)

// Go to Apply Leave
Set(gEditRequest, Blank());
Navigate(scrApplyLeave, ScreenTransition.Slide)

// Go to My Requests
Navigate(scrMyRequests, ScreenTransition.Slide)

// Go to Approvals (manager only)
Navigate(scrApprovals, ScreenTransition.Slide)
```

---

## Leave Type Choices (define in App.OnStart)
```
ClearCollect(
    leaveTypeChoices,
    { Value: "Annual Leave" },
    { Value: "Casual Leave" },
    { Value: "Sick Leave" },
    { Value: "Maternity / Paternity Leave" },
    { Value: "Unpaid Leave" }
);
```
Bind `drpLeaveType.Items` to `leaveTypeChoices`.
