import React, { useContext } from 'react';
import { AppContext, Animal } from '../App';
import { translations } from './mockData';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, Eye, Plus, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface AnimalCardProps {
  animal: Animal;
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const { language, setCurrentScreen, setSelectedAnimal } = useContext(AppContext);
  const t = translations[language];

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

  const handleAddLog = () => {
    setSelectedAnimal(animal);
    setCurrentScreen('daily-log');
  };

  const handleViewProfile = () => {
    setSelectedAnimal(animal);
    setCurrentScreen('animal-profile');
  };

  // Check if log is submitted today
  const today = new Date().toDateString();
  const isMorningDone = animal.lastMorningCheck ? new Date(animal.lastMorningCheck).toDateString() === today : false;
  const isEveningDone = animal.lastEveningCheck ? new Date(animal.lastEveningCheck).toDateString() === today : false;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-green-200">
        <div className="flex gap-4 p-4">
          {/* Animal Image */}
          <motion.div
            onClick={handleViewProfile}
            className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ImageWithFallback
              src={animal.image}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`absolute top-2 right-2 w-3 h-3 ${healthColors[animal.health]} rounded-full border-2 border-white`}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                className={`absolute inset-0 ${healthColors[animal.health]} rounded-full opacity-50`}
              />
            </motion.div>
          </motion.div>

          {/* Animal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-green-900 truncate">{animal.name}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {animal.species} #{animal.number}
                </p>
              </div>
              <Badge className={`${healthColors[animal.health]} text-white border-0 flex-shrink-0`}>
                {healthLabels[animal.health]}
              </Badge>
            </div>

            <div className="flex flex-col gap-1.5 mb-3 text-xs">
              {/* Morning Status */}
              <div className={`flex items-center gap-2 ${isMorningDone ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                {isMorningDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{(t as any).morningLog}: {isMorningDone ? (language === 'en' ? 'Done' : 'पूरा हुआ') : (language === 'en' ? 'Pending' : 'लंबित')}</span>
              </div>

              {/* Evening Status */}
              <div className={`flex items-center gap-2 ${isEveningDone ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                {isEveningDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{(t as any).eveningLog}: {isEveningDone ? (language === 'en' ? 'Done' : 'पूरा हुआ') : (language === 'en' ? 'Pending' : 'लंबित')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleAddLog}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 h-9 transition-all duration-300 hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t.addLog}
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleViewProfile}
                  size="sm"
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 h-9 transition-all duration-300 hover:shadow-lg"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t.viewProfile}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {animal.notes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded"
            >
              <p className="text-sm text-yellow-800">{animal.notes}</p>
            </motion.div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
