$filePath = "d:\Junglesafari1-main - Copy\Junglesafari1-main\src\components\LogHistory.tsx"
$content = Get-Content $filePath -Raw

# Fix notes preview to include observationText
$oldNotesPreview = "              <p className=`"text-sm text-gray-700 dark:text-gray-300 line-clamp-2`">`r`n                {log.generalObservationText || log.injuriesText}`r`n              </p>"
$newNotesPreview = "              <p className=`"text-sm text-gray-700 dark:text-gray-300 line-clamp-2`">`r`n                {log.observationText || log.generalObservationText || log.injuriesText}`r`n              </p>"
$content = $content -replace [regex]::Escape($oldNotesPreview), $newNotesPreview

# Fix image preview to show both images
$oldImagePreview = "            {/* Image Preview */}`r`n            {hasImages && (`r`n              <div className=`"mt-2`">`r`n                <img src={log.imageUrl} alt=`"Observation`" className=`"rounded-lg max-h-40`" />`r`n              </div>`r`n            )}"
$newImagePreview = @"
            {/* Image Preview */}
            {hasImages && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {log.imageUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{language === 'en' ? 'Animal Photo' : 'जानवर की फोटो'}</p>
                    <img src={log.imageUrl} alt="Animal" className="rounded-lg max-h-40" />
                  </div>
                )}
                {log.gateImageUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{language === 'en' ? 'Gate Lock Photo' : 'गेट लॉक फोटो'}</p>
                    <img src={log.gateImageUrl} alt="Gate Lock" className="rounded-lg max-h-40" />
                  </div>
                )}
              </div>
            )}
"@
$content = $content -replace [regex]::Escape($oldImagePreview), $newImagePreview

Set-Content $filePath $content -NoNewline
Write-Host "Updated LogHistory.tsx display logic successfully"
