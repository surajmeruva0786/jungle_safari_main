import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, Animal, Alert as AlertType, Observation } from '../App';
import { translations } from './mockData';
import { Bell, Menu, Stethoscope, FileText, Pill, Activity, Settings, AlertTriangle, Home, List, ClipboardList, MessageSquare, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { ZookeeperLogsList } from './ZookeeperLogsList';
import { ZookeeperLogsViewer } from './ZookeeperLogsViewer';
import { HospitalRecordsList } from './HospitalRecordsList';
import { MessagingInterface } from './MessagingInterface';
import { InventoryManagement } from './InventoryManagement';

export function VetDashboard() {
  const { currentUser, language, setCurrentScreen, setSelectedAnimal } = useContext(AppContext);
  const t = translations[language];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAllAnimalsOpen, setIsAllAnimalsOpen] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zookeeper Logs State
  const [selectedZookeeperId, setSelectedZookeeperId] = useState<string | null>(null);
  const [selectedZookeeperName, setSelectedZookeeperName] = useState<string>('');
  const [isLogsViewerOpen, setIsLogsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'messages' | 'records' | 'inventory'>('dashboard');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animalsResponse, alertsResponse, observationsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/animals`),
          axios.get(`${API_BASE_URL}/alerts`),
          axios.get(`${API_BASE_URL}/observations`),
        ]);
        setAnimals(animalsResponse.data);
        setAlerts(alertsResponse.data);
        setObservations(observationsResponse.data);
      } catch (err) {
        setError(t.processingError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [t.processingError]);

  const healthReports = animals.filter(
    (animal) => animal.health === 'fair' || animal.health === 'poor'
  );

  const recentLogs = observations.slice(0, 3).map(log => {
    const animal = animals.find(a => a.id === log.animalId);
    let type = 'checkup';
    if (log.imageUrl || log.videoUrl) {
      type = 'media';
    } else if (log.healthStatus === 'fair' || log.healthStatus === 'poor') {
      type = 'health';
    }
    return {
      animal: animal,
      date: new Date(log.createdAt).toLocaleString(),
      note: log.generalObservationText || log.injuriesText || 'Media log submitted.',
      type: type,
    };
  }).filter(log => log.animal); // Filter out logs where animal might not be found

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
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-blue-50 to-cyan-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
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
              <SheetContent side="left" className="bg-gradient-to-b from-blue-50 to-cyan-50">
                <SheetHeader>
                  <SheetTitle className="text-blue-900">
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
                {language === 'en' ? 'Vet Doctor' : 'पशु चिकित्सक'}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 relative"
                >
                  <Bell className="w-5 h-5" />
                  {alerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gradient-to-b from-blue-50 to-cyan-50">
                <SheetHeader>
                  <SheetTitle className="text-blue-900">
                    {language === 'en' ? 'Notifications' : 'सूचनाएं'}
                  </SheetTitle>
                  <SheetDescription>
                    {language === 'en' ? 'View active alerts and notifications' : 'सक्रिय अलर्ट और सूचनाएं देखें'}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {alerts.length === 0 ? (
                    <p className="text-blue-700 text-center py-8">
                      {language === 'en' ? 'No active alerts' : 'कोई सक्रिय अलर्ट नहीं'}
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <Card key={alert.id} className="p-3 border-l-4 border-red-500">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-red-900 font-medium">{alert.message}</p>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('settings')}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            className={activeTab === 'dashboard' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Dashboard' : 'डैशबोर्ड'}
          </Button>
          <Button
            variant={activeTab === 'records' ? 'default' : 'ghost'}
            className={activeTab === 'records' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('records')}
          >
            <FileText className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Medical Records' : 'चिकित्सा रिकॉर्ड'}
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'default' : 'ghost'}
            className={activeTab === 'logs' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('logs')}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Zookeeper Logs' : 'चिड़ियाघर कर्मचारी लॉग'}
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'default' : 'ghost'}
            className={activeTab === 'messages' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Messages' : 'संदेश'}
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            className={activeTab === 'inventory' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('inventory')}
          >
            <Package className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Inventory' : 'इन्वेंटरी'}
          </Button>
        </div>

        <h1 className="text-white">
          {activeTab === 'dashboard'
            ? (language === 'en' ? 'Health Dashboard' : 'स्वास्थ्य डैशबोर्ड')
            : activeTab === 'records'
              ? (language === 'en' ? 'Medical Records' : 'चिकित्सा रिकॉर्ड')
              : activeTab === 'logs'
                ? (language === 'en' ? 'Zookeeper Logs' : 'चिड़ियाघर कर्मचारी लॉग')
                : activeTab === 'inventory'
                  ? (language === 'en' ? 'Inventory' : 'इन्वेंटरी')
                  : (language === 'en' ? 'Messages' : 'संदेश')
          }
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === 'dashboard' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="text-2xl">{healthReports.length}</div>
                <div className="text-sm opacity-90">
                  {language === 'en' ? 'Need Attention' : 'ध्यान चाहिए'}
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="text-2xl">{animals.length - healthReports.length}</div>
                <div className="text-sm opacity-90">
                  {language === 'en' ? 'Healthy' : 'स्वस्थ'}
                </div>
              </Card>
            </div>

            {/* Quick Action - Medication Tracker */}
            <Button
              onClick={() => setCurrentScreen('medication')}
              className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg"
            >
              <Pill className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Medication & Treatment Tracker' : 'दवा और उपचार ट्रैकर'}
            </Button>

            {/* Tabs */}
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reports">
                  {t.healthReports}
                </TabsTrigger>
                <TabsTrigger value="logs">
                  {t.voiceLogs}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reports" className="space-y-3 mt-4">
                {healthReports.length > 0 ? (
                  healthReports.map((animal, index) => (
                    <motion.div
                      key={animal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="p-4 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          setSelectedAnimal(animal);
                          setCurrentScreen('animal-profile');
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
                                <h3 className="text-blue-900">{animal.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {animal.species} #{animal.number}
                                </p>
                              </div>
                              <Badge
                                className={
                                  animal.health === 'poor'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-yellow-500 text-white'
                                }
                              >
                                {animal.health === 'poor' ? t.poor : t.fair}
                              </Badge>
                            </div>
                            {animal.notes && (
                              <p className="text-sm text-gray-700 mb-2">{animal.notes}</p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 h-8"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  setCurrentScreen('medication');
                                }}
                              >
                                <Pill className="w-4 h-4 mr-1" />
                                {language === 'en' ? 'Prescribe' : 'नुस्खा'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50 h-8"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  setSelectedAnimal(animal);
                                  setCurrentScreen('daily-log');
                                }}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                {language === 'en' ? 'Add Note' : 'नोट जोड़ें'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="p-8 text-center bg-white">
                    <Stethoscope className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {language === 'en'
                        ? 'All animals are healthy!'
                        : 'सभी जानवर स्वस्थ हैं!'}
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="logs" className="space-y-3 mt-4">
                {recentLogs.map((log, index) => log.animal && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 bg-white">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={log.animal.image}
                            alt={log.animal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-blue-900 text-sm">{log.animal.name}</h3>
                              <p className="text-xs text-gray-500">{log.date}</p>
                            </div>
                            <Badge
                              className={
                                log.type === 'voice'
                                  ? 'bg-purple-100 text-purple-800'
                                  : log.type === 'health' || log.type === 'media'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {log.type === 'media' ? (language === 'en' ? 'Media' : 'मीडिया') : log.type === 'voice'
                                ? language === 'en'
                                  ? 'Voice'
                                  : 'वॉइस'
                                : log.type === 'health'
                                  ? language === 'en'
                                    ? 'Health'
                                    : 'स्वास्थ्य'
                                  : language === 'en'
                                    ? 'Checkup'
                                    : 'जांच'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{log.note}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </>
        ) : activeTab === 'records' ? (
          <HospitalRecordsList language={language} canEdit={true} animals={animals} />
        ) : activeTab === 'logs' ? (
          // Logs View
          <>
            <ZookeeperLogsList
              language={language}
              onZookeeperClick={(id: string, name: string) => {
                setSelectedZookeeperId(id);
                setSelectedZookeeperName(name);
                setIsLogsViewerOpen(true);
              }}
            />
            <ZookeeperLogsViewer
              zookeeperId={selectedZookeeperId || ''}
              zookeeperName={selectedZookeeperName}
              language={language}
              isOpen={isLogsViewerOpen}
              onClose={() => setIsLogsViewerOpen(false)}
            />
          </>
        ) : activeTab === 'inventory' ? (
          <InventoryManagement />
        ) : (
          // Messages View
          <MessagingInterface
            language={language}
            currentUser={currentUser!}
          />
        )}
      </div>

      {/* All Animals Sheet */}
      <Sheet open={isAllAnimalsOpen} onOpenChange={setIsAllAnimalsOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-gradient-to-b from-blue-50 to-cyan-50">
          <SheetHeader>
            <SheetTitle className="text-blue-900">
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
                          <h3 className="text-blue-900">{animal.name}</h3>
                          <p className="text-sm text-gray-600">
                            {animal.species}
                          </p>
                          <p className="text-xs text-gray-500">
                            {language === 'en' ? 'Enclosure' : 'बाड़ा'}: {animal.enclosure}
                          </p>
                        </div>
                        <Badge
                          className={
                            animal.health === 'good'
                              ? 'bg-green-500 text-white'
                              : animal.health === 'fair'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                          }
                        >
                          {animal.health === 'good' ? t.good : animal.health === 'fair' ? t.fair : t.poor}
                        </Badge>
                      </div>
                      {animal.notes && (
                        <p className="text-xs text-gray-600 mb-2">{animal.notes}</p>
                      )}
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>#{animal.number}</span>
                        <span>•</span>
                        <span>{language === 'en' ? 'Last fed' : 'अंतिम भोजन'}: {animal.lastFed}</span>
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
  );
}
