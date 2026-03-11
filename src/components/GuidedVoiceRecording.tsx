import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, Square, Play, Trash2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './mockData';

interface GuidedVoiceRecordingProps {
    language: 'en' | 'hi';
    onComplete: (audioBlob: Blob, transcript: string) => void;
    onCancel: () => void;
}

export function GuidedVoiceRecording({ language, onComplete, onCancel }: GuidedVoiceRecordingProps) {
    const t = translations[language];
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [recordedAnswers, setRecordedAnswers] = useState<string[]>([]);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

    // 16 questions (9 animal health + 6 enclosure health + 1 kraal)
    const questions = [
        t.question1, t.question2, t.question3, t.question4, t.question5,
        t.question6, t.question7, t.question8, t.question9, t.question10,
        t.question11, t.question12, t.question13, t.question14, t.question15,
        t.question16
    ];

    const totalQuestions = questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    useEffect(() => {
        // Initialize media recorder
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        setAudioChunks(prev => [...prev, event.data]);
                    }
                };

                recorder.onstop = () => {
                    // Audio chunks will be processed when user confirms the answer
                };
            })
            .catch(err => {
                console.error('Failed to get microphone access:', err);
            });

        return () => {
            if (mediaRecorder) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            setAudioChunks([]);
            mediaRecorder.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const playRecording = () => {
        if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setCurrentAudioUrl(audioUrl);
            const audio = new Audio(audioUrl);
            audio.play();
        }
    };

    const confirmAnswer = () => {
        // Save the current answer
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const newAnswers = [...recordedAnswers];
        newAnswers[currentQuestionIndex] = URL.createObjectURL(audioBlob);
        setRecordedAnswers(newAnswers);

        // Move to next question or complete
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAudioChunks([]);
            setCurrentAudioUrl(null);
        } else {
            // All questions answered - combine all audio and complete
            completeRecording();
        }
    };

    const completeRecording = async () => {
        // Combine all audio chunks into one blob
        const currentAnswerBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // Fetch previous answers from blob URLs
        const previousBlobs = await Promise.all(
            recordedAnswers.map(async (url) => {
                const response = await fetch(url);
                return response.blob();
            })
        );

        // Combine all blobs (previous + current)
        const allBlobs = [...previousBlobs, currentAnswerBlob];
        const finalAudioBlob = new Blob(allBlobs, { type: 'audio/webm' });

        const transcript = `Answered ${totalQuestions} questions via voice recording`;
        onComplete(finalAudioBlob, transcript);
    };

    const skipQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAudioChunks([]);
            setCurrentAudioUrl(null);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setAudioChunks([]);
            setCurrentAudioUrl(null);
        }
    };

    const deleteRecording = () => {
        setAudioChunks([]);
        setCurrentAudioUrl(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-2xl"
            >
                <Card className="p-6 bg-white dark:bg-gray-800">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'en' ? 'Guided Voice Recording' : 'निर्देशित वॉयस रिकॉर्डिंग'}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={onCancel}>
                                {language === 'en' ? 'Cancel' : 'रद्द करें'}
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {language === 'en'
                                ? `Question ${currentQuestionIndex + 1} of ${totalQuestions}`
                                : `प्रश्न ${currentQuestionIndex + 1} / ${totalQuestions}`}
                        </p>
                    </div>

                    {/* Question Display */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="mb-6"
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {questions[currentQuestionIndex]}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Recording Controls */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        {!isRecording && audioChunks.length === 0 && (
                            <Button
                                onClick={startRecording}
                                className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            >
                                <Mic className="w-12 h-12" />
                            </Button>
                        )}

                        {isRecording && (
                            <Button
                                onClick={stopRecording}
                                className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white animate-pulse"
                            >
                                <Square className="w-12 h-12" />
                            </Button>
                        )}

                        {!isRecording && audioChunks.length > 0 && (
                            <div className="flex gap-3">
                                <Button onClick={playRecording} variant="outline" size="lg">
                                    <Play className="w-5 h-5 mr-2" />
                                    {language === 'en' ? 'Play' : 'सुनें'}
                                </Button>
                                <Button onClick={deleteRecording} variant="outline" size="lg">
                                    <Trash2 className="w-5 h-5 mr-2" />
                                    {language === 'en' ? 'Delete' : 'हटाएं'}
                                </Button>
                                <Button onClick={confirmAnswer} className="bg-green-600 hover:bg-green-700" size="lg">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    {language === 'en' ? 'Confirm' : 'पुष्टि करें'}
                                </Button>
                            </div>
                        )}

                        {isRecording && (
                            <p className="text-red-600 font-medium animate-pulse">
                                {language === 'en' ? 'Recording...' : 'रिकॉर्डिंग...'}
                            </p>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <Button
                            onClick={previousQuestion}
                            disabled={currentQuestionIndex === 0}
                            variant="outline"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Previous' : 'पिछला'}
                        </Button>

                        <Button onClick={skipQuestion} variant="ghost">
                            {language === 'en' ? 'Skip' : 'छोड़ें'}
                        </Button>

                        <Button
                            onClick={() => currentQuestionIndex === totalQuestions - 1 ? completeRecording() : confirmAnswer()}
                            disabled={audioChunks.length === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {currentQuestionIndex === totalQuestions - 1
                                ? (language === 'en' ? 'Finish' : 'समाप्त करें')
                                : (language === 'en' ? 'Next' : 'अगला')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Answered Questions Indicator */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {Array.from({ length: totalQuestions }).map((_, index) => (
                            <div
                                key={index}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${recordedAnswers[index]
                                    ? 'bg-green-500 text-white'
                                    : index === currentQuestionIndex
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
