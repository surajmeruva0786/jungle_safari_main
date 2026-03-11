import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';

interface SubmissionStatusProps {
    morningSubmitted: boolean;
    eveningSubmitted: boolean;
    language: 'en' | 'hi';
}

export function SubmissionStatus({
    morningSubmitted,
    eveningSubmitted,
    language
}: SubmissionStatusProps) {
    const t = {
        en: {
            todayStatus: "Today's Submission Status",
            morning: 'Morning Log (11 AM)',
            evening: 'Evening Log (4 PM)',
            submitted: 'Submitted',
            pending: 'Pending',
            upcoming: 'Upcoming',
        },
        hi: {
            todayStatus: 'आज की सबमिशन स्थिति',
            morning: 'सुबह का लॉग (11 AM)',
            evening: 'शाम का लॉग (4 PM)',
            submitted: 'जमा किया गया',
            pending: 'लंबित',
            upcoming: 'आगामी',
        },
    }[language];

    const now = new Date();
    const hour = now.getHours();

    const getMorningStatus = () => {
        if (morningSubmitted) return { text: t.submitted, icon: CheckCircle, color: 'text-green-600 bg-green-50' };
        if (hour >= 11) return { text: t.pending, icon: AlertCircle, color: 'text-red-600 bg-red-50' };
        return { text: t.upcoming, icon: Clock, color: 'text-gray-400 bg-gray-50' };
    };

    const getEveningStatus = () => {
        if (eveningSubmitted) return { text: t.submitted, icon: CheckCircle, color: 'text-green-600 bg-green-50' };
        if (hour >= 16) return { text: t.pending, icon: AlertCircle, color: 'text-red-600 bg-red-50' };
        return { text: t.upcoming, icon: Clock, color: 'text-gray-400 bg-gray-50' };
    };

    const morningStatus = getMorningStatus();
    const eveningStatus = getEveningStatus();

    return (
        <Card className="p-4 bg-white shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3">{t.todayStatus}</h3>
            <div className="space-y-2">
                <div className={`flex items-center justify-between p-2 rounded ${morningStatus.color}`}>
                    <span className="text-sm font-medium">{t.morning}</span>
                    <div className="flex items-center gap-2">
                        <morningStatus.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{morningStatus.text}</span>
                    </div>
                </div>
                <div className={`flex items-center justify-between p-2 rounded ${eveningStatus.color}`}>
                    <span className="text-sm font-medium">{t.evening}</span>
                    <div className="flex items-center gap-2">
                        <eveningStatus.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{eveningStatus.text}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
