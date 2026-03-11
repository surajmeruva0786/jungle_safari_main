import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AppContext, User as AppUser, Animal } from '../App';
import { API_BASE_URL } from '../config';
import { translations } from './mockData';
import { API_BASE_URL } from '../config';
import { ArrowLeft, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare, Image as ImageIcon, Calendar as CalendarIcon, User, Trash2, Edit, Download, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../config';
import { Button } from './ui/button';
import { API_BASE_URL } from '../config';
import { Card } from './ui/card';
import { API_BASE_URL } from '../config';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../config';
import { Input } from './ui/input';
import { API_BASE_URL } from '../config';
import { Label } from './ui/label';
import { API_BASE_URL } from '../config';
import { Textarea } from './ui/textarea';
import { API_BASE_URL } from '../config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { API_BASE_URL } from '../config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { API_BASE_URL } from '../config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { API_BASE_URL } from '../config';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE_URL } from '../config';
import { exportToCSV, exportToPDF, prepareTaskDataForExport } from '../utils/exportUtils';
import { API_BASE_URL } from '../config';
import { Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  animalId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  comments?: Comment[]; // Make comments optional
  attachments: string[];
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export function TaskManagement() {
  const { language, setCurrentScreen, currentUser } = useContext(AppContext);
  const t = translations[language];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksResponse, usersResponse, animalsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/tasks`),
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/animals`),
      ]);
      setTasks(tasksResponse.data);
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
  }, [t.processingError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
        <Loader className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    animalId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  const isAdmin = currentUser?.role === 'admin';
  const assignableUsers = users.filter(u => u.role === 'zookeeper' || u.role === 'vet');

  const filteredTasks = tasks
  .filter(task => {
    // If not admin, show only tasks assigned to current user
    if (!isAdmin && task.assignedTo !== currentUser?.name) return false;
    
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  })
  .sort((a, b) => {
    // Defensive sorting to prevent crashes from invalid dates
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Correctly calculate stats based on user role
  const tasksForStats = isAdmin ? tasks : tasks.filter(t => t.assignedTo === currentUser?.name);
  const pendingCount = tasksForStats.filter(t => t.status === 'pending').length;
  const inProgressCount = tasksForStats.filter(t => t.status === 'in-progress').length;
  const completedCount = tasksForStats.filter(t => t.status === 'completed').length;


  const handleCreateTask = async () => {
    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    const newTaskPayload = {
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      assignedBy: currentUser?.name || 'Admin',
      animalId: formData.animalId || undefined,
      priority: formData.priority,
      status: 'pending' as 'pending' | 'in-progress' | 'completed',
      dueDate: formData.dueDate,
      comments: [], // Add missing field
      attachments: [], // Add missing field
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, newTaskPayload);
      setTasks([response.data, ...tasks]);
      toast.success(language === 'en' ? 'Task created successfully!' : 'कार्य सफलतापूर्वक बनाया गया!');
      resetForm();
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to create task' : 'कार्य बनाने में विफल');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success(language === 'en' ? 'Task status updated!' : 'कार्य स्थिति अपडेट की गई!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to update status' : 'स्थिति अपडेट करने में विफल');
    }
  };

  const handleAddComment = async (taskId: string) => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: currentUser?.name || 'User',
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const updatedComments = [...(taskToUpdate.comments || []), newComment];
    
    try {
      await axios.put(`${API_BASE_URL}/tasks/${taskId}`, { comments: updatedComments });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, comments: updatedComments } : task));
      setCommentText('');
      toast.success(language === 'en' ? 'Comment added!' : 'टिप्पणी जोड़ी गई!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to add comment' : 'टिप्पणी जोड़ने में विफल');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success(language === 'en' ? 'Task deleted!' : 'कार्य हटाया गया!');
      setViewingTask(null);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to delete task' : 'कार्य हटाने में विफल');
    }
  };

  const handleExportCSV = () => {
    const data = prepareTaskDataForExport(filteredTasks);
    exportToCSV(data, `tasks-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Tasks exported to CSV!' : 'कार्य CSV में निर्यात किए गए!');
  };

  const handleExportPDF = async () => {
    let report = 'TASK MANAGEMENT REPORT\n\n';
    report += `Total Tasks: ${tasks.length}\n`;
    report += `Pending: ${tasks.filter(t => t.status === 'pending').length}\n`;
    report += `In Progress: ${tasks.filter(t => t.status === 'in-progress').length}\n`;
    report += `Completed: ${tasks.filter(t => t.status === 'completed').length}\n\n`;
    report += '='.repeat(60) + '\n\n';
    
    filteredTasks.forEach(task => {
      report += `${task.title}\n`;
      report += `  Assigned to: ${task.assignedTo}\n`;
      report += `  Priority: ${task.priority.toUpperCase()}\n`;
      report += `  Status: ${task.status}\n`;
      report += `  Due Date: ${task.dueDate}\n`;
      report += `  Description: ${task.description || 'N/A'}\n`;
      report += `  Comments: ${task.comments?.length || 0}\n\n`;
    });
    
    await exportToPDF(report, `tasks-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Tasks exported to PDF!' : 'कार्य PDF में निर्यात किए गए!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      animalId: '',
      priority: 'medium',
      dueDate: '',
    });
    setIsDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('default')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <div className="text-sm opacity-90">
                {isAdmin ? (language === 'en' ? 'Admin' : 'प्रशासक') : (language === 'en' ? 'Zookeeper' : 'चिड़ियाघर कीपर')}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
        </div>

        <h1 className="text-white">
          {language === 'en' ? 'Task Management' : 'कार्य प्रबंधन'}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl">{pendingCount}</div>
            <div className="text-xs opacity-90">
              {language === 'en' ? 'Pending' : 'लंबित'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl">{inProgressCount}</div>
            <div className="text-xs opacity-90">
              {language === 'en' ? 'In Progress' : 'प्रगति में'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl">{completedCount}</div>
            <div className="text-xs opacity-90">
              {language === 'en' ? 'Completed' : 'पूर्ण'}
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
            {language === 'en' ? 'Export CSV' : 'CSV निर्यात करें'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="h-12 border-2 border-red-600 text-red-600 hover:bg-red-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Export PDF' : 'PDF निर्यात करें'}
          </Button>
        </div>

        {/* Create Task Button - Admin Only */}
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Create New Task' : 'नया कार्य बनाएं'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? 'Create New Task' : 'नया कार्य बनाएं'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en' ? 'Assign a task to a zookeeper with priority and due date.' : 'प्राथमिकता और नियत तारीख के साथ एक चिड़ियाघर कीपर को कार्य सौंपें।'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{language === 'en' ? 'Task Title' : 'कार्य शीर्षक'} *</Label>
                  <Input
                    placeholder={language === 'en' ? 'e.g., Complete health checkup' : 'जैसे, स्वास्थ्य जांच पूरी करें'}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>{language === 'en' ? 'Description' : 'विवरण'}</Label>
                  <Textarea
                    placeholder={language === 'en' ? 'Task details...' : 'कार्य विवरण...'}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{language === 'en' ? 'Assign To' : 'को सौंपें'} *</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select user' : 'उपयोगकर्ता चुनें'} />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.name}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{language === 'en' ? 'Related Animal (Optional)' : 'संबंधित जानवर (वैकल्पिक)'}</Label>
                  <Select value={formData.animalId} onValueChange={(value) => setFormData({ ...formData, animalId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select animal' : 'जानवर चुनें'} />
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
                  <Label>{language === 'en' ? 'Priority' : 'प्राथमिकता'} *</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{language === 'en' ? 'Low' : 'कम'}</SelectItem>
                      <SelectItem value="medium">{language === 'en' ? 'Medium' : 'मध्यम'}</SelectItem>
                      <SelectItem value="high">{language === 'en' ? 'High' : 'उच्च'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{language === 'en' ? 'Due Date' : 'नियत तारीख'} *</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleCreateTask}
                >
                  {language === 'en' ? 'Create Task' : 'कार्य बनाएं'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{language === 'en' ? 'All' : 'सभी'}</TabsTrigger>
            <TabsTrigger value="pending">{language === 'en' ? 'Pending' : 'लंबित'}</TabsTrigger>
            <TabsTrigger value="in-progress">{language === 'en' ? 'In Progress' : 'प्रगति में'}</TabsTrigger>
            <TabsTrigger value="completed">{language === 'en' ? 'Completed' : 'पूर्ण'}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-8 text-center bg-white">
                <p className="text-gray-500">
                  {language === 'en' ? 'No tasks found' : 'कोई कार्य नहीं मिला'}
                </p>
              </Card>
            ) : (
              filteredTasks.map((task, index) => {
                const animal = animals.find(a => a.id === task.animalId);
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                        isOverdue ? 'border-2 border-red-400 bg-red-50' : 'bg-white'
                      }`}
                      onClick={() => setViewingTask(task)}
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-gray-900 pr-2">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{task.description}</p>
                              )}
                            </div>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{task.assignedTo}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span className={isOverdue ? 'text-red-600' : ''}>
                                {new Date(task.dueDate).toLocaleDateString('en-CA')}
                              </span>
                            </div>
                            {task.comments?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(task.status)} text-white text-xs`}>
                              {task.status === 'pending' ? (language === 'en' ? 'Pending' : 'लंबित') :
                               task.status === 'in-progress' ? (language === 'en' ? 'In Progress' : 'प्रगति में') :
                               (language === 'en' ? 'Completed' : 'पूर्ण')}
                            </Badge>
                            {isOverdue && (
                              <span className="text-xs text-red-600 font-medium">
                                {language === 'en' ? 'Overdue!' : 'देय!'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!viewingTask} onOpenChange={(open) => !open && setViewingTask(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {viewingTask && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingTask.title}</DialogTitle>
                <DialogDescription>
                  {language === 'en' ? 'Assigned by' : 'द्वारा सौंपा गया'}: {viewingTask.assignedBy}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{language === 'en' ? 'Description' : 'विवरण'}</Label>
                  <p className="text-sm text-gray-700 mt-1">{viewingTask.description || (language === 'en' ? 'No description' : 'कोई विवरण नहीं')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{language === 'en' ? 'Priority' : 'प्राथमिकता'}</Label>
                    <Badge className={`${getPriorityColor(viewingTask.priority)} mt-1`}>
                      {viewingTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Due Date' : 'नियत तारीख'}</Label>
                    <p className="text-sm text-gray-700 mt-1">{new Date(viewingTask.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status Update - Only for assigned user */}
                {viewingTask.assignedTo === currentUser?.name && viewingTask.status !== 'completed' && (
                  <div>
                    <Label>{language === 'en' ? 'Update Status' : 'स्थिति अपडेट करें'}</Label>
                    <div className="flex gap-2 mt-2">
                      {viewingTask.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            handleUpdateStatus(viewingTask.id, 'in-progress');
                            setViewingTask({ ...viewingTask, status: 'in-progress' });
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {language === 'en' ? 'Start Task' : 'कार्य शुरू करें'}
                        </Button>
                      )}
                      {viewingTask.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            handleUpdateStatus(viewingTask.id, 'completed');
                            setViewingTask({ ...viewingTask, status: 'completed' });
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {language === 'en' ? 'Mark Complete' : 'पूर्ण चिह्नित करें'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <Label>{language === 'en' ? 'Comments' : 'टिप्पणियाँ'} ({viewingTask.comments?.length || 0})</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {!viewingTask.comments || viewingTask.comments.length === 0 ? (
                      <p className="text-sm text-gray-500">{language === 'en' ? 'No comments yet' : 'अभी तक कोई टिप्पणी नहीं'}</p>
                    ) : (
                      [...(viewingTask.comments || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((comment) => (
                        <Card key={comment.id} className="p-3 bg-gray-50">
                          <p className="text-xs text-indigo-600">{comment.author}</p>
                          <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(comment.timestamp).toLocaleString()}</p>
                        </Card>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder={language === 'en' ? 'Add a comment...' : 'टिप्पणी जोड़ें...'}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(viewingTask.id);
                          const updatedTask = tasks.find(t => t.id === viewingTask.id);
                          if (updatedTask) setViewingTask(updatedTask);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        handleAddComment(viewingTask.id);
                        const updatedTask = tasks.find(t => t.id === viewingTask.id);
                        if (updatedTask) setViewingTask(updatedTask);
                      }}
                    >
                      {language === 'en' ? 'Add' : 'जोड़ें'}
                    </Button>
                  </div>
                </div>

                {/* Delete Task - Admin Only */}
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteTask(viewingTask.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Delete Task' : 'कार्य हटाएं'}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
