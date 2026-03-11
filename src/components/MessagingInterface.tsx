import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, Language, User } from '../App';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MessageSquare, AlertTriangle, Megaphone, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { Message, MessageComposer } from './MessageComposer';

interface MessagingInterfaceProps {
    language: Language;
    currentUser: User;
}

export function MessagingInterface({ language, currentUser }: MessagingInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    const t = {
        en: {
            title: 'Messages',
            noMessages: 'No messages found',
            loading: 'Loading messages...',
            search: 'Search messages...',
            filterByType: 'Filter by type',
            filterByPriority: 'Filter by priority',
            all: 'All',
            message: 'Message',
            instruction: 'Instruction',
            announcement: 'Announcement',
            normal: 'Normal',
            high: 'High',
            urgent: 'Urgent',
            everyone: 'Everyone',
            you: 'You',
            readBy: 'Read by',
            people: 'people',
            justNow: 'Just now',
            minutesAgo: 'minutes ago',
            hoursAgo: 'hours ago',
            daysAgo: 'days ago',
            admin: 'Admin',
            vet: 'Vet',
            zookeeper: 'Zookeeper',
            officer: 'Officer',
        },
        hi: {
            title: 'संदेश',
            noMessages: 'कोई संदेश नहीं मिला',
            loading: 'संदेश लोड हो रहे हैं...',
            search: 'संदेश खोजें...',
            filterByType: 'प्रकार से फ़िल्टर करें',
            filterByPriority: 'प्राथमिकता से फ़िल्टर करें',
            all: 'सभी',
            message: 'संदेश',
            instruction: 'निर्देश',
            announcement: 'घोषणा',
            normal: 'सामान्य',
            high: 'उच्च',
            urgent: 'अत्यावश्यक',
            everyone: 'सभी को',
            you: 'आप',
            readBy: 'द्वारा पढ़ा गया',
            people: 'लोग',
            justNow: 'अभी',
            minutesAgo: 'मिनट पहले',
            hoursAgo: 'घंटे पहले',
            daysAgo: 'दिन पहले',
            admin: 'एडमिन',
            vet: 'वेट',
            zookeeper: 'ज़ूकैपर',
            officer: 'अधिकारी',
        },
    };

    const text = t[language];

    useEffect(() => {
        fetchMessages();

        // Poll for new messages every 5 seconds
        const intervalId = setInterval(() => {
            fetchMessages(false); // Don't show loading spinner for background updates
        }, 5000);

        return () => clearInterval(intervalId);
    }, [currentUser]);

    const fetchMessages = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/messages`, {
                params: {
                    userId: currentUser.id,
                    role: currentUser.role
                }
            });
            const allMessages = response.data.messages || [];

            // Filter messages based on user role and recipient
            const userMessages = allMessages.filter((msg: Message) => {
                if (msg.senderId === currentUser.id) return true; // Show messages sent by the user
                if (msg.recipientType === 'everyone') return true;
                if (msg.recipientType === 'individual' && msg.recipientId === currentUser.id) return true;
                if (msg.recipientType === 'role' && msg.recipientRole === currentUser.role) return true;
                return false;
            });

            setMessages(userMessages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            // Fallback to mock messages
            setMessages([
                {
                    id: 'msg1',
                    senderId: 'admin1',
                    senderName: 'Admin Kumar',
                    senderRole: 'admin',
                    recipientType: 'everyone',
                    content: 'Team meeting scheduled for 3 PM today in the main conference room. Please bring your monthly reports and be prepared to discuss animal health updates.',
                    type: 'announcement',
                    priority: 'high',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    readBy: ['user1', 'user2'],
                },
                {
                    id: 'msg2',
                    senderId: 'vet1',
                    senderName: 'Dr. Sharma',
                    senderRole: 'vet',
                    recipientType: 'role',
                    recipientRole: 'zookeeper',
                    content: 'Please ensure all animals receive their vitamin supplements with morning feed. Special attention needed for the elderly elephants.',
                    type: 'instruction',
                    priority: 'normal',
                    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    readBy: [],
                },
                {
                    id: 'msg3',
                    senderId: 'admin1',
                    senderName: 'Admin Kumar',
                    senderRole: 'admin',
                    recipientType: 'individual',
                    recipientId: currentUser.id,
                    content: 'Great job on the recent animal health reports! Keep up the excellent work.',
                    type: 'message',
                    priority: 'normal',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    readBy: [],
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessageSent = (newMessage: Message) => {
        setMessages([newMessage, ...messages]);
    };

    const filteredMessages = messages.filter((msg) => {
        const matchesSearch = msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.senderName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || msg.type === typeFilter;
        const matchesPriority = priorityFilter === 'all' || msg.priority === priorityFilter;
        return matchesSearch && matchesType && matchesPriority;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'instruction':
                return <AlertTriangle className="w-4 h-4" />;
            case 'announcement':
                return <Megaphone className="w-4 h-4" />;
            default:
                return <MessageSquare className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'instruction':
                return 'bg-yellow-500';
            case 'announcement':
                return 'bg-green-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'instruction':
                return text.instruction;
            case 'announcement':
                return text.announcement;
            default:
                return text.message;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return text.urgent;
            case 'high':
                return text.high;
            default:
                return text.normal;
        }
    };

    const getRecipientText = (msg: Message) => {
        if (msg.recipientType === 'everyone') return text.everyone;
        if (msg.recipientType === 'individual' && msg.recipientId === currentUser.id) return text.you;
        if (msg.recipientType === 'role') {
            const roleMap: any = {
                admin: t[language].admin || 'Admin',
                vet: t[language].vet || 'Vet',
                zookeeper: t[language].zookeeper || 'Zookeeper',
                officer: t[language].officer || 'Officer',
            };
            return roleMap[msg.recipientRole || ''] || msg.recipientRole;
        }
        return '';
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date().getTime();
        const messageTime = new Date(dateString).getTime();
        const diffMinutes = Math.floor((now - messageTime) / (1000 * 60));

        if (diffMinutes < 1) return text.justNow;
        if (diffMinutes < 60) return `${diffMinutes} ${text.minutesAgo}`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} ${text.hoursAgo}`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ${text.daysAgo}`;
    };

    if (isLoading) {
        return (
            <div className="text-center py-8 text-gray-500">{text.loading}</div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Message Composer (Admin/Vet only) */}
            <MessageComposer
                language={language}
                currentUser={currentUser}
                onMessageSent={handleMessageSent}
            />

            {/* Messages List */}
            <Card className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{text.title}</h3>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={text.search}
                            className="pl-10"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="sm:w-[180px]">
                            <SelectValue placeholder={text.filterByType} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{text.all}</SelectItem>
                            <SelectItem value="message">{text.message}</SelectItem>
                            <SelectItem value="instruction">{text.instruction}</SelectItem>
                            <SelectItem value="announcement">{text.announcement}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="sm:w-[180px]">
                            <SelectValue placeholder={text.filterByPriority} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{text.all}</SelectItem>
                            <SelectItem value="normal">{text.normal}</SelectItem>
                            <SelectItem value="high">{text.high}</SelectItem>
                            <SelectItem value="urgent">{text.urgent}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Messages */}
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{text.noMessages}</div>
                ) : (
                    <div className="space-y-3">
                        {filteredMessages.map((msg, index) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 ${getTypeColor(msg.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                            {getTypeIcon(msg.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-semibold text-gray-900">{msg.senderName}</span>
                                                <span className="text-sm text-gray-500">({msg.senderRole})</span>
                                                <span className="text-sm text-gray-400">•</span>
                                                <span className="text-sm text-gray-500">{getTimeAgo(msg.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <Badge className={`${getTypeColor(msg.type)} text-white text-xs`}>
                                                    {getTypeText(msg.type)}
                                                </Badge>
                                                {msg.priority !== 'normal' && (
                                                    <Badge className={`${getPriorityColor(msg.priority)} text-white text-xs`}>
                                                        {getPriorityText(msg.priority)}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-gray-500">→ {getRecipientText(msg)}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-2">{msg.content}</p>
                                            {msg.readBy.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    ✓ {text.readBy} {msg.readBy.length} {text.people}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
