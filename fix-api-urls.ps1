# PowerShell script to fix all API_BASE_URL references

$files = @(
    "src\components\ZookeeperDashboard.tsx",
    "src\components\VetDashboard.tsx",
    "src\components\UserManagement.tsx",
    "src\components\TaskManagement.tsx",
    "src\components\SharedLogsViewer.tsx",
    "src\components\SOSModal.tsx",
    "src\components\OfficerDashboard.tsx",
    "src\components\MedicationTracker.tsx",
    "src\components\LogHistory.tsx",
    "src\components\DailyLogEntry.tsx",
    "src\components\InventoryManagement.tsx",
    "src\components\AnimalProfile.tsx",
    "src\components\AdminDashboard.tsx"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Add import if not present
    if ($content -notmatch "import \{ API_BASE_URL \} from") {
        $content = $content -replace "(import.*?from.*?;)", "`$1`nimport { API_BASE_URL } from '../config';"
    }
    
    # Remove hardcoded API_BASE_URL line
    $content = $content -replace "  const API_BASE_URL = 'http://127\.0\.0\.1:5000';`r?`n", ""
    
    Set-Content $file -Value $content -NoNewline
    Write-Host "Fixed: $file"
}

Write-Host "`nAll files updated! Now commit and push:"
Write-Host "git add src/components/"
Write-Host "git commit -m 'Fix: Use centralized API_BASE_URL in all components'"
Write-Host "git push origin main"
