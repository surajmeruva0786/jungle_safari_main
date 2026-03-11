import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AppContext, Animal, Alert } from '../App';
import { API_BASE_URL } from '../config';
import { translations } from './mockData';
import { API_BASE_URL } from '../config';
import { Bell, Menu, Apple, DollarSign, TrendingUp, Calendar, Settings, Plus, AlertTriangle, Home, List, Package, Download, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../config';
import { Button } from './ui/button';
import { API_BASE_URL } from '../config';
import { Card } from './ui/card';
import { API_BASE_URL } from '../config';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../config';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE_URL } from '../config';
import { exportToCSV, exportToPDF, prepareFeedingDataForExport, generateFeedingCostReportText } from '../utils/exportUtils';
import { API_BASE_URL } from '../config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { API_BASE_URL } from '../config';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { API_BASE_URL } from '../config';
import { Input } from './ui/input';
import { API_BASE_URL } from '../config';
import { Label } from './ui/label';
import { API_BASE_URL } from '../config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { API_BASE_URL } from '../config';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import { Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function OfficerDashboard() {
  const { currentUser, language, setCurrentScreen, setSelectedAnimal } = useContext(AppContext);
  const t = translations[language];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAllAnimalsOpen, setIsAllAnimalsOpen] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedingData, setFeedingData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animalsResponse, alertsResponse, feedingResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/animals`),
          axios.get(`${API_BASE_URL}/alerts`),
          axios.get(`${API_BASE_URL}/feeding_records`),
        ]);
        const fetchedAnimals: Animal[] = animalsResponse.data;
        setAlerts(alertsResponse.data);
        setAnimals(fetchedAnimals);
        setFeedingData(feedingResponse.data);

      } catch (err) {
        setError(t.processingError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [t.processingError]);

  // Form state
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [feedType, setFeedType] = useState('');
  const [amount, setAmount] = useState('');
  const [cost, setCost] = useState('');
  const [feedingStatus, setFeedingStatus] = useState('completed');

  const totalCost = feedingData.reduce((sum, item) => {
    const cost = typeof item.cost === 'number' ? item.cost : 0;
    return sum + cost;
  }, 0);

  const handleAddFeedingRecord = async () => {
    if (!selectedAnimalId) {
      toast.error(language === 'en' ? 'Please select an animal' : 'कृपया एक जानवर चुनें');
      return;
    }
    if (!feedType) {
      toast.error(language === 'en' ? 'Please select feed type' : 'कृपया भोजन का प्रकार चुनें');
      return;
    }
    if (!amount.trim()) {
      toast.error(language === 'en' ? 'Please enter amount' : 'कृपया मात्रा दर्ज करें');
      return;
    }
    if (!cost.trim()) {
      toast.error(language === 'en' ? 'Please enter cost' : 'कृपया लागत दर्ज करें');
      return;
    }

    const newRecordPayload = {
      animalId: selectedAnimalId,
      amount: amount,
      cost: parseInt(cost),
      status: feedingStatus as 'completed' | 'pending',
      feedType: feedType,
      recordedBy: currentUser?.name || 'Unknown',
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/feeding_records`, newRecordPayload);
      setFeedingData([response.data, ...feedingData]);
      toast.success(language === 'en' ? 'Feeding record added successfully!' : 'भोजन रिकॉर्ड सफलतापूर्वक जोड़ा गया!');
      
      // Reset form
      setSelectedAnimalId('');
      setFeedType('');
      setAmount('');
      setCost('');
      setFeedingStatus('completed');
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to add record' : 'रिकॉर्ड जोड़ने में विफल');
    }
  };

  const handleMarkAsComplete = async (recordId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/feeding_records/${recordId}`, { status: 'completed' });
      setFeedingData(feedingData.map(item => item.id === recordId ? { ...item, status: 'completed' } : item));
      toast.success(language === 'en' ? 'Marked as fed!' : 'खिलाया हुआ चिह्नित किया!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to update record' : 'रिकॉर्ड अपडेट करने में विफल');
    }
  };

  const handleExportCSV = () => {
    const data = prepareFeedingDataForExport(feedingData);
    exportToCSV(data, `feeding-records-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Feeding records exported to CSV!' : 'भोजन रिकॉर्ड CSV में निर्यात किए गए!');
  };

  const handleExportPDF = async () => {
    const report = generateFeedingCostReportText(feedingData);
    await exportToPDF(report, `feeding-records-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Feeding records exported to PDF!' : 'भोजन रिकॉर्ड PDF में निर्यात किए गए!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <Loader className="animate-spin h-12 w-12 text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-pink-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
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
              <SheetContent side="left" className="bg-gradient-to-b from-purple-50 to-pink-50">
                <SheetHeader>
                  <SheetTitle className="text-purple-900">
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
                <div className="mt-4 border-t pt-4">
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-purple-200 text-purple-800"
                    onClick={() => { setCurrentScreen('shared-logs'); setIsMenuOpen(false); }}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Shared Log Viewer' : 'साझा लॉग व्यूअर'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <div className="text-sm opacity-90">
                {language === 'en' ? 'Forest Officer' : 'वन अधिकारी'}
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
              <SheetContent className="bg-gradient-to-b from-purple-50 to-pink-50">
                <SheetHeader>
                  <SheetTitle className="text-purple-900">
                    {language === 'en' ? 'Notifications' : 'सूचनाएं'}
                  </SheetTitle>
                  <SheetDescription>
                    {language === 'en' ? 'View active alerts and notifications' : 'सक्रिय अलर्ट और सूचनाएं देखें'}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {alerts.length === 0 ? (
                    <p className="text-purple-700 text-center py-8">
                      {language === 'en' ? 'No active alerts' : 'कोई सक्रिय अलर्ट नहीं'}
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <Card key={alert.id} className="p-3 border-l-4 border-orange-500">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-orange-900">{alert.message}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {alert.animalName} • {alert.location}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(alert.createdAt).toLocaleTimeString()}</p>
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

        <h1 className="text-white">
          {language === 'en' ? 'Feeding & Costs' : 'भोजन और लागत'}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Feeding Record Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Add Feeding Record' : 'भोजन रिकॉर्ड जोड़ें'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Add Feeding Record' : 'भोजन रिकॉर्ड जोड़ें'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Record feeding details including animal, feed type, amount, and cost.' : 'जानवर, भोजन का प्रकार, मात्रा और लागत सहित भोजन विवरण रिकॉर्ड करें।'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{language === 'en' ? 'Select Animal' : 'जानवर चुनें'}</Label>
                <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Choose animal' : 'जानवर चुनें'} />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.name} - {animal.species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{language === 'en' ? 'Feed Type' : 'भोजन का प्रकार'}</Label>
                <Select value={feedType} onValueChange={setFeedType}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select feed type' : 'भोजन का प्रकार चुनें'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meat">{language === 'en' ? 'Meat' : 'मांस'}</SelectItem>
                    <SelectItem value="Vegetables">{language === 'en' ? 'Vegetables' : 'सब्जियाँ'}</SelectItem>
                    <SelectItem value="Fruits">{language === 'en' ? 'Fruits' : 'फल'}</SelectItem>
                    <SelectItem value="Leaves">{language === 'en' ? 'Leaves' : 'पत्तियाँ'}</SelectItem>
                    <SelectItem value="Grains">{language === 'en' ? 'Grains' : 'अनाज'}</SelectItem>
                    <SelectItem value="Fish">{language === 'en' ? 'Fish' : 'मछली'}</SelectItem>
                    <SelectItem value="Special Diet">{language === 'en' ? 'Special Diet' : 'विशेष आहार'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{language === 'en' ? 'Amount' : 'मात्रा'}</Label>
                <Input 
                  placeholder={language === 'en' ? 'e.g., 15 kg' : 'जैसे, 15 किलो'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Cost (₹)' : 'लागत (₹)'}</Label>
                <Input 
                  type="number"
                  placeholder={language === 'en' ? 'Enter cost in rupees' : 'रुपये में लागत दर्ज करें'}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Status' : 'स्थिति'}</Label>
                <Select value={feedingStatus} onValueChange={setFeedingStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">
                      {language === 'en' ? 'Completed' : 'पूर्ण'}
                    </SelectItem>
                    <SelectItem value="pending">
                      {language === 'en' ? 'Pending' : 'लंबित'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleAddFeedingRecord}
              >
                {language === 'en' ? 'Add Record' : 'रिकॉर्ड जोड़ें'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cost Summary */}
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-90 mb-1">
                {language === 'en' ? "Today's Total Cost" : 'आज की कुल लागत'}
              </div>
              <div className="text-3xl">₹{totalCost.toLocaleString()}</div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-white/20">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              {language === 'en' ? '12% less than yesterday' : 'कल से 12% कम'}
            </span>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Apple className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Fed Today' : 'आज खिलाया'}
                </div>
                <div className="text-purple-900">{feedingData.filter(f => f.status === 'completed').length}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Pending' : 'लंबित'}
                </div>
                <div className="text-purple-900">{feedingData.filter(f => f.status === 'pending').length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-12 border-2 border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Export CSV' : 'CSV निर्यात'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="h-12 border-2 border-red-600 text-red-600 hover:bg-red-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Export PDF' : 'PDF निर्यात'}
          </Button>
        </div>

        {/* Quick Action - Inventory Management */}
        <Button
          onClick={() => setCurrentScreen('inventory')}
          className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
        >
          <Package className="w-5 h-5 mr-2" />
          {language === 'en' ? 'Inventory Management' : 'इन्वेंटरी प्रबंधन'}
        </Button>

        {/* Feeding Data */}
        <Card className="p-6 bg-white">
          <h3 className="text-purple-900 mb-4">
            {language === 'en' ? 'Feeding Records' : 'भोजन रिकॉर्ड'}
          </h3>

          <div className="space-y-3">
            {feedingData.map((item, index) => {
              const animal = animals.find(a => a.id === item.animalId);
              return (<motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  item.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex gap-3">
                  {animal && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={animal.image}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-purple-900">{animal?.name || 'Unknown'}</h4>
                        <p className="text-sm text-gray-600">{animal?.species || 'N/A'}</p>
                        <p className="text-xs text-purple-600 mt-1">{item.feedType}</p>
                      </div>
                      <Badge
                        className={
                          item.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-500 text-white'
                        }
                      >
                        {item.status === 'completed'
                          ? language === 'en'
                            ? 'Fed'
                            : 'खिलाया'
                          : language === 'en'
                          ? 'Pending'
                          : 'लंबित'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      <div>
                        <div className="text-gray-500 text-xs">
                          {language === 'en' ? 'Amount' : 'मात्रा'}
                        </div>
                        <div className="text-gray-900">{item.amount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">
                          {language === 'en' ? 'Cost' : 'लागत'}
                        </div>
                        <div className="text-gray-900">₹{item.cost}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">
                          {language === 'en' ? 'Last Fed' : 'आखिरी बार'}
                        </div>
                        <div className="text-gray-900 text-xs">{new Date(item.recordedAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    {item.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsComplete(item.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {language === 'en' ? 'Mark as Fed' : 'खिलाया हुआ चिह्नित करें'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>);
            })}
          </div>
        </Card>

        {/* Monthly Summary */}
        <Card className="p-6 bg-white">
          <h3 className="text-purple-900 mb-4">
            {language === 'en' ? 'Monthly Summary' : 'मासिक सारांश'}
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-900">
                {language === 'en' ? 'Total Animals' : 'कुल जानवर'}
              </span>
              <span className="text-purple-900">{animals.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-900">
                {language === 'en' ? 'Avg. Daily Cost' : 'औसत दैनिक लागत'}
              </span>
              <span className="text-purple-900">₹{totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-900">
                {language === 'en' ? 'Monthly Estimate' : 'मासिक अनुमान'}
              </span>
              <span className="text-purple-900">₹{(totalCost * 30).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* All Animals Sheet */}
      <Sheet open={isAllAnimalsOpen} onOpenChange={setIsAllAnimalsOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-gradient-to-b from-purple-50 to-pink-50">
          <SheetHeader>
            <SheetTitle className="text-purple-900">
              {language === 'en' ? 'All Animals' : 'सभी जानवर'}
            </SheetTitle>
            <SheetDescription className="text-purple-700">
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
                          <h3 className="text-purple-900">{animal.name}</h3>
                          <p className="text-sm text-gray-600">
                            {animal.species} • #{animal.number}
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
