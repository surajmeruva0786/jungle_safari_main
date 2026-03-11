import React, { useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, Language, User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Send, Users, User as UserIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'vet' | 'zookeeper' | 'officer';
    recipientType: 'individual' | 'everyone' | 'role';
    recipientId?: string;
    recipientRole?: string;
    content: string;
    type: 'message' | 'instruction' | 'announcement';
    priority: 'normal' | 'high' | 'urgent';
    createdAt: string;
    readBy: string[];
}

interface MessageComposerProps {
    language: Language;
    currentUser: User;
    onMessageSent: (message: Message) => void;
}

export function MessageComposer({ language, currentUser, onMessageSent }: MessageComposerProps) {
    const [recipientType, setRecipientType] = useState<'individual' | 'everyone' | 'role'>('everyone');
    const [recipientId, setRecipientId] = useState<string>('');
    const [recipientRole, setRecipientRole] = useState<string>('');
    const [content, setContent] = useState('');
    const [messageType, setMessageType] = useState<'message' | 'instruction' | 'announcement'>('message');
    const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
    const [isSending, setIsSending] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    const t = {
        en: {
            title: 'Send Message',
            recipientType: 'Send To',
            everyone: 'Everyone',
            individual: 'Individual User',
            role: 'By Role',
            selectUser: 'Select User',
            selectRole: 'Select Role',
            admin: 'Admin',
            vet: 'Veterinarian',
            zookeeper: 'Zookeeper',
            officer: 'Forest Officer',
            messageType: 'Message Type',
            message: 'Message',
            instruction: 'Instruction',
            announcement: 'Announcement',
            priority: 'Priority',
            normal: 'Normal',
            high: 'High',
            urgent: 'Urgent',
            content: 'Message Content',
            contentPlaceholder: 'Type your message here...',
            characterCount: 'characters',
            send: 'Send Message',
            sending: 'Sending...',
            required: 'Please enter a message',
            success: 'Message sent successfully',
            error: 'Failed to send message',
            permissionDenied: 'You do not have permission to send messages',
        },
        hi: {
            title: 'संदेश भेजें',
            recipientType: 'प्राप्तकर्ता',
            everyone: 'सभी को',
            individual: 'व्यक्तिगत उपयोगकर्ता',
            role: 'भूमिका के अनुसार',
            selectUser: 'उपयोगकर्ता चुनें',
            selectRole: 'भूमिका चुनें',
            admin: 'प्रशासक',
            vet: 'पशु चिकित्सक',
            zookeeper: 'चिड़ियाघर कर्मचारी',
            officer: 'वन अधिकारी',
            messageType: 'संदेश प्रकार',
            message: 'संदेश',
            instruction: 'निर्देश',
            announcement: 'घोषणा',
            priority: 'प्राथमिकता',
            normal: 'सामान्य',
            high: 'उच्च',
            urgent: 'अत्यावश्यक',
            content: 'संदेश सामग्री',
            contentPlaceholder: 'अपना संदेश यहाँ लिखें...',
            characterCount: 'अक्षर',
            send: 'संदेश भेजें',
            sending: 'भेजा जा रहा है...',
            required: 'कृपया एक संदेश दर्ज करें',
            success: 'संदेश सफलतापूर्वक भेजा गया',
            error: 'संदेश भेजने में विफल',
            permissionDenied: 'आपके पास संदेश भेजने की अनुमति नहीं है',
        },
    };

    const text = t[language];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users`);
            // Backend returns a list directly, or verify if it's wrapped
            const userList = Array.isArray(response.data) ? response.data : (response.data.users || []);
            setUsers(userList);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // Fallback to mock users
            setUsers([
                { id: 'admin1', name: 'Admin Kumar', role: 'admin', email: 'admin@zoo.com' },
                { id: 'vet1', name: 'Dr. Sharma', role: 'vet', email: 'vet@zoo.com' },
                { id: 'zk1', name: 'Rajesh', role: 'zookeeper', email: 'rajesh@zoo.com' },
            ] as User[]);
        }
    };

    const handleSend = async () => {
        // Permission check
        if (currentUser.role !== 'admin' && currentUser.role !== 'vet') {
            toast.error(text.permissionDenied);
            return;
        }

        // Validation
        if (!content.trim()) {
            toast.error(text.required);
            return;
        }

        if (recipientType === 'individual' && !recipientId) {
            toast.error(text.selectUser);
            return;
        }

        if (recipientType === 'role' && !recipientRole) {
            toast.error(text.selectRole);
            return;
        }

        setIsSending(true);

        const message: Message = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role as 'admin' | 'vet' | 'zookeeper' | 'officer',
            recipientType,
            recipientId: recipientType === 'individual' ? recipientId : undefined,
            recipientRole: recipientType === 'role' ? recipientRole : undefined,
            content,
            type: messageType,
            priority,
            createdAt: new Date().toISOString(),
            readBy: [],
        };

        try {
            await axios.post(`${API_BASE_URL}/messages`, message);
            toast.success(text.success);
            onMessageSent(message);
            // Reset form
            setContent('');
            setRecipientType('everyone');
            setRecipientId('');
            setRecipientRole('');
            setMessageType('message');
            setPriority('normal');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error(text.error);
            // For development, still call onMessageSent
            onMessageSent(message);
            // Reset form
            setContent('');
        } finally {
            setIsSending(false);
        }
    };

    // Permission check - only Admin and Vet can send messages
    if (currentUser.role !== 'admin' && currentUser.role !== 'vet') {
        return null;
    }

    return (
        <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{text.title}</h3>

            <div className="space-y-4">
                {/* Recipient Type */}
                <div>
                    <Label>{text.recipientType}</Label>
                    <Select value={recipientType} onValueChange={(v: any) => setRecipientType(v)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="everyone">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {text.everyone}
                                </div>
                            </SelectItem>
                            <SelectItem value="individual">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    {text.individual}
                                </div>
                            </SelectItem>
                            <SelectItem value="role">{text.role}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Individual User Selector */}
                {recipientType === 'individual' && (
                    <div>
                        <Label>{text.selectUser}</Label>
                        <Select value={recipientId} onValueChange={setRecipientId}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={text.selectUser} />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Role Selector */}
                {recipientType === 'role' && (
                    <div>
                        <Label>{text.selectRole}</Label>
                        <Select value={recipientRole} onValueChange={setRecipientRole}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={text.selectRole} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">{text.admin}</SelectItem>
                                <SelectItem value="vet">{text.vet}</SelectItem>
                                <SelectItem value="zookeeper">{text.zookeeper}</SelectItem>
                                <SelectItem value="officer">{text.officer}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Message Type */}
                <div>
                    <Label>{text.messageType}</Label>
                    <Select value={messageType} onValueChange={(v: any) => setMessageType(v)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="message">{text.message}</SelectItem>
                            <SelectItem value="instruction">{text.instruction}</SelectItem>
                            <SelectItem value="announcement">{text.announcement}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority */}
                <div>
                    <Label>{text.priority}</Label>
                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="normal">{text.normal}</SelectItem>
                            <SelectItem value="high">{text.high}</SelectItem>
                            <SelectItem value="urgent">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    {text.urgent}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Message Content */}
                <div>
                    <Label>{text.content}</Label>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={text.contentPlaceholder}
                        className="mt-1 min-h-[120px]"
                        maxLength={500}
                    />
                    <div className="text-sm text-gray-500 mt-1 text-right">
                        {content.length}/500 {text.characterCount}
                    </div>
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={isSending || !content.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? text.sending : text.send}
                </Button>
            </div>
        </Card>
    );
}
