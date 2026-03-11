import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Trees, Bird } from 'lucide-react';
import logoImage from 'figma:asset/86b32134fefcfd1528280a615844f028e9ba1790.png';

interface LandingPageProps {
  onComplete: () => void;
}

export function LandingPage({ onComplete }: LandingPageProps) {
  const [phase, setPhase] = useState<'intro' | 'animals' | 'features' | 'outro'>('intro');
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    if (!autoAdvance) return;

    const timers = [
      setTimeout(() => setPhase('animals'), 2000),
      setTimeout(() => setPhase('features'), 4000),
      setTimeout(() => setPhase('outro'), 6000),
      setTimeout(() => onComplete(), 7500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [autoAdvance, onComplete]);

  const handleSkip = () => {
    setAutoAdvance(false);
    onComplete();
  };

  // Floating leaf animations
  const floatingLeaves = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    x: Math.random() * 100,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-orange-900 overflow-hidden z-50"
      onClick={handleSkip}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating leaves */}
        {floatingLeaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            className="absolute text-green-300/30"
            initial={{ 
              y: -50, 
              x: `${leaf.x}%`,
              rotate: 0,
              opacity: 0
            }}
            animate={{
              y: ['0vh', '110vh'],
              rotate: [0, 360, 720],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: leaf.duration,
              repeat: Infinity,
              delay: leaf.delay,
              ease: 'linear',
            }}
          >
            <Bird className="w-8 h-8" />
          </motion.div>
        ))}

        {/* Animated circles */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <AnimatePresence mode="wait">
          {/* Phase 1: Logo Introduction */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 1 }}
              className="text-center"
            >
              <motion.div
                className="relative inline-block"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-36 h-36 bg-gradient-to-br from-amber-100 via-orange-50 to-teal-100 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm overflow-hidden border-4 border-white/30">
                  <img src={logoImage} alt="Jungle Safari" className="w-full h-full object-cover rounded-full" />
                </div>
                
                {/* Sparkle effects */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: i % 2 === 0 ? '5%' : '85%',
                      left: i < 2 ? '5%' : '85%',
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white mt-8 drop-shadow-lg"
              >
                Jungle Safari
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-green-100 mt-2 drop-shadow"
              >
                Wildlife Management System
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: Animal Care Focus */}
          {phase === 'animals' && (
            <motion.div
              key="animals"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                className="flex justify-center gap-4 mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  className="w-20 h-20 bg-gradient-to-br from-red-400/30 to-pink-400/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-red-300/40 shadow-lg"
                >
                  <Heart className="w-10 h-10 text-red-200" fill="currentColor" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-400/30 to-orange-400/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-amber-300/40 shadow-lg"
                >
                  <Bird className="w-10 h-10 text-amber-200" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-teal-400/30 to-emerald-400/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-teal-300/40 shadow-lg"
                >
                  <Trees className="w-10 h-10 text-teal-200" />
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-amber-100 text-2xl drop-shadow-lg px-8"
              >
                Caring for Wildlife
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-teal-100 mt-2 drop-shadow px-8"
              >
                जंगल सफारी
              </motion.p>
            </motion.div>
          )}

          {/* Phase 3: Features */}
          {phase === 'features' && (
            <motion.div
              key="features"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '📱', text: 'Mobile First', textHi: 'मोबाइल फर्स्ट', gradient: 'from-blue-500/20 to-teal-500/20' },
                  { icon: '🔒', text: 'Secure', textHi: 'सुरक्षित', gradient: 'from-purple-500/20 to-pink-500/20' },
                  { icon: '🎯', text: 'Real-time', textHi: 'रियल-टाइम', gradient: 'from-orange-500/20 to-amber-500/20' },
                  { icon: '🌍', text: 'Bilingual', textHi: 'द्विभाषी', gradient: 'from-emerald-500/20 to-green-500/20' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl`}
                  >
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <div className="text-white text-sm">{feature.text}</div>
                    <div className="text-amber-200 text-xs mt-1">{feature.textHi}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 4: Outro */}
          {phase === 'outro' && (
            <motion.div
              key="outro"
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 3, ease: 'linear', repeat: Infinity },
                }}
                className="w-28 h-28 bg-gradient-to-br from-amber-100 via-orange-50 to-teal-100 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm mx-auto mb-6 overflow-hidden border-4 border-white/40"
              >
                <img src={logoImage} alt="Jungle Safari" className="w-full h-full object-cover rounded-full" />
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-amber-100 text-2xl drop-shadow-lg"
              >
                Welcome to Jungle Safari
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-teal-100 drop-shadow"
              >
                जंगल सफारी में आपका स्वागत है
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSkip}
          className="absolute bottom-8 right-8 text-white/70 hover:text-white text-sm px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
        >
          Skip →
        </motion.button>

        {/* Progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {['intro', 'animals', 'features', 'outro'].map((p, i) => (
            <motion.div
              key={p}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: phase === p ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                scale: phase === p ? 1.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Tap anywhere hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs"
        >
          Tap anywhere to skip
        </motion.p>
      </div>
    </motion.div>
  );
}
