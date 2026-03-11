import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface NotificationPreferences {
  enabled: boolean;
  sosAlerts: boolean;
  taskReminders: boolean;
  healthAlerts: boolean;
  feedingReminders: boolean;
  medicationReminders: boolean;
  lowStockAlerts: boolean;
}

export function NotificationsManager() {
  const { language, currentUser } = useContext(AppContext);
  const t = translations[language];
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    sosAlerts: true,
    taskReminders: true,
    healthAlerts: true,
    feedingReminders: true,
    medicationReminders: true,
    lowStockAlerts: true,
  });

  useEffect(() => {
    // Check notification permission on mount
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setServiceWorkerRegistered(!!registration);
      });
    }

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error(language === 'en' 
        ? 'Service Workers are not supported in this browser' 
        : 'इस ब्राउज़र में सर्विस वर्कर्स समर्थित नहीं हैं');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered:', registration);
      setServiceWorkerRegistered(true);
      
      toast.success(language === 'en' 
        ? 'Service Worker registered successfully' 
        : 'सर्विस वर्कर सफलतापूर्वक पंजीकृत हुआ');
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      toast.error(language === 'en' 
        ? 'Failed to register Service Worker' 
        : 'सर्विस वर्कर पंजीकरण विफल रहा');
      return null;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error(language === 'en' 
        ? 'Notifications are not supported in this browser' 
        : 'इस ब्राउज़र में सूचनाएं समर्थित नहीं हैं');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast.success(language === 'en' 
          ? 'Notification permission granted!' 
          : 'सूचना अनुमति दी गई!');
        
        // Register service worker if not already registered
        if (!serviceWorkerRegistered) {
          await registerServiceWorker();
        }

        // Enable notifications in preferences
        const newPreferences = { ...preferences, enabled: true };
        setPreferences(newPreferences);
        localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));

        // Show test notification
        showTestNotification();
      } else if (permission === 'denied') {
        toast.error(language === 'en' 
          ? 'Notification permission denied' 
          : 'सूचना अनुमति अस्वीकृत');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error(language === 'en' 
        ? 'Failed to request notification permission' 
        : 'सूचना अनुमति अनुरोध विफल रहा');
    }
  };

  const showTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Jungle Safari', {
        body: language === 'en' 
          ? '🦁 Notifications are now enabled!' 
          : '🦁 सूचनाएं अब सक्षम हैं!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
      });
    }
  };

  const toggleNotifications = async () => {
    if (!preferences.enabled && notificationPermission !== 'granted') {
      await requestNotificationPermission();
    } else {
      const newPreferences = { ...preferences, enabled: !preferences.enabled };
      setPreferences(newPreferences);
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
      
      toast.success(language === 'en' 
        ? (newPreferences.enabled ? 'Notifications enabled' : 'Notifications disabled')
        : (newPreferences.enabled ? 'सूचनाएं सक्षम' : 'सूचनाएं अक्षम'));
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  // Simulate different notification types for testing
  const sendTestNotification = (type: string) => {
    if (notificationPermission !== 'granted') {
      toast.error(language === 'en' 
        ? 'Please enable notifications first' 
        : 'कृपया पहले सूचनाएं सक्षम करें');
      return;
    }

    const notifications: Record<string, { title: string; body: string; icon?: string }> = {
      sos: {
        title: language === 'en' ? '🚨 SOS Alert!' : '🚨 SOS अलर्ट!',
        body: language === 'en' 
          ? 'Emergency reported for Simba - Lion. Immediate attention required!' 
          : 'सिम्बा - शेर के लिए आपातकाल की सूचना। तत्काल ध्यान आवश्यक!',
      },
      task: {
        title: language === 'en' ? '📋 Task Reminder' : '📋 कार्य अनुस्मारक',
        body: language === 'en' 
          ? 'You have a pending task: Complete health checkup for Raja' 
          : 'आपका लंबित कार्य: राजा के लिए स्वास्थ्य जांच पूरी करें',
      },
      health: {
        title: language === 'en' ? '🏥 Health Alert' : '🏥 स्वास्थ्य अलर्ट',
        body: language === 'en' 
          ? 'Mowgli the Tiger is showing signs of reduced appetite' 
          : 'मोगली बाघ में भूख कम होने के लक्षण दिख रहे हैं',
      },
      feeding: {
        title: language === 'en' ? '🍖 Feeding Reminder' : '🍖 भोजन अनुस्मारक',
        body: language === 'en' 
          ? 'Feeding time for Dumbo - Elephant. 120kg vegetables required.' 
          : 'डंबो - हाथी के लिए भोजन का समय। 120 किलो सब्जियां आवश्यक।',
      },
      medication: {
        title: language === 'en' ? '💊 Medication Alert' : '💊 दवा अलर्ट',
        body: language === 'en' 
          ? 'Time to administer antibiotics to Simba - 500mg dosage' 
          : 'सिम्बा को एंटीबायोटिक्स देने का समय - 500mg खुराक',
      },
      stock: {
        title: language === 'en' ? '📦 Low Stock Alert' : '📦 कम स्टॉक अलर्ट',
        body: language === 'en' 
          ? 'Fish inventory is running low - only 30kg remaining' 
          : 'मछली का स्टॉक कम हो रहा है - केवल 30 किलो बचा है',
      },
    };

    const notification = notifications[type];
    if (notification) {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: `${type}-notification`,
        requireInteraction: type === 'sos', // SOS alerts require interaction
      });
      
      toast.success(language === 'en' ? 'Test notification sent!' : 'परीक्षण सूचना भेजी गई!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {preferences.enabled ? (
              <Bell className="w-6 h-6 text-green-600" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="text-gray-900">
                {language === 'en' ? 'Push Notifications' : 'पुश सूचनाएं'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'en' 
                  ? 'Receive real-time alerts and reminders' 
                  : 'रीयल-टाइम अलर्ट और अनुस्मारक प्राप्त करें'}
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={toggleNotifications}
          />
        </div>

        {notificationPermission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-900">
                  {language === 'en' 
                    ? 'Notifications are blocked. Please enable them in your browser settings.' 
                    : 'सूचनाएं अवरुद्ध हैं। कृपया उन्हें अपनी ब्राउज़र सेटिंग्स में सक्षम करें।'}
                </p>
              </div>
            </div>
          </div>
        )}

        {notificationPermission === 'granted' && serviceWorkerRegistered && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-900">
                  {language === 'en' 
                    ? 'Notifications are enabled and working!' 
                    : 'सूचनाएं सक्षम हैं और काम कर रही हैं!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {preferences.enabled && (
        <>
          <Card className="p-4">
            <h3 className="text-gray-900 mb-4">
              {language === 'en' ? 'Notification Types' : 'सूचना प्रकार'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sos" className="flex-1 cursor-pointer">
                  {language === 'en' ? 'SOS Emergency Alerts' : 'SOS आपातकालीन अलर्ट'}
                </Label>
                <Switch
                  id="sos"
                  checked={preferences.sosAlerts}
                  onCheckedChange={(checked) => updatePreference('sosAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="tasks" className="flex-1 cursor-pointer">
                  {language === 'en' ? 'Task Reminders' : 'कार्य अनुस्मारक'}
                </Label>
                <Switch
                  id="tasks"
                  checked={preferences.taskReminders}
                  onCheckedChange={(checked) => updatePreference('taskReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="health" className="flex-1 cursor-pointer">
                  {language === 'en' ? 'Health Alerts' : 'स्वास्थ्य अलर्ट'}
                </Label>
                <Switch
                  id="health"
                  checked={preferences.healthAlerts}
                  onCheckedChange={(checked) => updatePreference('healthAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="feeding" className="flex-1 cursor-pointer">
                  {language === 'en' ? 'Feeding Reminders' : 'भोजन अनुस्मारक'}
                </Label>
                <Switch
                  id="feeding"
                  checked={preferences.feedingReminders}
                  onCheckedChange={(checked) => updatePreference('feedingReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="medication" className="flex-1 cursor-pointer">
                  {language === 'en' ? 'Medication Reminders' : 'दवा अनुस्मारक'}
                </Label>
                <Switch
                  id="medication"
                  checked={preferences.medicationReminders}
                  onCheckedChange={(checked) => updatePreference('medicationReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="stock" className="flex-1 cursor-pointer">
                  {language === 'en' ? 'Low Stock Alerts' : 'कम स्टॉक अलर्ट'}
                </Label>
                <Switch
                  id="stock"
                  checked={preferences.lowStockAlerts}
                  onCheckedChange={(checked) => updatePreference('lowStockAlerts', checked)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-gray-900 mb-3">
              {language === 'en' ? 'Test Notifications' : 'परीक्षण सूचनाएं'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {language === 'en' 
                ? 'Test different notification types to see how they appear' 
                : 'विभिन्न सूचना प्रकारों का परीक्षण करें कि वे कैसे दिखाई देते हैं'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('sos')}
                disabled={!preferences.sosAlerts}
              >
                🚨 SOS
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('task')}
                disabled={!preferences.taskReminders}
              >
                📋 {language === 'en' ? 'Task' : 'कार्य'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('health')}
                disabled={!preferences.healthAlerts}
              >
                🏥 {language === 'en' ? 'Health' : 'स्वास्थ्य'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('feeding')}
                disabled={!preferences.feedingReminders}
              >
                🍖 {language === 'en' ? 'Feeding' : 'भोजन'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('medication')}
                disabled={!preferences.medicationReminders}
              >
                💊 {language === 'en' ? 'Med' : 'दवा'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendTestNotification('stock')}
                disabled={!preferences.lowStockAlerts}
              >
                📦 {language === 'en' ? 'Stock' : 'स्टॉक'}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
