import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { ZookeeperDashboard } from './components/ZookeeperDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { VetDashboard } from './components/VetDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { DailyLogEntry } from './components/DailyLogEntry';
import { AnimalProfile } from './components/AnimalProfile';
import { UserManagement } from './components/UserManagement';
import { SettingsScreen } from './components/SettingsScreen';
import { SOSModal } from './components/SOSModal';
import { LogHistory } from './components/LogHistory';
import { InventoryManagement } from './components/InventoryManagement';
import { MedicationTracker } from './components/MedicationTracker';
import { SharedLogsViewer } from './components/SharedLogsViewer';
import { Toaster } from './components/ui/sonner';
import { AnimatePresence } from 'motion/react';
import { useLogScheduler } from './hooks/useLogScheduler';

export type UserRole = 'zookeeper' | 'admin' | 'vet' | 'officer';
export type Language = 'en' | 'hi';

export interface Animal {
  id: string;
  name: string;
  species: string;
  number?: number;
  image: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  lastChecked: string;
  assignedTo?: string;
  mood?: string;
  appetite?: string;
  notes?: string;
  enclosure?: string;
  lastFed?: string;
  lastMorningCheck?: string;
  lastEveningCheck?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  permissions: string[];
  assignedAnimals?: string[];
  password?: string;
}

export interface Observation {
  id: string;
  animalId: string;
  userId: string;
  userName: string;
  timestamp: string;
  createdAt: string;
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  generalObservationText?: string;
  injuriesText?: string;
  behaviorText?: string;
  feedingText?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Alert {
  id: string;
  type: string;
  animalName: string;
  message: string;
  location: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  selectedAnimal: Animal | null;
  setSelectedAnimal: (animal: Animal | null) => void;
  showSOS: boolean;
  setShowSOS: (show: boolean) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export const AppContext = React.createContext<AppContextType>({
  currentUser: null,
  setCurrentUser: () => { },
  language: 'en',
  setLanguage: () => { },
  currentScreen: 'login',
  setCurrentScreen: () => { },
  selectedAnimal: null,
  setSelectedAnimal: () => { },
  showSOS: false,
  setShowSOS: () => { },
  darkMode: false,
  setDarkMode: () => { },
});

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Log scheduling for zookeepers
  const { schedule, markSubmitted } = useLogScheduler(
    currentUser?.role || '',
    () => setCurrentScreen('addLog'),
    language
  );

  // Register service worker for push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  const renderScreen = () => {
    if (!currentUser) {
      return <LoginScreen />;
    }

    switch (currentScreen) {
      case 'daily-log':
        return <DailyLogEntry onLogSubmitted={markSubmitted} />;
      case 'animal-profile':
        return <AnimalProfile />;
      case 'userManagement':
        return <UserManagement />;
      case 'settings':
        return <SettingsScreen />;
      case 'logHistory':
        return <LogHistory />;
      case 'inventory':
        return <InventoryManagement />;
      case 'medication':
        return <MedicationTracker />;
      case 'shared-logs':
        return <SharedLogsViewer />;
      default:
        switch (currentUser.role) {
          case 'zookeeper':
            return <ZookeeperDashboard schedule={schedule} />;
          case 'admin':
            return <AdminDashboard />;
          case 'vet':
            return <VetDashboard />;
          case 'officer':
            return <OfficerDashboard />;
          default:
            return <ZookeeperDashboard schedule={schedule} />;
        }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        language,
        setLanguage,
        currentScreen,
        setCurrentScreen,
        selectedAnimal,
        setSelectedAnimal,
        showSOS,
        setShowSOS,
        darkMode,
        setDarkMode,
      }}
    >
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
          <AnimatePresence mode="wait">
            {showLanding ? (
              <LandingPage onComplete={() => setShowLanding(false)} />
            ) : (
              <>
                {renderScreen()}
                {showSOS && <SOSModal />}
              </>
            )}
          </AnimatePresence>
          <Toaster />
        </div>
      </div>
    </AppContext.Provider>
  );
}
