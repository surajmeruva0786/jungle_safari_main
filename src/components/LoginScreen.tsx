import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppContext, User, UserRole } from '../App';
import { UserCircle, UserCog, Stethoscope, Shield, ArrowLeft, Lock, Eye, EyeOff, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';

type LoginStep = 'role' | 'name' | 'password';

export function LoginScreen() {
  const { setCurrentUser, language, setLanguage } = useContext(AppContext);
  const [step, setStep] = useState<LoginStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [enteredName, setEnteredName] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const roles = [
    {
      role: 'zookeeper' as UserRole,
      icon: UserCircle,
      color: 'from-green-500 to-green-600',
      label: language === 'en' ? 'Zookeeper' : 'जूकीपर',
      subtitle: language === 'en' ? 'Daily animal care' : 'दैनिक देखभाल',
    },
    {
      role: 'admin' as UserRole,
      icon: UserCog,
      color: 'from-amber-500 to-amber-600',
      label: language === 'en' ? 'Admin' : 'एडमिन',
      subtitle: language === 'en' ? 'Manage system' : 'सिस्टम प्रबंधन',
    },
    {
      role: 'vet' as UserRole,
      icon: Stethoscope,
      color: 'from-blue-500 to-blue-600',
      label: language === 'en' ? 'Vet Doctor' : 'पशु चिकित्सक',
      subtitle: language === 'en' ? 'Health & treatment' : 'स्वास्थ्य देखभाल',
    },
    {
      role: 'officer' as UserRole,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      label: language === 'en' ? 'Forest Officer' : 'वन अधिकारी',
      subtitle: language === 'en' ? 'Food & costs' : 'भोजन और लागत',
    },
  ];

  useEffect(() => {
    // Fetch all users from the database when the component loads
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setAllUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error(language === 'en' ? 'Could not connect to user database.' : 'उपयोगकर्ता डेटाबेस से कनेक्ट नहीं हो सका।');
      }
    };
    fetchUsers();
  }, [language]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const usersWithRole = allUsers.filter((u) => u.role === role);
    setAvailableUsers(usersWithRole);
    setStep('name');
  };

  const handleNameSubmit = () => {
    if (!enteredName.trim()) {
      toast.error(language === 'en' ? 'Please enter your name' : 'कृपया अपना नाम दर्ज करें');
      return;
    }

    // Check if user exists
    const user = availableUsers.find((u) => u.name.toLowerCase() === enteredName.trim().toLowerCase());

    if (!user) {
      toast.error(language === 'en' ? 'User not found. Please check your name or contact admin.' : 'उपयोगकर्ता नहीं मिला। कृपया अपना नाम जांचें या व्यवस्थापक से संपर्क करें।');
      return;
    }

    setStep('password');
  };

  const handlePasswordSubmit = async () => {
    if (!enteredPassword) {
      toast.error(language === 'en' ? 'Please enter your password' : 'कृपया अपना पासवर्ड दर्ज करें');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        name: enteredName.trim(),
        password: enteredPassword,
      });

      const user = response.data;
      // Successful login
      toast.success(language === 'en' ? `Welcome, ${user.name}!` : `स्वागत है, ${user.name}!`);
      setCurrentUser(user);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error(language === 'en' ? 'Incorrect password' : 'गलत पासवर्ड');
      } else {
        toast.error(language === 'en' ? 'Login failed. Please try again.' : 'लॉगिन विफल। कृपया पुनः प्रयास करें।');
      }
      console.error("Login failed:", error);
    }
  };

  const handleBack = () => {
    if (step === 'password') {
      setStep('name');
      setEnteredPassword('');
    } else if (step === 'name') {
      setStep('role');
      setEnteredName('');
      setSelectedRole(null);
      setAvailableUsers([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="inline-block mb-6"
          >
            <div className="w-48 h-24 flex items-center justify-center">
              <img src="/logo.png" alt="Jungle Safari Logo" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          </motion.div>
          <h1 className="text-green-900 mb-2">Jungle Safari</h1>
          <p className="text-green-700">
            {language === 'en' ? 'Wildlife Management System' : 'वन्यजीव प्रबंधन प्रणाली'}
          </p>
        </div>

        {/* Language Toggle */}
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="bg-white/80 backdrop-blur-sm border-emerald-300 hover:bg-white/90"
          >
            <Languages className="w-4 h-4 mr-2" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Role Selection */}
          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-green-200">
                <h2 className="text-center text-green-900 mb-6">
                  {language === 'en' ? 'Select Your Role' : 'अपनी भूमिका चुनें'}
                </h2>

                <div className="space-y-3">
                  {roles.map((roleItem, index) => {
                    const Icon = roleItem.icon;
                    return (
                      <motion.div
                        key={roleItem.role}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          onClick={() => handleRoleSelect(roleItem.role)}
                          className={`w-full h-auto p-4 bg-gradient-to-r ${roleItem.color} hover:shadow-lg transition-all duration-300 hover:scale-105`}
                          variant="default"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="text-left flex-1">
                              <div className="text-white">{roleItem.label}</div>
                              <div className="text-white/80 text-sm">{roleItem.subtitle}</div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Name Entry */}
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="text-green-700 hover:bg-green-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-green-900">
                    {language === 'en' ? 'Enter Your Name' : 'अपना नाम दर्ज करें'}
                  </h2>
                </div>

                {/* Selected Role Display */}
                <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const roleItem = roles.find((r) => r.role === selectedRole);
                      if (!roleItem) return null;
                      const Icon = roleItem.icon;
                      return (
                        <>
                          <div className={`w-10 h-10 bg-gradient-to-r ${roleItem.color} rounded-full flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              {language === 'en' ? 'Selected Role' : 'चयनित भूमिका'}
                            </div>
                            <div className="text-green-900">{roleItem.label}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-green-900">
                      {language === 'en' ? 'Full Name' : 'पूरा नाम'}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={language === 'en' ? 'Enter your full name' : 'अपना पूरा नाम दर्ज करें'}
                      value={enteredName}
                      onChange={(e) => setEnteredName(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleNameSubmit)}
                      className="mt-2 h-12 border-green-300 focus:border-green-500 focus:ring-green-500"
                      autoFocus
                    />
                  </div>

                  {availableUsers.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm text-blue-900 mb-2">
                        {language === 'en' ? 'Available users for this role:' : 'इस भूमिका के लिए उपलब्ध उपयोगकर्ता:'}
                      </div>
                      <div className="space-y-1">
                        {availableUsers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => setEnteredName(user.name)}
                            className="text-sm text-blue-700 hover:text-blue-900 hover:underline block"
                          >
                            • {user.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleNameSubmit}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                  >
                    {language === 'en' ? 'Continue' : 'जारी रखें'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Password Entry */}
          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="text-green-700 hover:bg-green-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-green-900">
                    {language === 'en' ? 'Enter Password' : 'पासवर्ड दर्ज करें'}
                  </h2>
                </div>

                {/* User Display */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                      <span className="text-lg">{enteredName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">
                        {language === 'en' ? 'Logging in as' : 'इस रूप में लॉगिन कर रहे हैं'}
                      </div>
                      <div className="text-green-900">{enteredName}</div>
                    </div>
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-green-900">
                      {language === 'en' ? 'Password' : 'पासवर्ड'}
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={language === 'en' ? 'Enter your password' : 'अपना पासवर्ड दर्ज करें'}
                        value={enteredPassword}
                        onChange={(e) => setEnteredPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handlePasswordSubmit)}
                        className="h-12 pr-12 border-green-300 focus:border-green-500 focus:ring-green-500"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-green-600 hover:bg-green-100"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      {language === 'en'
                        ? '💡 Password is set by admin. Contact admin if you forgot your password.'
                        : '💡 पासवर्ड व्यवस्थापक द्वारा सेट किया गया है। यदि आप अपना पासवर्ड भूल गए हैं तो व्यवस्थापक से संपर्क करें।'}
                    </p>
                  </div>

                  <Button
                    onClick={handlePasswordSubmit}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                  >
                    {language === 'en' ? 'Login' : 'लॉगिन'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-6 text-sm text-green-700">
          {language === 'en'
            ? 'Designed for field-ready zoo management'
            : 'क्षेत्र-तैयार चिड़ियाघर प्रबंधन के लिए डिज़ाइन किया गया'}
        </div>
      </motion.div>
    </div>
  );
}
