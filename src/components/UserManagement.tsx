import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, User } from '../App';
import { translations } from './mockData';
import { ArrowLeft, UserPlus, Edit, Trash2, Shield, Loader, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';

export function UserManagement() {
  const { language, setCurrentScreen } = useContext(AppContext);
  const t = translations[language];
  const [users, setUsers] = useState<User[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, animalsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/animals`),
      ]);
      setUsers(usersResponse.data);
      setAnimals(animalsResponse.data);
    } catch (err) {
      setError(t.processingError);
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);

  // Edit form state
  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editSelectedAnimalIds, setEditSelectedAnimalIds] = useState<string[]>([]);

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



  const handleAnimalToggle = (animalId: string, isEdit: boolean = false) => {
    const setState = isEdit ? setEditSelectedAnimalIds : setSelectedAnimalIds;
    setState(prev =>
      prev.includes(animalId) ? prev.filter(id => id !== animalId) : [...prev, animalId]
    );
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) {
      toast.error(language === 'en' ? 'Please enter a name' : 'कृपया नाम दर्ज करें');
      return;
    }
    if (!newUserRole) {
      toast.error(language === 'en' ? 'Please select a role' : 'कृपया भूमिका चुनें');
      return;
    }

    const newUserPayload = {
      name: newUserName,
      role: newUserRole as 'zookeeper' | 'admin' | 'vet' | 'officer',
      assignedAnimals: selectedAnimalIds,
      permissions: ['all'], // Default to all for now as specific permissions are being removed from UI
      password: 'default123',
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, newUserPayload);
      setUsers([...users, response.data]);
      toast.success(language === 'en' ? 'User created successfully!' : 'उपयोगकर्ता सफलतापूर्वक बनाया गया!');

      // Reset form
      setNewUserName('');
      setNewUserRole('');
      setSelectedAnimalIds([]);
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to create user' : 'उपयोगकर्ता बनाने में विफल');
    }
  };

  const handleEditUser = (user: typeof users[0] | any) => {
    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserRole(user.role);
    setEditUserPassword(user.password || '');
    setEditSelectedAnimalIds(user.assignedAnimals || []);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditUser = async () => {
    if (!editUserName.trim()) {
      toast.error(language === 'en' ? 'Please enter a name' : 'कृपया नाम दर्ज करें');
      return;
    }
    if (!editUserRole) {
      toast.error(language === 'en' ? 'Please select a role' : 'कृपया भूमिका चुनें');
      return;
    }

    try {
      const updatePayload: any = {
        name: editUserName,
        role: editUserRole,
        assignedAnimals: editSelectedAnimalIds,
      };

      if (editUserPassword) {
        updatePayload.password = editUserPassword;
      }

      await axios.put(`${API_BASE_URL}/users/${editingUserId}`, updatePayload);

      setUsers(users.map(user =>
        user.id === editingUserId
          ? {
            ...user,
            name: editUserName,
            role: editUserRole as 'zookeeper' | 'admin' | 'vet' | 'officer',
            assignedAnimals: editSelectedAnimalIds,
            password: editUserPassword || user.password,
          }
          : user
      ));

      toast.success(language === 'en' ? 'User updated successfully!' : 'उपयोगकर्ता सफलतापूर्वक अपडेट किया गया!');

      setEditingUserId(null);
      setEditUserName('');
      setEditUserRole('');
      setEditUserPassword('');
      setEditSelectedAnimalIds([]);
      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to update user' : 'उपयोगकर्ता अपडेट करने में विफल');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (userId: number | string) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success(language === 'en' ? 'User deleted successfully!' : 'उपयोगकर्ता सफलतापूर्वक हटाया गया!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to delete user' : 'उपयोगकर्ता को हटाने में विफल');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin" /></div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-screen text-red-500">
      <AlertTriangle className="w-12 h-12 mb-4" />
      <p>{error}</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10">
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
            <h1 className="text-white">{t.manageUsers}</h1>
            <p className="text-sm text-white/80">
              {language === 'en' ? 'Manage team & permissions' : 'टीम और अनुमतियाँ प्रबंधित करें'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Add User Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
              <UserPlus className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Add New User' : 'नया उपयोगकर्ता जोड़ें'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Create New User' : 'नया उपयोगकर्ता बनाएं'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Add a new team member with specific role and permissions.' : 'विशिष्ट भूमिका और अनुमतियों के साथ एक नया टीम सदस्य जोड़ें।'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{language === 'en' ? 'Name' : 'नाम'}</Label>
                <Input
                  placeholder={language === 'en' ? 'Enter name' : 'नाम दर्ज करें'}
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Role' : 'भूमिका'}</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select role' : 'भूमिका चुनें'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zookeeper">{t.zookeeper}</SelectItem>
                    <SelectItem value="vet">{t.vet}</SelectItem>
                    <SelectItem value="officer">{t.officer}</SelectItem>
                    <SelectItem value="admin">{t.admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUserRole === 'zookeeper' && (
                <div>
                  <Label className="mb-3 block">
                    {language === 'en' ? 'Assign Animals' : 'जानवर असाइन करें'}
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {animals.map((animal) => (
                      <div key={animal.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={`create-${animal.id}`}
                          checked={selectedAnimalIds.includes(animal.id)}
                          onCheckedChange={() => handleAnimalToggle(animal.id)}
                        />
                        <label htmlFor={`create-${animal.id}`} className="text-sm cursor-pointer flex-1">
                          {animal.name} ({animal.species})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  {language === 'en'
                    ? '💡 Default password will be "default123". User can change it later.'
                    : '💡 डिफ़ॉल्ट पासवर्ड "default123" होगा। उपयोगकर्ता इसे बाद में बदल सकता है।'}
                </p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateUser}
              >
                {language === 'en' ? 'Create User' : 'उपयोगकर्ता बनाएं'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Edit User' : 'उपयोगकर्ता संपादित करें'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Update user information, role, and permissions.' : 'उपयोगकर्ता जानकारी, भूमिका और अनुमतियां अपडेट करें।'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{language === 'en' ? 'Name' : 'नाम'}</Label>
                <Input
                  placeholder={language === 'en' ? 'Enter name' : 'नाम दर्ज करें'}
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Role' : 'भूमिका'}</Label>
                <Select value={editUserRole} onValueChange={setEditUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select role' : 'भूमिका चुनें'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zookeeper">{t.zookeeper}</SelectItem>
                    <SelectItem value="vet">{t.vet}</SelectItem>
                    <SelectItem value="officer">{t.officer}</SelectItem>
                    <SelectItem value="admin">{t.admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'en' ? 'Password (optional)' : 'पासवर्ड (वैकल्पिक)'}</Label>
                <Input
                  type="password"
                  placeholder={language === 'en' ? 'Leave blank to keep current' : 'वर्तमान रखने के लिए खाली छोड़ें'}
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                />
              </div>
              {editUserRole === 'zookeeper' && (
                <div>
                  <Label className="mb-3 block">
                    {language === 'en' ? 'Assign Animals' : 'जानवर असाइन करें'}
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {animals.map((animal) => (
                      <div key={animal.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={`edit-${animal.id}`}
                          checked={editSelectedAnimalIds.includes(animal.id)}
                          onCheckedChange={() => handleAnimalToggle(animal.id, true)}
                        />
                        <label htmlFor={`edit-${animal.id}`} className="text-sm cursor-pointer flex-1">
                          {animal.name} ({animal.species})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveEditUser}
              >
                {language === 'en' ? 'Save Changes' : 'परिवर्तन सहेजें'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* User List */}
        <div className="space-y-3">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 bg-white">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-lg">{user.name.charAt(0)}</span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900 truncate">{user.name}</h3>
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </div>

                    {/* Assigned Animals */}
                    <div className="space-y-2 mt-3">
                      {user.role === 'zookeeper' && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-500">
                            {language === 'en' ? 'Assigned Animals' : 'सौंपे गए जानवर'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {user.assignedAnimals && user.assignedAnimals.length > 0 ? (
                              user.assignedAnimals.map((animalId: string) => {
                                const animal = animals.find(a => a.id === animalId);
                                return (
                                  <Badge key={animalId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {animal ? animal.name : animalId}
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                {language === 'en' ? 'No animals assigned' : 'कोई जानवर नहीं सौंपा गया'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {(user.role === 'admin' || user.role === 'vet' || user.role === 'officer') && (
                        <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                          <span className="text-sm text-amber-900">
                            {language === 'en' ? 'Full System Access' : 'पूर्ण सिस्टम एक्सेस'}
                          </span>
                          <Shield className="w-4 h-4 text-amber-600" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Edit' : 'संपादित करें'}
                      </Button>
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
