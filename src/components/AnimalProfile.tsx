import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Calendar, Activity, Heart, TrendingUp, FileText, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Loader } from 'lucide-react';
import { HospitalRecordsList } from './HospitalRecordsList';

interface LogEntry {
  id: string;
  animalId: string;
  createdAt: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  generalObservationText: string;
  injuriesText: string;
}

export function AnimalProfile() {
  const { language, setCurrentScreen, selectedAnimal } = useContext(AppContext);
  const t = translations[language];
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  if (!selectedAnimal) return null;

  const healthColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-red-500',
  };

  const healthLabels = {
    excellent: t.excellent,
    good: t.good,
    fair: t.fair,
    poor: t.poor,
  };

  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedAnimal) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/observations`);
        const allLogs: LogEntry[] = response.data;
        const animalLogs = allLogs.filter(log => log.animalId === selectedAnimal.id);
        setLogs(animalLogs);
      } catch (err) {
        setError(t.processingError);
        console.error("Failed to fetch logs for animal profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [selectedAnimal, t.processingError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-green-50 to-amber-50">
        <Loader className="animate-spin h-12 w-12 text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 pb-8">
      {/* Header */}
      <div className="relative">
        {/* Animal Image */}
        <div className="h-64 overflow-hidden">
          <ImageWithFallback
            src={selectedAnimal.image}
            alt={selectedAnimal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentScreen('dashboard')}
          className="absolute top-6 left-6 text-white bg-black/30 backdrop-blur-sm hover:bg-black/50"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        {/* Animal Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-white mb-1">{selectedAnimal.name}</h1>
              <p className="text-white/90">
                {selectedAnimal.species} #{selectedAnimal.number}
              </p>
            </div>
            <Badge className={`${healthColors[selectedAnimal.health]} text-white border-0`}>
              {healthLabels[selectedAnimal.health]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 text-center bg-white">
              <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Activity' : 'गतिविधि'}
              </div>
              <div className="text-green-900">Active</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 text-center bg-white">
              <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Age' : 'उम्र'}
              </div>
              <div className="text-green-900">{selectedAnimal.age}</div>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="history">
              {language === 'en' ? 'History' : 'इतिहास'}
            </TabsTrigger>
            <TabsTrigger value="hospital">
              <Stethoscope className="w-4 h-4 mr-1" />
              {language === 'en' ? 'Hospital' : 'अस्पताल'}
            </TabsTrigger>
            <TabsTrigger value="info">
              {language === 'en' ? 'Info' : 'जानकारी'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="p-6 bg-white">
              <h3 className="text-green-900 mb-4">
                {language === 'en' ? 'Health History' : 'स्वास्थ्य इतिहास'}
              </h3>

              <div className="space-y-4">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{language === 'en' ? 'No history found for this animal.' : 'इस जानवर के लिए कोई इतिहास नहीं मिला।'}</p>
                ) : (
                  logs.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 ${healthColors[record.healthStatus]} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        {index < logs.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900">{new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <Badge className={`${healthColors[record.healthStatus]} text-white border-0`}>
                            {healthLabels[record.healthStatus]}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{record.generalObservationText || record.injuriesText}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="hospital">
            <Card className="p-6 bg-white">
              <HospitalRecordsList
                animalId={selectedAnimal.id}
                animalName={selectedAnimal.name}
                language={language}
                canEdit={true}
              />
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card className="p-6 bg-white">
              <h3 className="text-green-900 mb-4">
                {language === 'en' ? 'Animal Information' : 'जानवर की जानकारी'}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Name' : 'नाम'}
                  </span>
                  <span className="text-gray-900">{selectedAnimal.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Species' : 'प्रजाति'}
                  </span>
                  <span className="text-gray-900">{selectedAnimal.species}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'ID Number' : 'आईडी नंबर'}
                  </span>
                  <span className="text-gray-900">#{selectedAnimal.number}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Assigned To' : 'सौंपा गया'}
                  </span>
                  <span className="text-gray-900">{selectedAnimal.assignedTo}</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Button */}
        <Button
          onClick={() => setCurrentScreen('daily-log')}
          className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg mt-6"
        >
          <FileText className="w-5 h-5 mr-2" />
          {language === 'en' ? 'Add Daily Log' : 'दैनिक लॉग जोड़ें'}
        </Button>
      </div>
    </div>
  );
}
