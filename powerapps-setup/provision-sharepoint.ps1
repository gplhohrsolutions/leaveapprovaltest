# =============================================================
# LeaveFlow - SharePoint List Provisioning Script
# =============================================================
# Prerequisites:
#   Install-Module PnP.PowerShell -Scope CurrentUser
#
# Usage:
#   .\provision-sharepoint.ps1 -SiteUrl "https://YOURTENANT.sharepoint.com/sites/YOURSITE"
# =============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl
)

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  LeaveFlow - SharePoint Provisioning" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Site: $SiteUrl" -ForegroundColor Gray
Write-Host ""

# Connect
Connect-PnPOnline -Url $SiteUrl -Interactive
Write-Host "Connected to SharePoint." -ForegroundColor Green
Write-Host ""

# Helper function
function Create-ListIfNotExists {
    param([string]$Name, [string]$Description)
    $existing = Get-PnPList -Identity $Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "  [$Name] already exists — skipping." -ForegroundColor Yellow
        return $false
    }
    New-PnPList -Title $Name -Template GenericList -EnableVersioning -OnQuickLaunch | Out-Null
    Set-PnPList -Identity $Name -Description $Description | Out-Null
    Write-Host "  [$Name] created." -ForegroundColor Green
    return $true
}


# =============================================================
# LIST 1: LeaveRequests
# =============================================================
Write-Host "--- LeaveRequests ---" -ForegroundColor Cyan
$created = Create-ListIfNotExists -Name "LeaveRequests" -Description "All employee leave requests"

if ($created) {
    $list = "LeaveRequests"

    Add-PnPField -List $list -DisplayName "Employee"        -InternalName "LeaveEmployee"    -Type User     -Required | Out-Null
    Add-PnPField -List $list -DisplayName "Employee Email"  -InternalName "EmployeeEmail"    -Type Text                | Out-Null
    Add-PnPField -List $list -DisplayName "Manager"         -InternalName "LeaveManager"     -Type User                | Out-Null
    Add-PnPField -List $list -DisplayName "Manager Email"   -InternalName "ManagerEmail"     -Type Text                | Out-Null

    Add-PnPField -List $list -DisplayName "Leave Type" -InternalName "LeaveType" -Type Choice -Required `
        -Choices @("Annual Leave","Casual Leave","Sick Leave","Maternity / Paternity Leave","Unpaid Leave") | Out-Null

    Add-PnPField -List $list -DisplayName "From Date"    -InternalName "FromDate"    -Type DateTime -Required | Out-Null
    Add-PnPField -List $list -DisplayName "To Date"      -InternalName "ToDate"      -Type DateTime -Required | Out-Null
    Add-PnPField -List $list -DisplayName "Working Days" -InternalName "WorkingDays" -Type Number             | Out-Null
    Add-PnPField -List $list -DisplayName "Reason"       -InternalName "Reason"      -Type Note               | Out-Null

    Add-PnPField -List $list -DisplayName "Status" -InternalName "Status" -Type Choice `
        -Choices @("Pending","Approved","Rejected") -DefaultValue "Pending" | Out-Null

    Add-PnPField -List $list -DisplayName "Manager Comment"  -InternalName "ManagerComment"  -Type Note     | Out-Null
    Add-PnPField -List $list -DisplayName "Submitted Date"   -InternalName "SubmittedDate"   -Type DateTime | Out-Null
    Add-PnPField -List $list -DisplayName "Resubmitted Date" -InternalName "ResubmittedDate" -Type DateTime | Out-Null
    Add-PnPField -List $list -DisplayName "Revision Count"   -InternalName "RevisionCount"   -Type Number -DefaultValue 0 | Out-Null
    Add-PnPField -List $list -DisplayName "Flow Run ID"      -InternalName "FlowRunId"       -Type Text     | Out-Null

    # Update Title field label
    $titleField = Get-PnPField -List $list -Identity "Title"
    Set-PnPField -List $list -Identity $titleField.Id -Values @{ Title = "Request Title" } | Out-Null

    Write-Host "  All columns added to LeaveRequests." -ForegroundColor Green
}


# =============================================================
# LIST 2: LeaveBalance
# =============================================================
Write-Host ""
Write-Host "--- LeaveBalance ---" -ForegroundColor Cyan
$created = Create-ListIfNotExists -Name "LeaveBalance" -Description "Annual leave balance per employee"

if ($created) {
    $list = "LeaveBalance"

    Add-PnPField -List $list -DisplayName "Employee"       -InternalName "BalanceEmployee"  -Type User   -Required | Out-Null
    Add-PnPField -List $list -DisplayName "Employee Email" -InternalName "EmployeeEmail"    -Type Text             | Out-Null
    Add-PnPField -List $list -DisplayName "Year"           -InternalName "BalanceYear"      -Type Number -Required | Out-Null
    Add-PnPField -List $list -DisplayName "Total Days"     -InternalName "TotalDays"        -Type Number -Required | Out-Null
    Add-PnPField -List $list -DisplayName "Used Days"      -InternalName "UsedDays"         -Type Number -DefaultValue 0 | Out-Null

    # Calculated: Remaining = TotalDays - UsedDays
    Add-PnPField -List $list -DisplayName "Remaining Days" -InternalName "RemainingDays" `
        -Type Calculated -Formula "=[TotalDays]-[UsedDays]" -ResultType Number | Out-Null

    $titleField = Get-PnPField -List $list -Identity "Title"
    Set-PnPField -List $list -Identity $titleField.Id -Values @{ Title = "Employee Name" } | Out-Null

    Write-Host "  All columns added to LeaveBalance." -ForegroundColor Green
}


# =============================================================
# LIST 3: LeaveAuditLog
# =============================================================
Write-Host ""
Write-Host "--- LeaveAuditLog ---" -ForegroundColor Cyan
$created = Create-ListIfNotExists -Name "LeaveAuditLog" -Description "Audit trail for all leave request actions"

if ($created) {
    $list = "LeaveAuditLog"

    Add-PnPField -List $list -DisplayName "Request ID"  -InternalName "RequestId"  -Type Number -Required | Out-Null
    Add-PnPField -List $list -DisplayName "Action" -InternalName "LogAction" -Type Choice `
        -Choices @("Submitted","Approved","Rejected","Revised") | Out-Null
    Add-PnPField -List $list -DisplayName "Actor"        -InternalName "LogActor"   -Type User   | Out-Null
    Add-PnPField -List $list -DisplayName "Actor Email"  -InternalName "ActorEmail" -Type Text   | Out-Null
    Add-PnPField -List $list -DisplayName "Timestamp"    -InternalName "LogTimestamp" -Type DateTime | Out-Null
    Add-PnPField -List $list -DisplayName "Notes"        -InternalName "LogNotes"   -Type Note   | Out-Null

    $titleField = Get-PnPField -List $list -Identity "Title"
    Set-PnPField -List $list -Identity $titleField.Id -Values @{ Title = "Log Entry" } | Out-Null

    Write-Host "  All columns added to LeaveAuditLog." -ForegroundColor Green
}


# =============================================================
# SEED: Sample leave balance rows (optional)
# =============================================================
Write-Host ""
$seed = Read-Host "Seed sample LeaveBalance rows for testing? (y/n)"
if ($seed -eq "y") {
    Write-Host "  Add rows via SharePoint UI or update this script with your employees." -ForegroundColor Yellow
    Write-Host "  Example row: Employee=<UPN>, Year=2026, TotalDays=20, UsedDays=0" -ForegroundColor Gray
}


Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Provisioning complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open Power Automate and build the two flows (see flows/ folder)" -ForegroundColor White
Write-Host "  2. Add employee rows to the LeaveBalance list" -ForegroundColor White
Write-Host "  3. Build the Power Apps canvas app (see SETUP_GUIDE.md)" -ForegroundColor White
Write-Host ""
