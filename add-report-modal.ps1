$filePath = "d:\Junglesafari1-main - Copy\Junglesafari1-main\src\components\LogHistory.tsx"
$content = Get-Content $filePath -Raw

# Add Dialog import at the top
$content = $content -replace "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';", @"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
"@

# Add state for selected log in LogCard function
$content = $content -replace "function LogCard\(\{", @"
function LogCard({
"@

# Make the card clickable and add modal
$oldCardStart = '    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-green-200 dark:hover:border-green-800">'

$newCardStart = @"
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ delay: index * 0.08, duration: 0.3 }}
        onClick={() => setShowDetails(true)}
      >
        <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-green-200 dark:hover:border-green-800">
"@

$content = $content -replace [regex]::Escape($oldCardStart), $newCardStart

# Add modal at the end of LogCard before the closing
$oldCardEnd = '      </Card>
    </motion.div>
  );
}'

$newCardEnd = @"
        </Card>
      </motion.div>

      {/* Detailed Report Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-900 dark:text-green-100">
              {language === 'en' ? 'Observation Report' : 'अवलोकन रिपोर्ट'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Animal Info */}
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <img src={animal.image} alt={animal.name} className="w-20 h-20 rounded-lg object-cover" />
              <div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">{animal.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{animal.species}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {language === 'en' ? 'Submitted by' : 'द्वारा प्रस्तुत'}: {log.submittedBy}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {new Date(log.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg text-center ${getMoodColor(log.moodPercentage)}`}>
                <p className="text-sm font-semibold">{language === 'en' ? 'Mood' : 'मूड'}</p>
                <p className="text-2xl font-bold">{getMoodLabel(log.moodPercentage)}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${getMoodColor(log.appetitePercentage)}`}>
                <p className="text-sm font-semibold">{language === 'en' ? 'Appetite' : 'भूख'}</p>
                <p className="text-2xl font-bold">{log.appetitePercentage}%</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${getMoodColor(log.movementPercentage)}`}>
                <p className="text-sm font-semibold">{language === 'en' ? 'Movement' : 'गति'}</p>
                <p className="text-2xl font-bold">{log.movementPercentage}%</p>
              </div>
            </div>

            {/* Observation Text */}
            {log.observationText && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  {language === 'en' ? 'Observation' : 'अवलोकन'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.observationText}</p>
              </div>
            )}

            {/* General Observation */}
            {log.generalObservationText && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  {language === 'en' ? 'General Observation' : 'सामान्य अवलोकन'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.generalObservationText}</p>
              </div>
            )}

            {/* Injuries */}
            {log.injuriesText && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  {language === 'en' ? 'Injuries/Issues' : 'चोटें/समस्याएं'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.injuriesText}</p>
              </div>
            )}

            {/* Images */}
            {(log.imageUrl || log.gateImageUrl) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  {language === 'en' ? 'Photos' : 'फोटो'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {log.imageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">{language === 'en' ? 'Animal Photo' : 'जानवर की फोटो'}</p>
                      <img src={log.imageUrl} alt="Animal" className="rounded-lg w-full" />
                    </div>
                  )}
                  {log.gateImageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">{language === 'en' ? 'Gate Lock Photo' : 'गेट लॉक फोटो'}</p>
                      <img src={log.gateImageUrl} alt="Gate Lock" className="rounded-lg w-full" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video */}
            {log.videoUrl && (
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  {language === 'en' ? 'Video' : 'वीडियो'}
                </h4>
                <video src={log.videoUrl} controls className="rounded-lg w-full" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
"@

$content = $content -replace [regex]::Escape($oldCardEnd), $newCardEnd

Set-Content $filePath $content -NoNewline
Write-Host "Added detailed report modal to LogHistory.tsx"
