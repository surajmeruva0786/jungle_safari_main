import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, Animal, User, Alert as AlertType } from '../App';
import { translations } from './mockData';
import { Bell, Menu, Users, Dog, AlertTriangle, Plus, UserPlus, Settings, Package, ClipboardList, Pill, Home, List, MessageSquare, Camera, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Loader } from 'lucide-react';
import { ZookeeperLogsList } from './ZookeeperLogsList';
import { ZookeeperLogsViewer } from './ZookeeperLogsViewer';
import { MessagingInterface } from './MessagingInterface';

export function AdminDashboard() {
  const { currentUser, language, setCurrentScreen, setSelectedAnimal } = useContext(AppContext);
  const t = translations[language];
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimalDialogOpen, setIsAnimalDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAllAnimalsOpen, setIsAllAnimalsOpen] = useState(false);

  // Zookeeper Logs State
  const [selectedZookeeperId, setSelectedZookeeperId] = useState<string | null>(null);
  const [selectedZookeeperName, setSelectedZookeeperName] = useState<string>('');
  const [isLogsViewerOpen, setIsLogsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'messages'>('dashboard');


  // Form state for new animal
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalEnclosure, setNewAnimalEnclosure] = useState('');
  const [newAnimalAssignedTo, setNewAnimalAssignedTo] = useState('');
  const [newAnimalHealth, setNewAnimalHealth] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [newAnimalMood, setNewAnimalMood] = useState('Normal');
  const [newAnimalImageFile, setNewAnimalImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animalsResponse, usersResponse, alertsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/animals`),
          axios.get(`${API_BASE_URL}/users`),
          axios.get(`${API_BASE_URL}/alerts`),
        ]);
        setAnimals(animalsResponse.data);
        setUsers(usersResponse.data);
        setAlerts(alertsResponse.data);
      } catch (err) {
        setError(t.processingError);
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t.processingError]);


  const stats = [
    {
      label: language === 'en' ? 'Total Animals' : 'कुल जानवर',
      value: animals.length,
      icon: Dog,
      color: 'from-green-500 to-green-600',
    },
    {
      label: language === 'en' ? 'Total Users' : 'कुल उपयोगकर्ता',
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: language === 'en' ? 'Active Alerts' : 'सक्रिय अलर्ट',
      value: alerts.length,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
    },
  ];

  const handleCreateAnimal = async () => {
    if (!newAnimalName.trim()) {
      toast.error(language === 'en' ? 'Please enter animal name' : 'कृपया जानवर का नाम दर्ज करें');
      return;
    }
    if (!newAnimalSpecies) {
      toast.error(language === 'en' ? 'Please select species' : 'कृपया प्रजाति चुनें');
      return;
    }
    if (!newAnimalAge.trim()) {
      toast.error(language === 'en' ? 'Please enter age' : 'कृपया उम्र दर्ज करें');
      return;
    }
    if (!newAnimalEnclosure.trim()) {
      toast.error(language === 'en' ? 'Please enter enclosure' : 'कृपया बाड़ा दर्ज करें');
      return;
    }
    if (!newAnimalAssignedTo) {
      toast.error(language === 'en' ? 'Please assign a zookeeper' : 'कृपया एक ज़ूकीपर असाइन करें');
      return;
    }

    let imageUrl = 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400'; // Default image

    // Upload image to Cloudinary if provided
    if (newAnimalImageFile) {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', newAnimalImageFile);

      try {
        const uploadResponse = await axios.post(`${API_BASE_URL}/upload_media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadResponse.data.url;
        toast.success(language === 'en' ? 'Image uploaded successfully' : 'छवि सफलतापूर्वक अपलोड की गई');
      } catch (uploadErr) {
        console.error('Image upload failed:', uploadErr);
        toast.error(language === 'en' ? 'Image upload failed, using default' : 'छवि अपलोड विफल, डिफ़ॉल्ट का उपयोग कर रहे हैं');
      } finally {
        setIsUploadingImage(false);
      }
    }

    const newAnimalPayload = {
      name: newAnimalName,
      species: newAnimalSpecies,
      age: newAnimalAge,
      enclosure: newAnimalEnclosure,
      image: imageUrl,
      health: newAnimalHealth,
      assignedTo: newAnimalAssignedTo,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/animals`, newAnimalPayload);
      setAnimals([response.data, ...animals]);
      toast.success(language === 'en' ? 'Animal added successfully!' : 'जानवर सफलतापूर्वक जोड़ा गया!');

      // Reset form
      setNewAnimalName('');
      setNewAnimalSpecies('');
      setNewAnimalAge('');
      setNewAnimalEnclosure('');
      setNewAnimalAssignedTo('');
      setNewAnimalHealth('good');
      setNewAnimalMood('Normal');
      setNewAnimalImageFile(null);
      setIsAnimalDialogOpen(false);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to add animal' : 'जानवर जोड़ने में विफल');
    }
  };

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
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Loader className="animate-spin h-12 w-12 text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-amber-50 to-orange-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
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
              <SheetContent side="left" className="w-[280px] bg-gradient-to-b from-amber-50 to-orange-50">
                <SheetHeader>
                  <SheetTitle className="text-amber-900">
                    {language === 'en' ? 'Admin Menu' : 'एडमिन मेनू'}
                  </SheetTitle>
                  <SheetDescription className="text-amber-700">
                    {language === 'en' ? 'Navigation & Settings' : 'नेविगेशन और सेटिंग्स'}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentScreen('adminDashboard');
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
                      setCurrentScreen('userManagement');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'User Management' : 'उपयोगकर्ता प्रबंधन'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentScreen('inventory');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Package className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Inventory' : 'इन्वेंटरी'}
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
              <div className="text-sm opacity-90">Admin Panel</div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
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
            className={activeTab === 'dashboard' ? 'bg-white text-amber-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Dashboard' : 'डैशबोर्ड'}
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'default' : 'ghost'}
            className={activeTab === 'logs' ? 'bg-white text-amber-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('logs')}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Zookeeper Logs' : 'चिड़ियाघर कर्मचारी लॉग'}
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'default' : 'ghost'}
            className={activeTab === 'messages' ? 'bg-white text-amber-600' : 'text-white hover:bg-white/20'}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Messages' : 'संदेश'}
          </Button>
        </div>

        <h1 className="text-white">
          {activeTab === 'dashboard'
            ? (language === 'en' ? 'Dashboard Overview' : 'डैशबोर्ड अवलोकन')
            : activeTab === 'logs'
              ? (language === 'en' ? 'Zookeeper Logs' : 'चिड़ियाघर कर्मचारी लॉग')
              : (language === 'en' ? 'Messages' : 'संदेश')
          }
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === 'dashboard' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`bg-gradient-to-r ${stat.color} text-white p-5`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm opacity-90 mb-1">{stat.label}</div>
                          <div className="text-3xl">{stat.value}</div>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <Icon className="w-8 h-8" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="p-6 bg-white">
              <h3 className="text-amber-900 mb-4">
                {language === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setCurrentScreen('userManagement')}
                  className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <UserPlus className="w-6 h-6" />
                  <span className="text-xs">{t.manageUsers}</span>
                </Button>

                <Button
                  onClick={() => setCurrentScreen('inventory')}
                  className="h-20 flex flex-col gap-2 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  <Package className="w-6 h-6" />
                  <span className="text-xs">{language === 'en' ? 'Inventory' : 'इन्वेंटरी'}</span>
                </Button>
              </div>

              {/* Add Animal Dialog - now separate */}
              <Dialog open={isAnimalDialogOpen} onOpenChange={setIsAnimalDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-14 mt-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    {t.addAnimal}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {language === 'en' ? 'Add New Animal' : 'नया जानवर जोड़ें'}
                    </DialogTitle>
                    <DialogDescription>
                      {language === 'en' ? 'Enter the details of the new animal to add to the zoo.' : 'चिड़ियाघर में जोड़ने के लिए नए जानवर का विवरण दर्ज करें।'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>{language === 'en' ? 'Animal Name' : 'जानवर का नाम'}</Label>
                      <Input
                        placeholder={language === 'en' ? 'Enter animal name' : 'जानवर का नाम दर्ज करें'}
                        value={newAnimalName}
                        onChange={(e) => setNewAnimalName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'Species' : 'प्रजाति'}</Label>
                      <Select value={newAnimalSpecies} onValueChange={setNewAnimalSpecies}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'en' ? 'Select species' : 'प्रजाति चुनें'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lion">{language === 'en' ? 'Lion' : 'शेर'}</SelectItem>
                          <SelectItem value="Tiger">{language === 'en' ? 'Tiger' : 'बाघ'}</SelectItem>
                          <SelectItem value="Elephant">{language === 'en' ? 'Elephant' : 'हाथी'}</SelectItem>
                          <SelectItem value="Giraffe">{language === 'en' ? 'Giraffe' : 'जिराफ़'}</SelectItem>
                          <SelectItem value="Zebra">{language === 'en' ? 'Zebra' : 'ज़ेब्रा'}</SelectItem>
                          <SelectItem value="Monkey">{language === 'en' ? 'Monkey' : 'बंदर'}</SelectItem>
                          <SelectItem value="Bear">{language === 'en' ? 'Bear' : 'भालू'}</SelectItem>
                          <SelectItem value="Deer">{language === 'en' ? 'Deer' : 'हिरण'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'Animal Photo' : 'जानवर की फोटो'}</Label>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" asChild className="w-full">
                          <Label htmlFor="animal-image-upload" className="cursor-pointer flex items-center justify-center">
                            <Camera className="w-4 h-4 mr-2" />
                            {newAnimalImageFile ? newAnimalImageFile.name : (language === 'en' ? 'Take/Upload Photo' : 'फोटो लें/अपलोड करें')}
                          </Label>
                        </Button>
                        <input
                          id="animal-image-upload"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e: any) => setNewAnimalImageFile(e.target.files?.[0] || null)}
                        />
                        {newAnimalImageFile && (
                          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(newAnimalImageFile)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {language === 'en' ? 'Optional: Add a photo for the animal card' : 'वैकल्पिक: जानवर कार्ड के लिए फोटो जोड़ें'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'Age' : 'उम्र'}</Label>
                      <Input
                        placeholder={language === 'en' ? 'e.g., 5 years' : 'जैसे, 5 साल'}
                        value={newAnimalAge}
                        onChange={(e) => setNewAnimalAge(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'Enclosure' : 'बाड़ा'}</Label>
                      <Input
                        placeholder={language === 'en' ? 'e.g., A-12' : 'जैसे, A-12'}
                        value={newAnimalEnclosure}
                        onChange={(e) => setNewAnimalEnclosure(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'Initial Health' : 'प्रारंभिक स्वास्थ्य'}</Label>
                      <Select value={newAnimalHealth} onValueChange={(v) => setNewAnimalHealth(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">{t.excellent}</SelectItem>
                          <SelectItem value="good">{t.good}</SelectItem>
                          <SelectItem value="fair">{t.fair}</SelectItem>
                          <SelectItem value="poor">{t.poor}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'Assign To' : 'को सौंपें'}</Label>
                      <Select value={newAnimalAssignedTo} onValueChange={setNewAnimalAssignedTo}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'en' ? 'Select zookeeper' : 'चिड़ियाघर कीपर चुनें'} />
                        </SelectTrigger>
                        <SelectContent>
                          {users.filter(u => u.role === 'zookeeper').map((keeper) => (
                            <SelectItem key={keeper.id} value={keeper.name}>{keeper.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleCreateAnimal}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'en' ? 'Uploading...' : 'अपलोड हो रहा है...'}
                        </>
                      ) : (
                        language === 'en' ? 'Add Animal' : 'जानवर जोड़ें'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>

            {/* Active Alerts */}
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-900">{t.alerts}</h3>
                <Badge className="bg-red-500 text-white">{alerts.length} {language === 'en' ? 'New' : 'नया'}</Badge>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-red-900 font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.animalName} • {alert.location}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-gray-500 hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismissAlert(alert.id);
                          }}
                        >
                          {language === 'en' ? 'Dismiss' : 'खारिज करें'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                {language === 'en' ? 'View All Alerts' : 'सभी अलर्ट देखें'}
              </Button>
            </Card>

            {/* Recent Users */}
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-900">
                  {language === 'en' ? 'Team Members' : 'टीम के सदस्य'}
                </h3>
              </div>

              <div className="space-y-3">
                {users.slice(0, 4).map((user, index) => {
                  const roleColors = {
                    zookeeper: 'bg-green-100 text-green-800',
                    admin: 'bg-amber-100 text-amber-800',
                    vet: 'bg-blue-100 text-blue-800',
                    officer: 'bg-purple-100 text-purple-800',
                  };

                  const roleLabels = {
                    zookeeper: t.zookeeper,
                    admin: t.admin,
                    vet: t.vet,
                    officer: t.officer,
                  };

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.permissions.length} {language === 'en' ? 'permissions' : 'अनुमतियाँ'}
                          </div>
                        </div>
                      </div>
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>

              <Button
                onClick={() => setCurrentScreen('userManagement')}
                variant="outline"
                className="w-full mt-4 border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                {language === 'en' ? 'Manage All Users' : 'सभी उपय���गकर्ता प्रबंधित करें'}
              </Button>
            </Card>
          </>
        ) : activeTab === 'logs' ? (
          // Logs View
          <>
            <ZookeeperLogsList
              language={language}
              onZookeeperClick={(id, name) => {
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
        <SheetContent side="bottom" className="h-[85vh] bg-gradient-to-b from-amber-50 to-orange-50">
          <SheetHeader>
            <SheetTitle className="text-amber-900">
              {language === 'en' ? 'All Animals' : 'सभी जानवर'}
            </SheetTitle>
            <SheetDescription className="text-amber-700">
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
                          <h3 className="text-amber-900">{animal.name}</h3>
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
  );
}
