$filePath = "d:\Junglesafari1-main - Copy\Junglesafari1-main\src\components\LogHistory.tsx"
$content = Get-Content $filePath -Raw

# Add missing fields to LogEntry interface
$content = $content -replace "  videoUrl\?: string;", "  videoUrl?: string;`r`n  gateImageUrl?: string; // Gate lock image`r`n  observationText?: string; // Audio/text observation"

# Update hasNotes check
$content = $content -replace "const hasNotes = !!log\.generalObservationText\.trim\(\) \|\| !!log\.injuriesText\.trim\(\);", "const hasNotes = !!(log.generalObservationText?.trim()) || !!(log.injuriesText?.trim()) || !!(log.observationText?.trim());"

# Update hasImages check  
$content = $content -replace "const hasImages = !!log\.imageUrl;", "const hasImages = !!log.imageUrl || !!log.gateImageUrl;"

Set-Content $filePath $content -NoNewline
Write-Host "Updated LogHistory.tsx successfully"
