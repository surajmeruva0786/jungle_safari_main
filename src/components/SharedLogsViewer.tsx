import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AppContext, Observation, Animal } from '../App';
import { API_BASE_URL } from '../config';
import { translations } from './mockData';
import { API_BASE_URL } from '../config';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../config';
import { Button } from './ui/button';
import { API_BASE_URL } from '../config';
import { Card } from './ui/card';
import { API_BASE_URL } from '../config';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../config';
import { Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE_URL } from '../config';

export function SharedLogsViewer() {
  const { currentUser, language, setCurrentScreen } = useContext(AppContext);
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedLogs, setSharedLogs] = useState<Observation[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        const [observationsResponse, animalsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/observations`),
          axios.get(`${API_BASE_URL}/animals`)
        ]);

        // Filter observations where the current user's ID is in the 'sharedWith' array
        const filteredLogs = observationsResponse.data.filter((log: Observation) =>
          log.sharedWith?.includes(currentUser.id)
        );

        setSharedLogs(filteredLogs);
        setAnimals(animalsResponse.data);
      } catch (err) {
        setError(t.processingError);
        console.error("Failed to fetch shared logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser, t.processingError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-indigo-50">
        <Loader className="animate-spin h-12 w-12 text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-white">{language === 'en' ? 'Shared Logs' : 'साझा लॉग'}</h1>
            <p className="text-sm text-white/80">
              {language === 'en' ? 'Logs shared with you for review' : 'समीक्षा के लिए आपके साथ साझा किए गए लॉग'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {sharedLogs.length === 0 ? (
          <Card className="text-center p-8 text-gray-500 bg-white">
            <p>{language === 'en' ? 'No logs have been shared with you.' : 'आपके साथ कोई लॉग साझा नहीं किया गया है।'}</p>
          </Card>
        ) : (
          sharedLogs.map((log, index) => {
            const animal = animals.find(a => a.id === log.animalId);
            return (
              <motion.div
                key={log.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 bg-white hover:bg-gray-50 transition-colors shadow-sm">
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
                          <h4 className="text-gray-900 font-semibold">{animal?.name || 'Unknown Animal'}</h4>
                          <p className="text-xs text-gray-500">
                            {language === 'en' ? 'Submitted by' : 'द्वारा प्रस्तुत'}: {log.submittedBy}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-purple-500 text-purple-600">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {log.generalObservationText || log.injuriesText || 'No detailed text.'}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`capitalize px-2 py-1 rounded-full text-white text-xs ${
                          log.healthStatus === 'poor' ? 'bg-red-500' :
                          log.healthStatus === 'fair' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}>
                          {t[log.healthStatus]}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
