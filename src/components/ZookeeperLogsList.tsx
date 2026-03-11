import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../App';

interface ZookeeperSummary {
    id: string;
    name: string;
    todayLogs: number;
    weekLogs: number;
    lastSubmission: string | null;
    assignedAnimals: string[];
    morningSubmitted: boolean;
    eveningSubmitted: boolean;
}

interface ZookeeperLogsListProps {
    language: Language;
    onZookeeperClick: (zookeeperId: string, zookeeperName: string) => void;
}

export function ZookeeperLogsList({ language, onZookeeperClick }: ZookeeperLogsListProps) {
    const [zookeepers, setZookeepers] = useState<ZookeeperSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const t = {
        en: {
            title: 'Zookeeper Logs',
            search: 'Search zookeepers...',
            todayLogs: 'Today',
            weekLogs: 'This Week',
            lastSubmission: 'Last Submission',
            assignedAnimals: 'Assigned Animals',
            noZookeepers: 'No zookeepers found',
            loading: 'Loading...',
            error: 'Failed to load zookeepers',
            morningDone: 'Morning ✓',
            eveningDone: 'Evening ✓',
            pending: 'Pending',
        },
        hi: {
            title: 'चिड़ियाघर कर्मचारी लॉग',
            search: 'चिड़ियाघर कर्मचारी खोजें...',
            todayLogs: 'आज',
            weekLogs: 'इस सप्ताह',
            lastSubmission: 'अंतिम सबमिशन',
            assignedAnimals: 'सौंपे गए जानवर',
            noZookeepers: 'कोई चिड़ियाघर कर्मचारी नहीं मिला',
            loading: 'लोड हो रहा है...',
            error: 'चिड़ियाघर कर्मचारी लोड करने में विफल',
            morningDone: 'सुबह ✓',
            eveningDone: 'शाम ✓',
            pending: 'लंबित',
        },
    };

    const text = t[language];

    useEffect(() => {
        fetchZookeepers();
    }, []);

    const fetchZookeepers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/logs/by-zookeeper`);
            setZookeepers(response.data.zookeepers || []);
        } catch (err) {
            console.error('Failed to fetch zookeepers:', err);
            setError(text.error);
            // Fallback to mock data for development
            setZookeepers([
                {
                    id: 'zk1',
                    name: 'Rajesh Kumar',
                    todayLogs: 2,
                    weekLogs: 12,
                    lastSubmission: new Date().toISOString(),
                    assignedAnimals: ['Tiger #1', 'Lion #2', 'Elephant #3'],
                    morningSubmitted: true,
                    eveningSubmitted: false,
                },
                {
                    id: 'zk2',
                    name: 'Priya Sharma',
                    todayLogs: 1,
                    weekLogs: 10,
                    lastSubmission: new Date(Date.now() - 3600000).toISOString(),
                    assignedAnimals: ['Deer #4', 'Peacock #5'],
                    morningSubmitted: true,
                    eveningSubmitted: true,
                },
                {
                    id: 'zk3',
                    name: 'Amit Patel',
                    todayLogs: 0,
                    weekLogs: 8,
                    lastSubmission: new Date(Date.now() - 86400000).toISOString(),
                    assignedAnimals: ['Bear #6', 'Monkey #7'],
                    morningSubmitted: false,
                    eveningSubmitted: false,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredZookeepers = zookeepers.filter((zk) =>
        zk.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSubmissionStatus = (zk: ZookeeperSummary) => {
        const hour = new Date().getHours();
        const isPastMorning = hour >= 11;
        const isPastEvening = hour >= 16;

        if (isPastEvening) {
            if (zk.morningSubmitted && zk.eveningSubmitted) {
                return { text: `${text.morningDone} ${text.eveningDone}`, color: 'bg-green-500' };
            } else if (zk.morningSubmitted) {
                return { text: `${text.morningDone} | ${text.pending}`, color: 'bg-yellow-500' };
            } else {
                return { text: text.pending, color: 'bg-red-500' };
            }
        } else if (isPastMorning) {
            if (zk.morningSubmitted) {
                return { text: text.morningDone, color: 'bg-green-500' };
            } else {
                return { text: text.pending, color: 'bg-yellow-500' };
            }
        } else {
            return { text: '-', color: 'bg-gray-400' };
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">{text.loading}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder={text.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Zookeeper Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZookeepers.map((zk, index) => {
                    const status = getSubmissionStatus(zk);
                    return (
                        <motion.div
                            key={zk.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                                onClick={() => onZookeeperClick(zk.id, zk.name)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{zk.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={`${status.color} text-white text-xs`}>
                                                {status.text}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-gray-600">{text.todayLogs}:</span>
                                        <span className="font-semibold">{zk.todayLogs}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-gray-600">{text.weekLogs}:</span>
                                        <span className="font-semibold">{zk.weekLogs}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">{text.assignedAnimals}:</p>
                                    <p className="text-sm text-gray-700 truncate mt-1">
                                        {zk.assignedAnimals.join(', ')}
                                    </p>
                                </div>

                                {zk.lastSubmission && (
                                    <div className="mt-2 text-xs text-gray-400">
                                        {text.lastSubmission}: {new Date(zk.lastSubmission).toLocaleString(language === 'en' ? 'en-US' : 'hi-IN')}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {filteredZookeepers.length === 0 && (
                <Card className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{text.noZookeepers}</p>
                </Card>
            )}
        </div>
    );
}
