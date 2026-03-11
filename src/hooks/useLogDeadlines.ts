import { useEffect, useRef } from 'react';
import { Animal } from '../App';
import { toast } from 'sonner';

interface UseLogDeadlinesProps {
    animals: Animal[];
    language?: 'en' | 'hi';
}

export function useLogDeadlines({ animals, language = 'en' }: UseLogDeadlinesProps) {
    // Store the timestamp of the last notification to control frequency
    const lastNotificationTimeRef = useRef<number>(0);

    useEffect(() => {
        // If no animals loaded yet, skip check
        if (animals.length === 0) return;

        const checkDeadlines = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;

            // Schedule: 11:00 AM and 4:00 PM (16:00)
            const MORNING_DEADLINE_HOUR = 11;
            const EVENING_DEADLINE_HOUR = 16;

            const morningDeadlineMins = MORNING_DEADLINE_HOUR * 60;
            const eveningDeadlineMins = EVENING_DEADLINE_HOUR * 60;

            let pendingMorningCount = 0;
            let pendingEveningCount = 0;
            const todayStr = now.toDateString();

            // Check Morning Deadline
            if (currentTimeInMinutes >= morningDeadlineMins) {
                pendingMorningCount = animals.filter(a => {
                    const lastCheck = a.lastMorningCheck ? new Date(a.lastMorningCheck).toDateString() : '';
                    return lastCheck !== todayStr;
                }).length;
            }

            // Check Evening Deadline
            if (currentTimeInMinutes >= eveningDeadlineMins) {
                pendingEveningCount = animals.filter(a => {
                    const lastCheck = a.lastEveningCheck ? new Date(a.lastEveningCheck).toDateString() : '';
                    return lastCheck !== todayStr;
                }).length;
            }

            // Notification Logic
            if (pendingMorningCount > 0 || pendingEveningCount > 0) {
                const timeSinceLastNotification = Date.now() - lastNotificationTimeRef.current;
                const THIRTY_MINUTES_MS = 30 * 60 * 1000;

                // Check if 30 minutes have passed since last notification
                if (timeSinceLastNotification >= THIRTY_MINUTES_MS) {

                    if (pendingMorningCount > 0) {
                        const message = language === 'en'
                            ? `⚠️ Morning Log Overdue! ${pendingMorningCount} animals pending.`
                            : `⚠️ सुबह का लॉग अतिदेय! ${pendingMorningCount} जानवर लंबित।`;
                        toast.warning(message, { duration: 5000 });
                    }

                    if (pendingEveningCount > 0) {
                        const message = language === 'en'
                            ? `⚠️ Evening Log Overdue! ${pendingEveningCount} animals pending.`
                            : `⚠️ शाम का लॉग अतिदेय! ${pendingEveningCount} जानवर लंबित।`;
                        toast.warning(message, { duration: 5000 });
                    }

                    // Update last notification time
                    lastNotificationTimeRef.current = Date.now();
                }
            }
        };

        // Run check immediately on mount/update if criteria met
        checkDeadlines();

        // Set interval to check every minute
        const interval = setInterval(checkDeadlines, 60000);

        return () => clearInterval(interval);
    }, [animals, language]);
}
