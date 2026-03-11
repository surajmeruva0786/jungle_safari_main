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
  cost: number;
  lastRestocked: string;
  expiryDate?: string;
  supplier?: string;
}

// Helper function to get expiry status
const getExpiryStatus = (expiryDate: string | undefined, language: 'en' | 'hi') => {
  if (!expiryDate) return null;

  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let bgColor = 'bg-green-100';
  let textColor = 'text-green-700';
  let borderColor = 'border-green-300';
  let statusText = language === 'en' ? 'Good' : 'à¤…à¤šà¥à¤›à¤¾';

  if (daysUntilExpiry < 0) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
    borderColor = 'border-red-300';
    statusText = language === 'en' ? 'Expired' : 'à¤¸à¤®à¤¾à¤ªà¥à¤¤';
  } else if (daysUntilExpiry <= 30) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
    borderColor = 'border-yellow-300';
    statusText = language === 'en' ? 'Expiring Soon' : 'à¤œà¤²à¥à¤¦ à¤¸à¤®à¤¾à¤ªà¥à¤¤';
  }

  return {
    bgColor,
    textColor,
    borderColor,
    statusText,
    daysUntilExpiry,
    expiryDate: expiry.toLocaleDateString(),
  };
};

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
    cost: '',
    supplier: '',
    expiryDate: '',
  });

  const lowStockItems = inventory.filter(item => item.quantity < item.minThreshold);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'low') return matchesSearch && item.quantity < item.minThreshold;
    return matchesSearch && item.category === activeTab;
  });

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost / 100), 0);

  const handleAddOrUpdate = async () => {
    if (!formData.name || !formData.quantity || !formData.unit || !formData.minThreshold || !formData.cost) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¸à¤­à¥€ à¤†à¤µà¤¶à¥à¤¯à¤• à¤«à¤¼à¥€à¤²à¥à¤¡ à¤­à¤°à¥‡à¤‚');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      minThreshold: parseInt(formData.minThreshold),
      cost: parseInt(formData.cost),
      supplier: formData.supplier,
      expiryDate: formData.expiryDate || undefined,
    };

    if (editingItem) {
      try {
        await axios.put(`${API_BASE_URL}/inventory/${editingItem.id}`, payload);
        setInventory(inventory.map(item =>
          item.id === editingItem.id ? { ...item, ...payload, lastRestocked: 'Just now' } : item
        ));
        toast.success(language === 'en' ? 'Item updated successfully!' : 'à¤†à¤‡à¤Ÿà¤® à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾!');
      } catch (err) {
        toast.error(language === 'en' ? 'Failed to update item' : 'à¤†à¤‡à¤Ÿà¤® à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¤¨à¥‡ à¤®à¥‡à¤‚ à¤µà¤¿à¤«à¤²');
      }
    } else {
      try {
        const response = await axios.post(`${API_BASE_URL}/inventory`, payload);
        setInventory([response.data, ...inventory]);
        toast.success(language === 'en' ? 'Item added successfully!' : 'à¤†à¤‡à¤Ÿà¤® à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤œà¥‹à¤¡à¤¼à¤¾ à¤—à¤¯à¤¾!');
      } catch (err) {
        toast.error(language === 'en' ? 'Failed to add item' : 'à¤†à¤‡à¤Ÿà¤® à¤œà¥‹à¤¡à¤¼à¤¨à¥‡ à¤®à¥‡à¤‚ à¤µà¤¿à¤«à¤²');
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
      cost: item.cost.toString(),
      supplier: item.supplier || '',
      expiryDate: item.expiryDate || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/inventory/${id}`);
      setInventory(inventory.filter(item => item.id !== id));
      toast.success(language === 'en' ? 'Item deleted successfully!' : 'à¤†à¤‡à¤Ÿà¤® à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤¹à¤Ÿà¤¾à¤¯à¤¾ à¤—à¤¯à¤¾!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to delete item' : 'à¤†à¤‡à¤Ÿà¤® à¤¹à¤Ÿà¤¾à¤¨à¥‡ à¤®à¥‡à¤‚ à¤µà¤¿à¤«à¤²');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'food',
      quantity: '',
      unit: '',
      minThreshold: '',
      cost: '',
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
      toast.success(language === 'en' ? `${item.name} restocked!` : `${item.name} à¤ªà¥à¤¨à¤ƒ à¤¸à¥à¤Ÿà¥‰à¤• à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾!`);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to restock item' : 'à¤†à¤‡à¤Ÿà¤® à¤•à¥‹ à¤ªà¥à¤¨à¤ƒ à¤¸à¥à¤Ÿà¥‰à¤• à¤•à¤°à¤¨à¥‡ à¤®à¥‡à¤‚ à¤µà¤¿à¤«à¤²');
    }
  };

  const handleExportCSV = () => {
    const data = prepareInventoryDataForExport(inventory);
    exportToCSV(data, `inventory-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Inventory exported to CSV!' : 'à¤‡à¤¨à¥à¤µà¥‡à¤‚à¤Ÿà¤°à¥€ CSV à¤®à¥‡à¤‚ à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤•à¥€ à¤—à¤ˆ!');
  };

  const handleExportPDF = async () => {
    let report = 'INVENTORY REPORT\n\n';
    report += `Total Items: ${inventory.length}\n`;
    report += `Low Stock Items: ${lowStockItems.length}\n`;
    report += `Total Value: â‚¹${totalValue.toLocaleString()}\n\n`;
    report += '='.repeat(60) + '\n\n';

    inventory.forEach(item => {
      report += `${item.name}\n`;
      report += `  Category: ${item.category}\n`;
      report += `  Quantity: ${item.quantity} ${item.unit}\n`;
      report += `  Cost: â‚¹${item.cost} per ${item.unit}\n`;
      report += `  Supplier: ${item.supplier || 'N/A'}\n`;
      report += `  Status: ${item.quantity < item.minThreshold ? 'LOW STOCK' : 'OK'}\n\n`;
    });

    await exportToPDF(report, `inventory-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Inventory exported to PDF!' : 'à¤‡à¤¨à¥à¤µà¥‡à¤‚à¤Ÿà¤°à¥€ PDF à¤®à¥‡à¤‚ à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤•à¥€ à¤—à¤ˆ!');
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
                {currentUser?.role === 'admin' ? (language === 'en' ? 'Admin' : 'à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤•') :
                  currentUser?.role === 'officer' ? (language === 'en' ? 'Forest Officer' : 'à¤µà¤¨ à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€') : ''}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
        </div>

        <h1 className="text-white mb-4">
          {language === 'en' ? 'Inventory Management' : 'à¤‡à¤¨à¥à¤µà¥‡à¤‚à¤Ÿà¤°à¥€ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤¨'}
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={language === 'en' ? 'Search items...' : 'à¤†à¤‡à¤Ÿà¤® à¤–à¥‹à¤œà¥‡à¤‚...'}
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
              {language === 'en' ? 'Total Items' : 'à¤•à¥à¤² à¤†à¤‡à¤Ÿà¤®'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-2xl">{lowStockItems.length}</div>
            <div className="text-sm opacity-90">
              {language === 'en' ? 'Low Stock' : 'à¤•à¤® à¤¸à¥à¤Ÿà¥‰à¤•'}
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
            {language === 'en' ? 'Export CSV' : 'CSV à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤•à¤°à¥‡à¤‚'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="h-12 border-2 border-red-600 text-red-600 hover:bg-red-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Export PDF' : 'PDF à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤•à¤°à¥‡à¤‚'}
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
              {language === 'en' ? 'Add Inventory Item' : 'à¤‡à¤¨à¥à¤µà¥‡à¤‚à¤Ÿà¤°à¥€ à¤†à¤‡à¤Ÿà¤® à¤œà¥‹à¤¡à¤¼à¥‡à¤‚'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? (language === 'en' ? 'Update Item' : 'à¤†à¤‡à¤Ÿà¤® à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚')
                  : (language === 'en' ? 'Add New Item' : 'à¤¨à¤¯à¤¾ à¤†à¤‡à¤Ÿà¤® à¤œà¥‹à¤¡à¤¼à¥‡à¤‚')}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Enter item details including quantity, cost, and supplier information.' : 'à¤®à¤¾à¤¤à¥à¤°à¤¾, à¤²à¤¾à¤—à¤¤ à¤”à¤° à¤†à¤ªà¥‚à¤°à¥à¤¤à¤¿à¤•à¤°à¥à¤¤à¤¾ à¤•à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤¸à¤¹à¤¿à¤¤ à¤†à¤‡à¤Ÿà¤® à¤µà¤¿à¤µà¤°à¤£ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{language === 'en' ? 'Item Name' : 'à¤†à¤‡à¤Ÿà¤® à¤•à¤¾ à¤¨à¤¾à¤®'} *</Label>
                <Input
                  placeholder={language === 'en' ? 'e.g., Raw Meat' : 'à¤œà¥ˆà¤¸à¥‡, à¤•à¤šà¥à¤šà¤¾ à¤®à¤¾à¤‚à¤¸'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Category' : 'à¤¶à¥à¤°à¥‡à¤£à¥€'} *</Label>
                <Select value={formData.category} onValueChange={(value: 'food' | 'medicine') => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">
                      {language === 'en' ? 'Food' : 'à¤­à¥‹à¤œà¤¨'}
                    </SelectItem>
                    <SelectItem value="medicine">
                      {language === 'en' ? 'Medicine' : 'à¤¦à¤µà¤¾'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{language === 'en' ? 'Quantity' : 'à¤®à¤¾à¤¤à¥à¤°à¤¾'} *</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{language === 'en' ? 'Unit' : 'à¤‡à¤•à¤¾à¤ˆ'} *</Label>
                  <Input
                    placeholder={language === 'en' ? 'kg, bottles, etc.' : 'à¤•à¤¿à¤²à¥‹, à¤¬à¥‹à¤¤à¤², à¤†à¤¦à¤¿'}
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{language === 'en' ? 'Minimum Threshold' : 'à¤¨à¥à¤¯à¥‚à¤¨à¤¤à¤® à¤¸à¥€à¤®à¤¾'} *</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Cost per Unit (â‚¹)' : 'à¤ªà¥à¤°à¤¤à¤¿ à¤‡à¤•à¤¾à¤ˆ à¤²à¤¾à¤—à¤¤ (â‚¹)'} *</Label>
                <Input
                  type="number"
                  placeholder="450"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Supplier' : 'à¤†à¤ªà¥‚à¤°à¥à¤¤à¤¿à¤•à¤°à¥à¤¤à¤¾'}</Label>
                <Input
                  placeholder={language === 'en' ? 'Supplier name' : 'à¤†à¤ªà¥‚à¤°à¥à¤¤à¤¿à¤•à¤°à¥à¤¤à¤¾ à¤•à¤¾ à¤¨à¤¾à¤®'}
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>

              {formData.category === 'medicine' && (
                <div>
                  <Label>{language === 'en' ? 'Expiry Date' : 'à¤¸à¤®à¤¾à¤ªà¥à¤¤à¤¿ à¤¤à¤¿à¤¥à¤¿'}</Label>
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
                  ? (language === 'en' ? 'Update Item' : 'à¤†à¤‡à¤Ÿà¤® à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚')
                  : (language === 'en' ? 'Add Item' : 'à¤†à¤‡à¤Ÿà¤® à¤œà¥‹à¤¡à¤¼à¥‡à¤‚')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{language === 'en' ? 'All' : 'à¤¸à¤­à¥€'}</TabsTrigger>
            <TabsTrigger value="food">{language === 'en' ? 'Food' : 'à¤­à¥‹à¤œà¤¨'}</TabsTrigger>
            <TabsTrigger value="medicine">{language === 'en' ? 'Medicine' : 'à¤¦à¤µà¤¾'}</TabsTrigger>
            <TabsTrigger value="low">
              {language === 'en' ? 'Low Stock' : 'à¤•à¤® à¤¸à¥à¤Ÿà¥‰à¤•'}
              {lowStockItems.length > 0 && (
                <Badge className="ml-1 bg-red-500">{lowStockItems.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredInventory.length === 0 ? (
              <Card className="p-8 text-center bg-white">
                <p className="text-gray-500">
                  {language === 'en' ? 'No items found' : 'à¤•à¥‹à¤ˆ à¤†à¤‡à¤Ÿà¤® à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾'}
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
                  <Card className={`p-4 ${item.quantity < item.minThreshold ? 'border-2 border-red-400 bg-red-50' : 'bg-white'}`}>
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
                              {item.supplier && `${item.supplier} â€¢ `}
                              {language === 'en' ? 'Restocked' : 'à¤ªà¥à¤¨à¤ƒ à¤¸à¥à¤Ÿà¥‰à¤•'}: {item.lastRestocked}
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
                                : `à¤•à¤® à¤¸à¥à¤Ÿà¥‰à¤•! à¤¨à¥à¤¯à¥‚à¤¨à¤¤à¤®: ${item.minThreshold} ${item.unit}`}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-gray-500 text-xs">
                              {language === 'en' ? 'Cost/Unit' : 'à¤²à¤¾à¤—à¤¤/à¤‡à¤•à¤¾à¤ˆ'}:
                            </span>
                            <div className="text-gray-900">â‚¹{item.cost}</div>
                          </div>
                          {item.expiryDate && (
                            <div>
                              <span className="text-gray-500 text-xs">
                                {language === 'en' ? 'Expires' : 'à¤¸à¤®à¤¾à¤ªà¥à¤¤'}:
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
                            {language === 'en' ? 'Quick Restock +50' : 'à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤ªà¥à¤¨à¤ƒ à¤¸à¥à¤Ÿà¥‰à¤• +50'}
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
