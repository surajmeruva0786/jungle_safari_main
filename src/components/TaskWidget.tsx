import React, { useContext } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { Card } from './ui/card';
import { CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskWidgetProps {
  tasks: number;
}

export function TaskWidget({ tasks }: TaskWidgetProps) {
  const { language } = useContext(AppContext);
  const t = translations[language];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">{t.todaysTasks}</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{tasks}</span>
              <span className="text-white/80">{t.pendingLogs}</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
        </div>
        {tasks === 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">
              {language === 'en' ? 'All caught up!' : 'सभी पूर्ण!'}
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
