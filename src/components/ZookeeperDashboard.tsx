import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, Animal, Alert as AlertType } from '../App';
import { translations } from './mockData';
import { AlertCircle, Bell, Plus, Search, Menu, AlertTriangle, Calendar, History, Home, List, Settings, ClipboardList, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { AnimalCard } from './AnimalCard';
import { TaskWidget } from './TaskWidget';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

import { MessagingInterface } from './MessagingInterface';
import { useLogDeadlines } from '../hooks/useLogDeadlines';

interface LogSchedule {
  morningSubmitted: boolean;
  eveningSubmitted: boolean;
  lastChecked: string;
}

interface ZookeeperDashboardProps {
  schedule: LogSchedule;
}

export function ZookeeperDashboard({ schedule }: ZookeeperDashboardProps) {


  const { currentUser, language, setCurrentScreen, setSelectedAnimal, setShowSOS } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAllAnimalsOpen, setIsAllAnimalsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages'>('dashboard');
  const t = translations[language];

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useLogDeadlines({ animals, language });


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [animalsResponse, alertsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/animals`),
          axios.get(`${API_BASE_URL}/alerts`),
        ]);
        setAnimals(animalsResponse.data);
        setAlerts(alertsResponse.data);
      } catch (err) {
        setError(t.processingError); // Using a generic error message
        console.error("Failed to fetch animals:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t.processingError]); // The empty array ensures this runs only once when the component mounts


  const myAnimals =
    currentUser?.role === 'zookeeper'
      ? animals.filter((animal) => animal.assignedTo === currentUser?.name)
      : animals; // Admins, Vets, and Officers see all animals

  const filteredAnimals = myAnimals.filter(
    (animal) =>
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.id.includes(searchQuery)
  );

  const handleDismissAlert = async (alertId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/alerts/${alertId}`);
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
      toast.success(language === 'en' ? 'Alert dismissed' : 'अलर्ट खारिज कर दिया गया');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to dismiss alert' : 'अलर्ट खारिज करने में विफल');
      console.error("Failed to dismiss alert:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-green-50 to-amber-50">
        <Loader className="animate-spin h-12 w-12 text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-green-50 to-amber-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-r from-green-600 to-green-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-gradient-to-b from-green-50 to-teal-50">
                <SheetHeader>
                  <SheetTitle className="text-green-900">
                    {language === 'en' ? 'Menu' : 'मेनू'}
                  </SheetTitle>
                  <SheetDescription>
                    {language === 'en' ? 'Navigate to different sections' : 'विभिन्न अनुभागों पर जाएं'}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentScreen('dashboard');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Home className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Dashboard' : 'डैशबोर्ड'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsAllAnimalsOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <List className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'All Animals' : 'सभी जानवर'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentScreen('logHistory');
                      setIsMenuOpen(false);
                    }}
                  >
                    <History className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Log History' : 'लॉग इतिहास'}
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === 'messages' ? 'bg-green-100' : ''}`}
                    onClick={() => {
                      setActiveTab('messages');
                      setIsMenuOpen(false);
                    }}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Messages' : 'संदेश'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentScreen('settings');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Settings' : 'सेटिंग्स'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <div className="text-sm opacity-90">
                {language === 'en' ? 'Welcome' : 'स्वागत है'}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <SheetTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 relative"
                  >
                    <Bell className="w-5 h-5" />
                    {alerts.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.5,
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }}
                        className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                      >
                        <motion.span
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-red-500 rounded-full opacity-75"
                        />
                      </motion.span>
                    )}
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent className="bg-gradient-to-b from-green-50 to-teal-50">
                <SheetHeader>
                  <SheetTitle className="text-green-900">
                    {language === 'en' ? 'Notifications' : 'सूचनाएं'}
                  </SheetTitle>
                  <SheetDescription>
                    {language === 'en' ? 'View active alerts and notifications' : 'सक्रिय अलर्ट और सूचनाएं देखें'}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {alerts.length === 0 ? (
                    <p className="text-green-700 text-center py-8">
                      {language === 'en' ? 'No active alerts' : 'कोई सक्रिय अलर्ट नहीं'}
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <Card key={alert.id} className="p-3 border-l-4 border-amber-500">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-amber-900 font-medium">{alert.message}</p>
                            <p className="text-xs text-gray-600 mt-1">{alert.animalName} • {alert.location}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                              {currentUser?.role === 'admin' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-gray-500 hover:bg-gray-200"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleDismissAlert(alert.id);
                                  }}
                                >
                                  {language === 'en' ? 'Dismiss' : 'खारिज करें'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={language === 'en' ? 'Search animals by name, ID, or type...' : 'नाम, आईडी या प्रकार से खोजें...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/95 border-0 h-12 rounded-xl shadow-sm transition-all duration-300 focus:shadow-lg focus:bg-white"
          />
        </motion.div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'messages' ? (
          /* Messages View */
          <MessagingInterface
            language={language}
            currentUser={currentUser!}
          />
        ) : (
          /* Dashboard View - All dashboard content goes here */
          <div>
            {/* Today's Tasks Widget */}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-green-900 dark:text-green-100 mb-3"
                >
                  {language === 'en' ? 'Quick Actions' : 'त्वरित क्रियाएं'}
                </motion.h3>
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={() => setCurrentScreen('logHistory')}
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:shadow-lg"
                    >
                      <History className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <span className="text-sm">{language === 'en' ? 'View History' : 'इतिहास देखें'}</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={() => setShowSOS(true)}
                      variant="outline"
                      className="w-full h-20 flex flex-col gap-2 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:shadow-lg"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                      >
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </motion.div>
                      <span className="text-sm">{language === 'en' ? 'SOS Alert' : 'SOS अलर्ट'}</span>
                    </Button>
                  </motion.div>

                </div>
              </Card>
            </motion.div>




            {/* My Animals Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-green-900 dark:text-green-100">
                  {t.myAnimals} ({filteredAnimals.length})
                </h2>
              </div>

              <div className="space-y-3">
                {filteredAnimals.map((animal, index) => (
                  <motion.div
                    key={animal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AnimalCard animal={animal} />
                  </motion.div>
                ))}
              </div>

              {filteredAnimals.length === 0 && (
                <Card className="p-8 text-center bg-white/50">
                  <p className="text-gray-500">
                    {language === 'en' ? 'No animals found' : 'कोई जानवर नहीं मिला'}
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Floating SOS Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Button
            onClick={() => setShowSOS(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl"
            size="icon"
          >
            <AlertTriangle className="w-8 h-8" />
          </Button>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around p-3">
            <Button
              variant="ghost"
              className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-green-600"
              onClick={() => setCurrentScreen('dashboard')}
            >
              <div className="w-8 h-1 bg-green-600 rounded-full mb-1"></div>
              <span className="text-xs">{t.dashboard}</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-gray-500"
              onClick={() => setCurrentScreen('settings')}
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs">{t.alerts}</span>
            </Button>
          </div>
        </div>

        {/* All Animals Sheet */}
        <Sheet open={isAllAnimalsOpen} onOpenChange={setIsAllAnimalsOpen}>
          <SheetContent side="bottom" className="h-[85vh] bg-gradient-to-b from-green-50 to-teal-50">
            <SheetHeader>
              <SheetTitle className="text-green-900">
                {language === 'en' ? 'All Animals' : 'सभी जानवर'}
              </SheetTitle>
              <SheetDescription>
                {language === 'en' ? `Total ${animals.length} animals in the zoo` : `चिड़ियाघर में कुल ${animals.length} जानवर`}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3 overflow-y-auto h-[calc(85vh-120px)] pb-6">
              {animals.map((animal, index) => (
                <motion.div
                  key={animal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedAnimal(animal);
                      setCurrentScreen('animal-profile');
                      setIsAllAnimalsOpen(false);
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={animal.image}
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-green-900">{animal.name}</h3>
                            <p className="text-sm text-gray-600">
                              {animal.species} • #{animal.number}
                            </p>
                            <p className="text-xs text-gray-500">
                              {language === 'en' ? 'Assigned to' : 'को सौंपा गया'}: {animal.assignedTo}
                            </p>
                          </div>
                          <Badge
                            className={
                              animal.health === 'excellent'
                                ? 'bg-green-500 text-white'
                                : animal.health === 'good'
                                  ? 'bg-blue-500 text-white'
                                  : animal.health === 'fair'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                            }
                          >
                            {animal.health === 'excellent'
                              ? language === 'en'
                                ? 'Excellent'
                                : 'उत्कृष्ट'
                              : animal.health === 'good'
                                ? language === 'en'
                                  ? 'Good'
                                  : 'अच्छा'
                                : animal.health === 'fair'
                                  ? language === 'en'
                                    ? 'Fair'
                                    : 'ठीक'
                                  : language === 'en'
                                    ? 'Poor'
                                    : 'खराब'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.div>
  );
}
