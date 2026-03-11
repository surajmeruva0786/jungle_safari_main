import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Download, ChevronDown, ChevronUp, Filter, X, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../App';
import { LogDetailsSections } from './LogDetailsSections';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LogEntry {
    id: string;
    animalId: string;
    animalName?: string;
    animalImage?: string;
    submittedAt: string;
    createdAt?: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    observations?: string;
    observationText?: string;
    processedData?: any;
    moodPercentage?: number;
    appetitePercentage?: number;
    movementPercentage?: number;
    imageUrl?: string;
    videoUrl?: string;
    gateImageUrl?: string;

    // All the detailed fields from the log
    [key: string]: any;
}

interface ZookeeperLogsViewerProps {
    zookeeperId: string;
    zookeeperName: string;
    language: Language;
    isOpen: boolean;
    onClose: () => void;
}

export function ZookeeperLogsViewer({
    zookeeperId,
    zookeeperName,
    language,
    isOpen,
    onClose,
}: ZookeeperLogsViewerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [animalFilter, setAnimalFilter] = useState('');

    const t = {
        en: {
            title: 'Logs',
            description: 'View all logs submitted by',
            loading: 'Loading logs...',
            noLogs: 'No logs found',
            filterByDate: 'Filter by date',
            filterByAnimal: 'Filter by animal',
            clearFilters: 'Clear Filters',
            submittedAt: 'Submitted',
            animal: 'Animal',
            health: 'Health',
            observations: 'Observations',
            details: 'Details',
            mood: 'Mood',
            appetite: 'Appetite',
            movement: 'Movement',
            excellent: 'Excellent',
            good: 'Good',
            fair: 'Fair',
            poor: 'Poor',
        },
        hi: {
            title: 'लॉग',
            description: 'द्वारा सबमिट किए गए सभी लॉग देखें',
            loading: 'लॉग लोड हो रहे हैं...',
            noLogs: 'कोई लॉग नहीं मिला',
            filterByDate: 'तारीख से फ़िल्टर करें',
            filterByAnimal: 'जानवर से फ़िल्टर करें',
            clearFilters: 'फ़िल्टर साफ़ करें',
            submittedAt: 'सबमिट किया गया',
            animal: 'जानवर',
            health: 'स्वास्थ्य',
            observations: 'अवलोकन',
            details: 'विवरण',
            mood: 'मूड',
            appetite: 'भूख',
            movement: 'गतिविधि',
            excellent: 'उत्कृष्ट',
            good: 'अच्छा',
            fair: 'ठीक',
            poor: 'खराब',
        },
    };

    const text = t[language];

    useEffect(() => {
        if (isOpen && zookeeperId) {
            fetchLogs();
        }
    }, [isOpen, zookeeperId]);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            // Fetch all observations and filter by submittedBy
            const response = await axios.get(`${API_BASE_URL}/observations`);
            const allLogs = response.data || [];

            // Filter logs by zookeeper
            const zookeeperLogs = allLogs.filter((log: any) => log.submittedBy === zookeeperId);

            // Fetch animal details for each log
            const animalsResponse = await axios.get(`${API_BASE_URL}/animals`);
            const animals = animalsResponse.data || [];

            // Enrich logs with animal data
            const enrichedLogs = zookeeperLogs.map((log: any) => {
                const animal = animals.find((a: any) => a.id === log.animalId);
                return {
                    ...log,
                    animalName: animal?.name || 'Unknown',
                    animalImage: animal?.image || '',
                };
            });

            setLogs(enrichedLogs);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        const logDate = log.submittedAt || log.createdAt || '';
        const matchesDate = dateFilter && logDate
            ? new Date(logDate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
            : !dateFilter;
        const matchesAnimal = animalFilter
            ? (log.animalName || '').toLowerCase().includes(animalFilter.toLowerCase())
            : true;
        return matchesDate && matchesAnimal;
    });

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent':
                return 'bg-green-500';
            case 'good':
                return 'bg-blue-500';
            case 'fair':
                return 'bg-yellow-500';
            case 'poor':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getHealthText = (health: string) => {
        switch (health) {
            case 'excellent':
                return text.excellent;
            case 'good':
                return text.good;
            case 'fair':
                return text.fair;
            case 'poor':
                return text.poor;
            default:
                return health;
        }
    };

    const getMoodColor = (value: number) => {
        if (value >= 75) return 'bg-green-100 text-green-700';
        if (value >= 50) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };



    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-green-900">
                        {zookeeperName} - {text.title}
                    </SheetTitle>
                    <SheetDescription>
                        {text.description} {zookeeperName}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                placeholder={text.filterByDate}
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={animalFilter}
                                onChange={(e) => setAnimalFilter(e.target.value)}
                                placeholder={text.filterByAnimal}
                                className="w-full"
                            />
                        </div>
                        {(dateFilter || animalFilter) && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setDateFilter('');
                                    setAnimalFilter('');
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Export Button */}


                    {/* Logs List */}
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">{text.loading}</div>
                    ) : filteredLogs.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-gray-500">{text.noLogs}</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredLogs.map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="overflow-hidden">
                                        <div
                                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                        >
                                            <div className="flex gap-4">
                                                {/* Animal Image */}
                                                {log.animalImage && (
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                        <ImageWithFallback
                                                            src={log.animalImage}
                                                            alt={log.animalName || 'Animal'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-semibold text-gray-900">{log.animalName}</h4>
                                                                <Badge className={`${getHealthColor(log.healthStatus)} text-white text-xs`}>
                                                                    {getHealthText(log.healthStatus)}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                {text.submittedAt}: {new Date(log.submittedAt || log.createdAt || Date.now()).toLocaleString(language === 'en' ? 'en-US' : 'hi-IN')}
                                                            </p>

                                                            {/* Mood/Appetite/Movement indicators */}
                                                            {(log.moodPercentage || log.appetitePercentage || log.movementPercentage) && (
                                                                <div className="flex gap-2 mt-2">
                                                                    {log.moodPercentage !== undefined && (
                                                                        <div className={`px-2 py-1 rounded text-xs ${getMoodColor(log.moodPercentage)}`}>
                                                                            {text.mood}: {log.moodPercentage}%
                                                                        </div>
                                                                    )}
                                                                    {log.appetitePercentage !== undefined && (
                                                                        <div className={`px-2 py-1 rounded text-xs ${getMoodColor(log.appetitePercentage)}`}>
                                                                            {text.appetite}: {log.appetitePercentage}%
                                                                        </div>
                                                                    )}
                                                                    {log.movementPercentage !== undefined && (
                                                                        <div className={`px-2 py-1 rounded text-xs ${getMoodColor(log.movementPercentage)}`}>
                                                                            {text.movement}: {log.movementPercentage}%
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button variant="ghost" size="icon">
                                                            {expandedLogId === log.id ? (
                                                                <ChevronUp className="w-5 h-5" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedLogId === log.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden bg-gray-50/50"
                                                >
                                                    <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                                                        {/* Display full log details using LogDetailsSections */}
                                                        <LogDetailsSections
                                                            log={log}
                                                            language={language}
                                                        />

                                                        {/* Image Preview */}
                                                        {(log.imageUrl || log.gateImageUrl) && (
                                                            <div className="mt-4 flex gap-2 flex-wrap">
                                                                {log.imageUrl && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mb-1">
                                                                            {language === 'en' ? 'Animal Photo' : 'जानवर की फोटो'}
                                                                        </p>
                                                                        <img src={log.imageUrl} alt="Animal" className="rounded-lg max-h-40" />
                                                                    </div>
                                                                )}
                                                                {log.gateImageUrl && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 mb-1">
                                                                            {language === 'en' ? 'Gate Lock Photo' : 'गेट लॉक फोटो'}
                                                                        </p>
                                                                        <img src={log.gateImageUrl} alt="Gate Lock" className="rounded-lg max-h-40" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Video Preview */}
                                                        {log.videoUrl && (
                                                            <div className="mt-4">
                                                                <video src={log.videoUrl} controls className="rounded-lg max-h-60 w-full" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
