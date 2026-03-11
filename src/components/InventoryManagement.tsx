import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Plus, AlertTriangle, Package, Pill, Apple, Search, TrendingDown, Edit, Trash2, Download, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF, prepareInventoryDataForExport } from '../utils/exportUtils';
import { Loader } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'food' | 'medicine';
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestocked: string;
  expiryDate?: string;
  supplier?: string;
}

export function InventoryManagement() {
  const { language, setCurrentScreen, currentUser } = useContext(AppContext);
  const t = translations[language];

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'food' | 'medicine' | 'low'>('all');


  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      setInventory(response.data);
    } catch (err) {
      setError(t.processingError);
      console.error("Failed to fetch inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [t.processingError]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'food' as 'food' | 'medicine',
    quantity: '',
    unit: '',
    minThreshold: '',
    supplier: '',
    expiryDate: '',
  });

  // Helper function to calculate expiry status
  const getExpiryStatus = (expiryDate?: string): 'good' | 'expiring' | 'expired' => {
    if (!expiryDate) return 'good';

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired'; // Red
    if (daysUntilExpiry <= 7) return 'expiring'; // Yellow
    return 'good'; // Green
  };

  // Permission check: Admin, Vet, and Officer can manage inventory
  const canManageInventory = () => {
    return currentUser && ['admin', 'vet', 'officer'].includes(currentUser.role);
  };

  // Helper function to get color class based on expiry status
  const getExpiryColorClass = (status: 'good' | 'expiring' | 'expired'): string => {
    switch (status) {
      case 'expired': return 'bg-red-100 border-red-400';
      case 'expiring': return 'bg-yellow-100 border-yellow-400';
      case 'good': return 'bg-green-100 border-green-400';
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity < item.minThreshold);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'low') return matchesSearch && item.quantity < item.minThreshold;
    return matchesSearch && item.category === activeTab;
  });

  const handleAddOrUpdate = async () => {
    if (!formData.name || !formData.quantity || !formData.unit || !formData.minThreshold) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      minThreshold: parseInt(formData.minThreshold),
      supplier: formData.supplier,
      expiryDate: formData.expiryDate || undefined,
    };

    if (editingItem) {
      try {
        await axios.put(`${API_BASE_URL}/inventory/${editingItem.id}`, payload);
        setInventory(inventory.map(item =>
          item.id === editingItem.id ? { ...item, ...payload, lastRestocked: 'Just now' } : item
        ));
        toast.success(language === 'en' ? 'Item updated successfully!' : 'आइटम सफलतापूर्वक अपडेट किया गया!');
      } catch (err) {
        toast.error(language === 'en' ? 'Failed to update item' : 'आइटम अपडेट करने में विफल');
      }
    } else {
      try {
        const response = await axios.post(`${API_BASE_URL}/inventory`, payload);
        setInventory([response.data, ...inventory]);
        toast.success(language === 'en' ? 'Item added successfully!' : 'आइटम सफलतापूर्वक जोड़ा गया!');
      } catch (err) {
        toast.error(language === 'en' ? 'Failed to add item' : 'आइटम जोड़ने में विफल');
      }
    }

    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minThreshold: item.minThreshold.toString(),
      supplier: item.supplier || '',
      expiryDate: item.expiryDate || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/inventory/${id}`);
      setInventory(inventory.filter(item => item.id !== id));
      toast.success(language === 'en' ? 'Item deleted successfully!' : 'आइटम सफलतापूर्वक हटाया गया!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to delete item' : 'आइटम हटाने में विफल');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'food',
      quantity: '',
      unit: '',
      minThreshold: '',
      supplier: '',
      expiryDate: '',
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleRestock = async (item: InventoryItem, additionalQty: number) => {
    const updatedItem = { ...item, quantity: item.quantity + additionalQty, lastRestocked: 'Just now' };
    try {
      await axios.put(`${API_BASE_URL}/inventory/${item.id}`, {
        quantity: updatedItem.quantity,
        lastRestocked: updatedItem.lastRestocked
      });
      setInventory(inventory.map(i => i.id === item.id ? updatedItem : i));
      toast.success(language === 'en' ? `${item.name} restocked!` : `${item.name} पुनः स्टॉक किया गया!`);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to restock item' : 'आइटम को पुनः स्टॉक करने में विफल');
    }
  };

  const handleExportCSV = () => {
    const data = prepareInventoryDataForExport(inventory);
    exportToCSV(data, `inventory-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Inventory exported to CSV!' : 'इन्वेंटरी CSV में निर्यात की गई!');
  };

  const handleExportPDF = async () => {
    let report = 'INVENTORY REPORT\n\n';
    report += `Total Items: ${inventory.length}\n`;
    report += `Low Stock Items: ${lowStockItems.length}\n\n`;
    report += '='.repeat(60) + '\n\n';

    inventory.forEach(item => {
      report += `${item.name}\n`;
      report += `  Category: ${item.category}\n`;
      report += `  Quantity: ${item.quantity} ${item.unit}\n`;
      report += `  Supplier: ${item.supplier || 'N/A'}\n`;
      if (item.expiryDate) {
        report += `  Expiry: ${new Date(item.expiryDate).toLocaleDateString()}\n`;
      }
      report += `  Status: ${item.quantity < item.minThreshold ? 'LOW STOCK' : 'OK'}\n\n`;
    });

    await exportToPDF(report, `inventory-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Inventory exported to PDF!' : 'इन्वेंटरी PDF में निर्यात की गई!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Loader className="animate-spin h-12 w-12 text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-amber-50 to-orange-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <div className="text-sm opacity-90">
                {currentUser?.role === 'admin' ? (language === 'en' ? 'Admin' : 'प्रशासक') :
                  currentUser?.role === 'officer' ? (language === 'en' ? 'Forest Officer' : 'वन अधिकारी') : ''}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
        </div>

        <h1 className="text-white mb-4">
          {language === 'en' ? 'Inventory Management' : 'इन्वेंटरी प्रबंधन'}
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={language === 'en' ? 'Search items...' : 'आइटम खोजें...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/95 border-0 h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-6 h-6" />
            </div>
            <div className="text-2xl">{inventory.length}</div>
            <div className="text-sm opacity-90">
              {language === 'en' ? 'Total Items' : 'कुल आइटम'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-2xl">{lowStockItems.length}</div>
            <div className="text-sm opacity-90">
              {language === 'en' ? 'Low Stock' : 'कम स्टॉक'}
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

        {/* Add Item Button */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Add Inventory Item' : 'इन्वेंटरी आइटम जोड़ें'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? (language === 'en' ? 'Update Item' : 'आइटम अपडेट करें')
                  : (language === 'en' ? 'Add New Item' : 'नया आइटम जोड़ें')}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Enter item details including quantity, cost, and supplier information.' : 'मात्रा, लागत और आपूर्तिकर्ता की जानकारी सहित आइटम विवरण दर्ज करें।'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{language === 'en' ? 'Item Name' : 'आइटम का नाम'} *</Label>
                <Input
                  placeholder={language === 'en' ? 'e.g., Raw Meat' : 'जैसे, कच्चा मांस'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Category' : 'श्रेणी'} *</Label>
                <Select value={formData.category} onValueChange={(value: 'food' | 'medicine') => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">
                      {language === 'en' ? 'Food' : 'भोजन'}
                    </SelectItem>
                    <SelectItem value="medicine">
                      {language === 'en' ? 'Medicine' : 'दवा'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{language === 'en' ? 'Quantity' : 'मात्रा'} *</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Unit' : 'इकाई'} *</Label>
                  <Input
                    placeholder={language === 'en' ? 'kg, bottles, etc.' : 'किलो, बोतल, आदि'}
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{language === 'en' ? 'Minimum Threshold' : 'न्यूनतम सीमा'} *</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Supplier' : 'आपूर्तिकर्ता'}</Label>
                <Input
                  placeholder={language === 'en' ? 'Supplier name' : 'आपूर्तिकर्ता का नाम'}
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>

              {formData.category === 'medicine' && (
                <div>
                  <Label>{language === 'en' ? 'Expiry Date' : 'समाप्ति तिथि'}</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              )}

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleAddOrUpdate}
              >
                {editingItem
                  ? (language === 'en' ? 'Update Item' : 'आइटम अपडेट करें')
                  : (language === 'en' ? 'Add Item' : 'आइटम जोड़ें')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{language === 'en' ? 'All' : 'सभी'}</TabsTrigger>
            <TabsTrigger value="food">{language === 'en' ? 'Food' : 'भोजन'}</TabsTrigger>
            <TabsTrigger value="medicine">{language === 'en' ? 'Medicine' : 'दवा'}</TabsTrigger>
            <TabsTrigger value="low">
              {language === 'en' ? 'Low Stock' : 'कम स्टॉक'}
              {lowStockItems.length > 0 && (
                <Badge className="ml-1 bg-red-500">{lowStockItems.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredInventory.length === 0 ? (
              <Card className="p-8 text-center bg-white">
                <p className="text-gray-500">
                  {language === 'en' ? 'No items found' : 'कोई आइटम नहीं मिला'}
                </p>
              </Card>
            ) : (
              filteredInventory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-4 ${item.quantity < item.minThreshold
                    ? 'border-2 border-red-400 bg-red-50'
                    : getExpiryColorClass(getExpiryStatus(item.expiryDate))
                    }`}>
                    <div className="flex gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.category === 'food' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                        {item.category === 'food' ? (
                          <Apple className={`w-6 h-6 ${item.quantity < item.minThreshold ? 'text-red-600' : 'text-green-600'}`} />
                        ) : (
                          <Pill className={`w-6 h-6 ${item.quantity < item.minThreshold ? 'text-red-600' : 'text-blue-600'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              {item.supplier && `${item.supplier} • `}
                              {language === 'en' ? 'Restocked' : 'पुनः स्टॉक'}: {item.lastRestocked}
                            </p>
                          </div>
                          <Badge className={item.quantity < item.minThreshold ? 'bg-red-500' : 'bg-green-500'}>
                            {item.quantity} {item.unit}
                          </Badge>
                        </div>

                        {item.quantity < item.minThreshold && (
                          <div className="flex items-center gap-2 text-xs text-red-700 mb-2 bg-red-100 p-2 rounded">
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                              {language === 'en'
                                ? `Low stock! Minimum: ${item.minThreshold} ${item.unit}`
                                : `कम स्टॉक! न्यूनतम: ${item.minThreshold} ${item.unit}`}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 text-sm mb-3">
                          {item.expiryDate && (
                            <div>
                              <span className="text-gray-500 text-xs">
                                {language === 'en' ? 'Expires' : 'समाप्त'}:
                              </span>
                              <div className="text-gray-900 text-xs">{new Date(item.expiryDate).toLocaleDateString()}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleRestock(item, 50)}
                          >
                            {language === 'en' ? 'Quick Restock +50' : 'त्वरित पुनः स्टॉक +50'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
