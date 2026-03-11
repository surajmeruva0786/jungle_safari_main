import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LogSchedule {
    morningSubmitted: boolean;
    eveningSubmitted: boolean;
    lastChecked: string;
}

export function useLogScheduler(
    userRole: string,
    onReminderClick: () => void,
    language: 'en' | 'hi'
) {
    const [schedule, setSchedule] = useState<LogSchedule>({
        morningSubmitted: false,
        eveningSubmitted: false,
        lastChecked: new Date().toDateString(),
    });

    useEffect(() => {
        // Only run for zookeepers
        if (userRole !== 'zookeeper') return;

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Check if we need to reset daily
        const today = new Date().toDateString();
        const stored = localStorage.getItem('logSchedule');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.lastChecked !== today) {
                // Reset for new day
                const newSchedule = {
                    morningSubmitted: false,
                    eveningSubmitted: false,
                    lastChecked: today,
                };
                setSchedule(newSchedule);
                localStorage.setItem('logSchedule', JSON.stringify(newSchedule));
            } else {
                setSchedule(parsed);
            }
        }

        // Check every minute
        const interval = setInterval(() => {
            checkAndNotify();
        }, 60000); // 1 minute

        // Check immediately
        checkAndNotify();

        return () => clearInterval(interval);
    }, [userRole, schedule.morningSubmitted, schedule.eveningSubmitted]);

    const checkAndNotify = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // Morning slot: 11:00 AM - 4:00 PM
        if (hour >= 11 && hour < 16 && !schedule.morningSubmitted) {
            // Check if it's time to remind (11:00, 11:30, 12:00, etc.)
            if (minute === 0 || minute === 30) {
                showNotification('morning');
            }
        }

        // Evening slot: 4:00 PM - 11:59 PM
        if (hour >= 16 && !schedule.eveningSubmitted) {
            // Check if it's time to remind (4:00, 4:30, 5:00, etc.)
            if (minute === 0 || minute === 30) {
                showNotification('evening');
            }
        }
    };

    const showNotification = (slot: 'morning' | 'evening') => {
        const title = language === 'en'
            ? `${slot === 'morning' ? 'Morning' : 'Evening'} Log Reminder`
            : `${slot === 'morning' ? 'सुबह' : 'शाम'} लॉग रिमाइंडर`;

        const body = language === 'en'
            ? 'Please submit your daily animal observation log'
            : 'कृपया अपना दैनिक पशु अवलोकन लॉग जमा करें';

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/logo.png',
                badge: '/logo.png',
                tag: `log-reminder-${slot}`,
                requireInteraction: true,
            });

            notification.onclick = () => {
                window.focus();
                onReminderClick();
                notification.close();
            };
        }

        // Toast notification (always show)
        toast.info(title, {
            description: body,
            duration: 10000,
            action: {
                label: language === 'en' ? 'Submit Log' : 'लॉग जमा करें',
                onClick: onReminderClick,
            },
        });
    };

    const markSubmitted = (slot: 'morning' | 'evening') => {
        const newSchedule = {
            ...schedule,
            [slot === 'morning' ? 'morningSubmitted' : 'eveningSubmitted']: true,
        };
        setSchedule(newSchedule);
        localStorage.setItem('logSchedule', JSON.stringify(newSchedule));
    };

    return { schedule, markSubmitted };
}
