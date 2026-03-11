import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, User as AppUser } from '../App';
import { mockAnimals, translations } from './mockData';
import { ArrowLeft, Send, Loader, AlertTriangle, Server, Mic, Square, Play, Trash2, FileText, HeartPulse, Camera, Video, Smile, Meh, Frown, Angry, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { useReactMediaRecorder } from 'react-media-recorder';
import { motion } from 'motion/react';
import { GuidedVoiceRecording } from './GuidedVoiceRecording';
import { LogDetailsSections } from './LogDetailsSections';

// Define the structure of the data returned from the API
interface ProcessedData {
  date_or_day: string;
  animal_observed_on_time: boolean;
  clean_drinking_water_provided: boolean;
  enclosure_cleaned_properly: boolean;
  normal_behaviour_status: boolean;
  normal_behaviour_details: string | null;
  daily_animal_health_monitoring: string;
  [key: string]: any; // Allow for other properties
}

interface DailyLogEntryProps {
  onLogSubmitted?: (slot: 'morning' | 'evening') => void;
}

export function DailyLogEntry({ onLogSubmitted }: DailyLogEntryProps = {}) {
  const { currentUser, language, setCurrentScreen, selectedAnimal } = useContext(AppContext);
  const t = translations[language];

  // Form State
  const [generalObservationText, setGeneralObservationText] = useState(''); // Renamed for clarity
  const [healthStatus, setHealthStatus] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good'); // Overall health
  const [moodPercentage, setMoodPercentage] = useState(50); // 0-100, 0: Agitated, 100: Calm
  const [appetitePercentage, setAppetitePercentage] = useState(50); // 0-100, 0: Low, 100: High
  const [movementPercentage, setMovementPercentage] = useState(50); // 0-100, 0: Slow, 100: Active
  const [injuriesText, setInjuriesText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gateImageFile, setGateImageFile] = useState<File | null>(null); // New state for gate image
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedUsersToShare, setSelectedUsersToShare] = useState<string[]>([]); // Array of user IDs to share with

  const [allUsers, setAllUsers] = useState<AppUser[]>([]); // State for live user data

  // Guided Voice Recording State
  const [showGuidedRecording, setShowGuidedRecording] = useState(false);
  const [voiceRecordingBlob, setVoiceRecordingBlob] = useState<Blob | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [showQuestionGuide, setShowQuestionGuide] = useState(false);

  // API State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const { // Media Recorder Hook
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    video: false,
    onStop: (blobUrl, blob) => handleAudioTranscription(blob)
  });


  const animal = selectedAnimal || mockAnimals[0];

  useEffect(() => {
    // Fetch all users for the sharing component
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setAllUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users for sharing:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleAudioTranscription = async (blob: Blob) => {
    if (!blob) return;

    toast.info(t.transcribingAudio);
    setIsLoading(true);

    // Construct a prefix with the current state of the sliders
    let prefix = `Overall Health Status: ${healthStatus}. Mood: ${moodPercentage}%. Appetite: ${appetitePercentage}%. Movement: ${movementPercentage}%. `;
    if (injuriesText.trim()) {
      prefix += `Injuries Report: ${injuriesText}. `;
    }

    const formData = new FormData();
    formData.append('audio', blob, 'observation.wav');
    formData.append('date', new Date().toISOString());
    formData.append('prefix', prefix); // Send the slider data as a prefix
    formData.append('animalId', selectedAnimal?.id || ''); // Add animalId
    formData.append('submittedBy', currentUser?.id || ''); // Add submitter ID
    formData.append('submittedByName', currentUser?.name || ''); // Add submitter name

    try {
      const response = await axios.post(`${API_BASE_URL}/process_audio_observation`, formData);
      setProcessedData(response.data); // Set the structured data from the AI

      // Display the full observation text (prefix + transcribed audio)
      const displayText = response.data.fullObservationText || response.data.daily_animal_health_monitoring || prefix;
      setGeneralObservationText(displayText);

      toast.success(t.observationProcessedSuccess);
    } catch (err: any) {
      toast.error(t.processingError);
      console.error("Audio Processing Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for guided voice recording completion
  const handleGuidedRecordingComplete = async (audioBlob: Blob, transcript: string) => {
    setShowGuidedRecording(false);
    setVoiceRecordingBlob(audioBlob);
    setVoiceTranscript(transcript);

    // Process the guided recording through the backend
    toast.info(t.transcribingAudio);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'guided-recording.webm');
    formData.append('date', new Date().toISOString());
    formData.append('prefix', 'Comprehensive zoo inspection log - Section A (Animal Health) and Enclosure Report: ');
    formData.append('animalId', selectedAnimal?.id || '');
    formData.append('submittedBy', currentUser?.id || ''); // Add submitter ID
    formData.append('submittedByName', currentUser?.name || ''); // Add submitter name

    try {
      const response = await axios.post(`${API_BASE_URL}/process_audio_observation`, formData);
      setProcessedData(response.data);
      const displayText = response.data.fullObservationText || response.data.daily_animal_health_monitoring || '';
      setGeneralObservationText(displayText);
      toast.success(t.observationProcessedSuccess);
    } catch (err: any) {
      toast.error(t.processingError);
      console.error("Guided Recording Processing Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    // Reset form states
    setGeneralObservationText('');
    setHealthStatus('good');
    setMoodPercentage(50);
    setAppetitePercentage(50);
    setMovementPercentage(50);
    setInjuriesText('');
    setImageFile(null);
    setGateImageFile(null);
    setVideoFile(null);
    setSelectedUsersToShare([]);
    clearBlobUrl(); // Clear audio recording
    // Reset API states
    setError(null);
    setProcessedData(null);
  };

  const handleSubmitLog = async () => {
    if (isLoading) return;

    // Prioritize recorded audio over typed text
    const hasAudio = false; // Audio is now transcribed directly to text
    const hasText = generalObservationText.trim() || injuriesText.trim()

    if (!hasAudio && !hasText) {
      toast.error(t.enterObservation); // This toast is for the main submit button
      return;
    }

    resetState();
    setIsLoading(true);

    try {
      // Send ONLY the user's actual observation text to the AI
      // The AI will extract structured data from the text itself
      let userObservationText = '';
      if (injuriesText.trim()) {
        userObservationText += `${injuriesText.trim()}. `;
      }
      if (generalObservationText.trim()) {
        userObservationText += generalObservationText.trim();
      }

      const formData = new FormData();
      if (gateImageFile) {
        formData.append('gateImage', gateImageFile);
      }
      if (imageFile) {
        formData.append('animalImage', imageFile);
      }
      if (videoFile) {
        formData.append('animalVideo', videoFile);
      }

      // Create the complete payload for the backend
      const payload = {
        animalId: selectedAnimal?.id,
        submittedBy: currentUser?.id, // Use ID for filtering
        submittedByName: currentUser?.name, // Keep name for display
        createdAt: new Date().toISOString(),
        healthStatus: healthStatus,
        moodPercentage: moodPercentage,
        appetitePercentage: appetitePercentage,
        movementPercentage: movementPercentage,
        injuriesText: injuriesText.trim(),
        generalObservationText: generalObservationText.trim(),
        observationText: userObservationText, // ONLY user's actual observation text for AI
        sharedWith: selectedUsersToShare,
      };

      formData.append('logData', JSON.stringify(payload));

      const response = await axios.post(`${API_BASE_URL}/process_text_observation`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("🔍 API Response:", response.data);
      console.log("🔍 Setting processedData to:", response.data);
      setProcessedData(response.data);
      console.log("✅ processedData state should now be set");
      toast.success(t.observationProcessedSuccess);
      if (selectedUsersToShare.length > 0) console.log("TODO: Sharing with users:", selectedUsersToShare); // Placeholder for future sharing logic

      // Mark log as submitted for the appropriate time slot
      if (onLogSubmitted) {
        const hour = new Date().getHours();
        const slot = hour < 16 ? 'morning' : 'evening';
        onLogSubmitted(slot);
      }

      // Don't clear form immediately - let user see the AI summary first
      // User can manually clear or submit another observation
      // resetState();

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || t.processingError;
      setError(errorMessage);
      toast.error(t.processingError);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const healthOptions = [
    { status: 'excellent', icon: Smile, color: 'text-green-500' },
    { status: 'good', icon: Meh, color: 'text-blue-500' },
    { status: 'fair', icon: Frown, color: 'text-yellow-500' },
    { status: 'poor', icon: Angry, color: 'text-red-500' },
  ];

  // Helper to get users by role for sharing
  const getUsersByRole = (role: string) => allUsers.filter(user => user.role === role);

  const handleShareUserToggle = (userId: string) => {
    setSelectedUsersToShare(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-white">{t.dailyLog}</h1>
            <p className="text-sm text-white/80">
              {animal.name} - {animal.species}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Guided Voice Recording Button */}
        <Button
          onClick={() => setShowGuidedRecording(true)}
          className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold shadow-lg"
          disabled={isLoading}
        >
          <Mic className="w-6 h-6 mr-3" />
          {language === 'en' ? 'Start Guided Voice Recording (16 Questions)' : 'निर्देशित वॉयस रिकॉर्डिंग शुरू करें (16 प्रश्न)'}
        </Button>

        {/* Health Assessment */}
        <Card className="p-4 bg-white shadow-md">
          <Label className="flex items-center gap-2 text-gray-700 mb-3">
            <HeartPulse className="w-5 h-5" /> {t.healthAssessment}
            Health Assessment
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {healthOptions.map((option) => (
              <Button
                key={option.status}
                variant={healthStatus === option.status ? 'default' : 'outline'}
                className={`h-20 flex flex-col gap-1 transition-all duration-200 ${healthStatus === option.status ? 'bg-green-600 text-white' : ''}`}
                onClick={() => setHealthStatus(option.status as any)}
              >
                <option.icon className={`w-7 h-7 ${healthStatus !== option.status ? option.color : ''}`} />
                <span className="text-xs capitalize">{t[option.status as keyof typeof t]}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Mood, Appetite, Movement Sliders */}
        <Card className="p-4 bg-white shadow-md">
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 text-gray-700 mb-2">
                {t.mood} ({moodPercentage}%)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.agitated}</span>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={moodPercentage}
                  onChange={(e) => setMoodPercentage(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">{t.calm}</span>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-gray-700 mb-2">
                {t.appetite} ({appetitePercentage}%)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.low}</span>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={appetitePercentage}
                  onChange={(e) => setAppetitePercentage(parseInt(e.target.value))}
                  className="flex-1 accent-green-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">{t.high}</span>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-gray-700 mb-2">
                {t.movement} ({movementPercentage}%)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.slow}</span>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={movementPercentage}
                  onChange={(e) => setMovementPercentage(parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500">{t.active}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Injuries / Report */}
        <Card className="p-4 bg-white shadow-md">
          <Label htmlFor="injuries-report" className="flex items-center gap-2 text-gray-700 mb-2">
            <AlertTriangle className="w-5 h-5" /> {t.injuriesReport}
          </Label>
          <Textarea
            id="injuries-report"
            placeholder={t.enterInjuries}
            value={injuriesText}
            onChange={(e) => setInjuriesText(e.target.value)}
            className="h-24 text-base"
            disabled={isLoading}
          />
        </Card>

        {/* General Observation Textarea */}
        <Card className="p-4 bg-white shadow-md">
          <Label htmlFor="general-observation" className="flex items-center gap-2 text-gray-700 mb-2">
            <FileText className="w-5 h-5" /> {t.textLog}
          </Label>
          <Textarea
            id="general-observation"
            placeholder={t.observationPlaceholder}
            value={generalObservationText}
            onChange={(e) => setGeneralObservationText(e.target.value)}
            className="h-32 text-base"
            disabled={isLoading} // Only disable when loading, allow editing even with audio
          />
        </Card>

        {/* 16-Question Inspection Guide */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowQuestionGuide(!showQuestionGuide)}
          >
            <Label className="flex items-center gap-2 text-blue-900 font-semibold cursor-pointer">
              <FileText className="w-5 h-5" />
              {language === 'en' ? '16-Point Inspection Guide (Click to expand)' : '16-बिंदु निरीक्षण गाइड (विस्तार के लिए क्लिक करें)'}
            </Label>
            <Button variant="ghost" size="sm">
              {showQuestionGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>

          {showQuestionGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3 text-sm"
            >
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">
                  {language === 'en' ? 'Section A: Daily Animal Health' : 'खंड A: दैनिक पशु स्वास्थ्य'}
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700">
                  <li><strong>{language === 'en' ? 'Feeding & Drinking:' : 'भोजन और पानी:'}</strong> {t.question1}</li>
                  <li><strong>{language === 'en' ? 'Health & Physical Condition:' : 'स्वास्थ्य और शारीरिक स्थिति:'}</strong> {t.question2}</li>
                  <li><strong>{language === 'en' ? 'Behaviour & Activity:' : 'व्यवहार और गतिविधि:'}</strong> {t.question3}</li>
                  <li><strong>{language === 'en' ? 'Reproductive Status:' : 'प्रजनन स्थिति:'}</strong> {t.question4}</li>
                  <li><strong>{language === 'en' ? 'Mortality / Critical Condition:' : 'मृत्यु / गंभीर स्थिति:'}</strong> {t.question5}</li>
                  <li><strong>{language === 'en' ? 'Hygiene, Pest & Safety:' : 'स्वच्छता, कीट और सुरक्षा:'}</strong> {t.question6}</li>
                  <li><strong>{language === 'en' ? 'Additional Observations:' : 'अतिरिक्त अवलोकन:'}</strong> {t.question7}</li>
                </ol>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">
                  {language === 'en' ? 'Enclosure Report' : 'बाड़ा रिपोर्ट'}
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-gray-700" start={8}>
                  <li><strong>{language === 'en' ? 'Cleanliness & Waste:' : 'स्वच्छता और कचरा:'}</strong> {t.question8}</li>
                  <li><strong>{language === 'en' ? 'Water & Sanitation:' : 'पानी और स्वच्छता:'}</strong> {t.question9}</li>
                  <li><strong>{language === 'en' ? 'Fencing & Locking:' : 'बाड़ और ताला:'}</strong> {t.question10}</li>
                  <li><strong>{language === 'en' ? 'Moat Condition:' : 'खाई की स्थिति:'}</strong> {t.question11}</li>
                  <li><strong>{language === 'en' ? 'Pest Control:' : 'कीट नियंत्रण:'}</strong> {t.question12}</li>
                  <li><strong>{language === 'en' ? 'Staff Status:' : 'कर्मचारी स्थिति:'}</strong> {t.question13}</li>
                  <li><strong>{language === 'en' ? 'Final Safety:' : 'अंतिम सुरक्षा:'}</strong> {t.question14}</li>
                  <li><strong>{language === 'en' ? 'Remarks:' : 'टिप्पणियाँ:'}</strong> {t.question15}</li>
                  <li><strong>{language === 'en' ? 'Kraal / Night Shelter:' : 'क्राल / रात्रि आश्रय:'}</strong> {t.question16}</li>
                </ol>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-300">
                <p className="text-xs text-amber-900">
                  <strong>{language === 'en' ? '💡 Tip:' : '💡 सुझाव:'}</strong> {language === 'en'
                    ? 'Use the voice recording below to answer all these questions in one continuous recording. Speak clearly and mention the question numbers as you go.'
                    : 'नीचे दिए गए वॉयस रिकॉर्डिंग का उपयोग करके इन सभी प्रश्नों का एक निरंतर रिकॉर्डिंग में उत्तर दें। स्पष्ट रूप से बोलें और प्रश्न संख्या का उल्लेख करें।'}
                </p>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Audio Recording */}
        <Card className="p-4 bg-white shadow-md">
          <Label className="flex items-center gap-2 text-gray-700 mb-2">
            <Mic className="w-5 h-5" /> {t.voiceLog}
          </Label>
          <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-center flex-col gap-3">
            <p className="text-sm text-gray-600">{t.recorderStatus}: <span className="font-semibold text-gray-800">{status}</span></p>
            {mediaBlobUrl && <audio src={mediaBlobUrl} controls className="w-full" />}
            <div className="flex gap-2 w-full">
              {status !== 'recording' ? (
                <Button onClick={startRecording} className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  <Play className="w-4 h-4 mr-2" /> {t.startRecording}
                </Button>
              ) : (
                <Button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  <Square className="w-4 h-4 mr-2" /> {t.stopRecording}
                </Button>
              )}
              {mediaBlobUrl && (
                <Button onClick={clearBlobUrl} variant="outline" size="icon" disabled={isLoading}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Media Upload Section */}
        <Card className="p-4 bg-white shadow-md">
          <Label className="flex items-center gap-2 text-gray-700 mb-2">
            <Camera className="w-5 h-5" /> {t.mediaUploads}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild disabled={isLoading}>
              <Label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center">
                <Camera className="w-4 h-4 mr-2" /> {imageFile ? imageFile.name : t.uploadImage}
              </Label>
            </Button>
            <input id="image-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />

            <Button variant="outline" asChild disabled={isLoading}>
              <Label htmlFor="video-upload" className="cursor-pointer flex items-center justify-center">
                <Video className="w-4 h-4 mr-2" /> {videoFile ? videoFile.name : t.uploadVideo}
              </Label>
            </Button>
            <input id="video-upload" type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          </div>
          {/* Gate Closed Image Upload */}
          <div className="mt-4 border-t pt-4">
            <Label className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="w-5 h-5" /> {language === 'en' ? 'Security: Gate Closed Photo *' : 'सुरक्षा: गेट बंद फोटो *'}
            </Label>
            <Button variant="outline" asChild disabled={isLoading} className="border-red-500 text-red-600 hover:bg-red-50 w-full">
              <Label htmlFor="gate-image-upload" className="cursor-pointer flex items-center justify-center">
                <Camera className="w-4 h-4 mr-2" /> {gateImageFile ? gateImageFile.name : (language === 'en' ? 'Upload Gate Photo' : 'गेट फोटो अपलोड करें')}
              </Label>
            </Button>
            <input id="gate-image-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setGateImageFile(e.target.files?.[0] || null)} />
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitLog}
          disabled={isLoading || (!generalObservationText.trim() && !injuriesText.trim() && !mediaBlobUrl)}
          className="w-full mt-4 h-14 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-lg"
        >
          {isLoading ? <Loader className="animate-spin mr-2" /> : <Send className="mr-2" />}
          {isLoading ? t.processing : (t as any).submitFullLog}
        </Button>

        {/* Results Section */}
        {error && (
          <Card className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800">
            <div className="flex items-center">
              <AlertTriangle className="mr-3" />
              <div>
                <p className="font-bold">{t.errorOccurred}</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {processedData && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-amber-900 font-bold leading-tight">AI Generated Report</h2>
                <p className="text-xs text-amber-700">Detailed 16-guided summary extraction</p>
              </div>
            </div>
            <Card className="p-4 bg-white shadow-xl border-t-4 border-amber-500 rounded-xl overflow-hidden">
              <LogDetailsSections log={processedData} language={language} />
              <div className="mt-6 border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full border-amber-600 text-amber-700 hover:bg-amber-50"
                  onClick={() => {
                    toast.info(language === 'en' ? 'Observation saved to history' : 'अवलोकन इतिहास में सहेजा गया');
                    setCurrentScreen('dashboard');
                  }}
                >
                  Done & Return to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Guided Voice Recording Modal */}
      {showGuidedRecording && (
        <GuidedVoiceRecording
          language={language}
          onComplete={handleGuidedRecordingComplete}
          onCancel={() => setShowGuidedRecording(false)}
        />
      )}
    </div>
  );
}
