import React, { useContext } from 'react';
import { AppContext, Language } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Globe, Bell, LogOut, User, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { NotificationsManager } from './NotificationsManager';

export function SettingsScreen() {
  const { language, setLanguage, setCurrentScreen, currentUser, setCurrentUser, darkMode, setDarkMode } = useContext(AppContext);
  const t = translations[language];

  const handleLanguageToggle = () => {
    const newLang: Language = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    toast.success(
      newLang === 'en' ? 'Language changed to English' : 'भाषा हिंदी में बदल गई'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
    toast.success(language === 'en' ? 'Logged out successfully' : 'सफलतापूर्वक लॉगआउट किया गया');
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    toast.success(
      darkMode 
        ? (language === 'en' ? 'Light mode enabled' : 'लाइट मोड सक्षम किया गया')
        : (language === 'en' ? 'Dark mode enabled' : 'डार्क मोड सक्षम किया गया')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-white">{t.settings}</h1>
            <p className="text-sm text-white/80">
              {language === 'en' ? 'Preferences & Account' : 'वरीयताएँ और खाता'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-green-900 dark:text-green-100">{currentUser?.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 capitalize">{currentUser?.role}</p>
            </div>
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h3 className="text-green-900 dark:text-green-100 mb-4">
            {language === 'en' ? 'Language / भाषा' : 'भाषा / Language'}
          </h3>

          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between p-4 bg-green-50 dark:bg-gray-700 rounded-lg cursor-pointer"
              onClick={handleLanguageToggle}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <div className="text-green-900 dark:text-green-100">
                    {language === 'en' ? 'English' : 'हिंदी'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'en' ? 'Switch to Hindi' : 'अंग्रेज़ी में बदलें'}
                  </div>
                </div>
              </div>
              <Switch
                checked={language === 'hi'}
                onCheckedChange={handleLanguageToggle}
              />
            </motion.div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h3 className="text-green-900 dark:text-green-100 mb-4">{t.notifications}</h3>
          <NotificationsManager />
        </Card>

        {/* Appearance */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h3 className="text-green-900 dark:text-green-100 mb-4">
            {language === 'en' ? 'Appearance' : 'दिखावट'}
          </h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <Label htmlFor="dark-mode" className="text-gray-900 dark:text-gray-100 cursor-pointer">
                  {language === 'en' ? 'Dark Mode' : 'डार्क मोड'}
                </Label>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'en' 
                    ? 'Switch to dark theme' 
                    : 'डार्क थीम में स्विच करें'}
                </div>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
        </Card>

        {/* About */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h3 className="text-green-900 dark:text-green-100 mb-4">
            {language === 'en' ? 'About' : 'के बारे में'}
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Version' : 'संस्करण'}
              </span>
              <span className="text-gray-900 dark:text-gray-100">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Build' : 'बिल्ड'}
              </span>
              <span className="text-gray-900 dark:text-gray-100">2025.11.01</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Platform' : 'प्लेटफ़ॉर्म'}
              </span>
              <span className="text-gray-900 dark:text-gray-100">Mobile</span>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="w-full h-14 bg-red-500 hover:bg-red-600 shadow-lg"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t.logout} / लॉगआउट
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
          {language === 'en' 
            ? 'Jungle Safari - Wildlife Management System' 
            : 'जंगल सफारी - वन्यजीव प्रबंधन प्रणाली'}
        </div>
      </div>
    </div>
  );
}
