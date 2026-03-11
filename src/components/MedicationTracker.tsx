import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AppContext, Animal } from '../App';
import { API_BASE_URL } from '../config';
import { translations } from './mockData';
import { API_BASE_URL } from '../config';
import { ArrowLeft, Plus, Pill, Calendar as CalendarIcon, AlertTriangle, Clock, CheckCircle2, Edit, Trash2, Download, FileText } from 'lucide-react';
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
import { exportToCSV, exportToPDF, prepareMedicationDataForExport } from '../utils/exportUtils';
import { API_BASE_URL } from '../config';
import { Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Medication {
  id: string;
  animalId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  purpose: string;
  status: 'active' | 'completed' | 'discontinued';
  administrationLog: AdministrationRecord[];
  notes?: string;
}

interface AdministrationRecord {
  id: string;
  administeredBy: string;
  administeredAt: string;
  notes?: string;
}

interface TreatmentOutcome {
  id: string;
  animalId: string;
  treatmentName: string;
  startDate: string;
  endDate: string;
  outcome: string;
  notes: string;
  prescribedBy: string;
}

export function MedicationTracker() {
  const { language, setCurrentScreen, currentUser } = useContext(AppContext);
  const t = translations[language];

  const [medications, setMedications] = useState<Medication[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false);
  const [viewingMedication, setViewingMedication] = useState<Medication | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'outcomes'>('active');

  const isVet = currentUser?.role === 'vet';

  // Form state
  const [formData, setFormData] = useState({
    animalId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    purpose: '',
    notes: '',
  });

  const [outcomeFormData, setOutcomeFormData] = useState({
    animalId: '',
    treatmentName: '',
    startDate: '',
    endDate: '',
    outcome: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medsResponse, animalsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/medications`),
          axios.get(`${API_BASE_URL}/animals`),
        ]);
        setMedications(medsResponse.data);
        setAnimals(animalsResponse.data);
      } catch (err) {
        setError(t.processingError);
        console.error("Failed to fetch medication data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [t.processingError]);

  const activeMedications = medications.filter(m => m.status === 'active');
  const completedMedications = medications.filter(m => m.status === 'completed' || m.status === 'discontinued');

  const handleAddMedication = async () => {
    if (!formData.animalId || !formData.medicationName || !formData.dosage || !formData.frequency || !formData.startDate || !formData.endDate) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    const newMedicationPayload = {
      id: Date.now().toString(),
      animalId: formData.animalId,
      medicationName: formData.medicationName,
      dosage: formData.dosage,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate,
      prescribedBy: currentUser?.name || 'Dr. Unknown',
      purpose: formData.purpose,
      status: 'active',
      administrationLog: [],
      notes: formData.notes,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/medications`, newMedicationPayload);
      setMedications([response.data, ...medications]);

      // Also update the animal's health status to 'good' since it's now under treatment
      await axios.put(`${API_BASE_URL}/animals/${formData.animalId}`, { health: 'good' });

      toast.success(language === 'en' ? 'Medication prescribed successfully!' : 'दवा सफलतापूर्वक निर्धारित की गई!');
      resetForm();
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to prescribe medication' : 'दवा निर्धारित करने में विफल');
    }
  };

  const handleAddTreatmentOutcome = () => {
    if (!outcomeFormData.animalId || !outcomeFormData.treatmentName || !outcomeFormData.outcome) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }

    const newOutcome: TreatmentOutcome = {
      id: Date.now().toString(),
      animalId: outcomeFormData.animalId,
      treatmentName: outcomeFormData.treatmentName,
      startDate: outcomeFormData.startDate,
      endDate: outcomeFormData.endDate,
      outcome: outcomeFormData.outcome,
      notes: outcomeFormData.notes,
      prescribedBy: currentUser?.name || 'Dr. Unknown',
    };

    setTreatmentOutcomes([newOutcome, ...treatmentOutcomes]);
    toast.success(language === 'en' ? 'Treatment outcome recorded!' : 'उपचार परिणाम दर्ज किया गया!');
    resetOutcomeForm();
  };

  const handleLogAdministration = async (medId: string) => {
    const logRecord: AdministrationRecord = {
      id: Date.now().toString(),
      administeredBy: currentUser?.name || 'Unknown',
      administeredAt: new Date().toLocaleString(),
      notes: '',
    };
    
    const medToUpdate = medications.find(m => m.id === medId);
    if (!medToUpdate) return;

    const updatedLog = [...(medToUpdate.administrationLog || []), logRecord];

    try {
      await axios.put(`${API_BASE_URL}/medications/${medId}`, { administrationLog: updatedLog });
      setMedications(medications.map(med =>
        med.id === medId ? { ...med, administrationLog: updatedLog } : med
      ));
      toast.success(language === 'en' ? 'Administration logged!' : 'प्रशासन दर्ज किया गया!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to log dose' : 'खुराक दर्ज करने में विफल');
    }
  };

  const handleUpdateStatus = async (medId: string, newStatus: Medication['status']) => {
    try {
      await axios.put(`${API_BASE_URL}/medications/${medId}`, { status: newStatus });
      setMedications(medications.map(med =>
        med.id === medId ? { ...med, status: newStatus } : med
      ));
      toast.success(language === 'en' ? 'Status updated!' : 'स्थिति अपडेट की गई!');
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to update status' : 'स्थिति अपडेट करने में विफल');
    }
  };

  const handleDeleteMedication = async (medId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/medications/${medId}`);
      setMedications(medications.filter(med => med.id !== medId));
      toast.success(language === 'en' ? 'Medication deleted!' : 'दवा हटाई गई!');
      setViewingMedication(null);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to delete medication' : 'दवा हटाने में विफल');
    }
  };

  const resetForm = () => {
    setFormData({
      animalId: '',
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      purpose: '',
      notes: '',
    });
    setIsDialogOpen(false);
  };

  const resetOutcomeForm = () => {
    setOutcomeFormData({
      animalId: '',
      treatmentName: '',
      startDate: '',
      endDate: '',
      outcome: '',
      notes: '',
    });
    setIsTreatmentDialogOpen(false);
  };

  const handleExportCSV = () => {
    const data = prepareMedicationDataForExport(medications);
    exportToCSV(data, `medications-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Medications exported to CSV!' : 'दवाएं CSV में निर्यात की गईं!');
  };

  const handleExportPDF = async () => {
    let report = 'MEDICATION & TREATMENT REPORT\n\n';
    report += `Total Medications: ${medications.length}\n`;
    report += `Active: ${activeMedications.length}\n`;
    report += `Completed/Discontinued: ${completedMedications.length}\n\n`;
    report += '='.repeat(60) + '\n';
    
    report += 'ACTIVE MEDICATIONS:\n';
    report += '-'.repeat(60) + '\n\n';
    activeMedications.forEach(med => {
      const animal = animals.find(a => a.id === med.animalId);
      report += `${med.medicationName}\n`;
      report += `  Animal: ${animal?.name || 'Unknown'}\n`;
      report += `  Dosage: ${med.dosage}\n`;
      report += `  Frequency: ${med.frequency}\n`;
      report += `  Duration: ${med.startDate} to ${med.endDate}\n`;
      report += `  Prescribed by: ${med.prescribedBy}\n`;
      report += `  Administrations: ${med.administrationLog.length}\n\n`;
    });

    if (completedMedications.length > 0) {
      report += '\nCOMPLETED TREATMENTS (OUTCOMES):\n';
      report += '-'.repeat(60) + '\n\n';
      completedMedications.forEach(med => {
        const animal = animals.find(a => a.id === med.animalId);
        report += `${med.medicationName}\n`;
        report += `  Animal: ${animal?.name || 'Unknown'}\n`;
        report += `  Outcome: ${med.status}\n`;
        report += `  Notes: ${med.notes || 'N/A'}\n\n`;
      });
    }
    
    await exportToPDF(report, `medications-${new Date().toISOString().split('T')[0]}`);
    toast.success(language === 'en' ? 'Medications exported to PDF!' : 'दवाएं PDF में निर्यात की गईं!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-cyan-50 to-blue-50">
        <Loader className="animate-spin h-12 w-12 text-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-cyan-50 to-blue-50 text-red-600 p-4 text-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
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
                {isVet ? (language === 'en' ? 'Vet Doctor' : 'पशु चिकित्सक') : (language === 'en' ? 'Zookeeper' : 'चिड़ियाघर कीपर')}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
        </div>

        <h1 className="text-white">
          {language === 'en' ? 'Medication & Treatment' : 'दवा और उपचार'}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Pill className="w-5 h-5" />
            </div>
            <div className="text-2xl">{activeMedications.length}</div>
            <div className="text-xs opacity-90">
              {language === 'en' ? 'Active' : 'सक्रिय'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl">{completedMedications.length}</div>
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

        {/* Action Buttons - Vet Only */}
        {isVet && (
          <div className="grid grid-cols-2 gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  <Plus className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Prescribe' : 'निर्धारित करें'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'en' ? 'Prescribe Medication' : 'दवा निर्धारित करें'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'en' ? 'Add a new medication prescription for an animal.' : 'एक जानवर के लिए एक नई दवा निर्धारित करें।'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>{language === 'en' ? 'Select Animal' : 'जानवर चुनें'} *</Label>
                    <Select value={formData.animalId} onValueChange={(value) => setFormData({ ...formData, animalId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? 'Choose animal' : 'जानवर चुनें'} />
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
                    <Label>{language === 'en' ? 'Medication Name' : 'दवा का नाम'} *</Label>
                    <Input
                      placeholder={language === 'en' ? 'e.g., Antibiotics - Amoxicillin' : 'जैसे, एंटीबायोटिक्स - एमोक्सिसिलिन'}
                      value={formData.medicationName}
                      onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === 'en' ? 'Dosage' : 'खुराक'} *</Label>
                      <Input
                        placeholder="500mg"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'Frequency' : 'आवृत्ति'} *</Label>
                      <Input
                        placeholder={language === 'en' ? 'Twice daily' : 'दिन में दो बार'}
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === 'en' ? 'Start Date' : 'प्रारंभ तिथि'} *</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'End Date' : 'समाप्ति तिथि'} *</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{language === 'en' ? 'Purpose' : 'उद्देश्य'}</Label>
                    <Input
                      placeholder={language === 'en' ? 'e.g., Infection treatment' : 'जैसे, संक्रमण उपचार'}
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>{language === 'en' ? 'Notes' : 'नोट्स'}</Label>
                    <Textarea
                      placeholder={language === 'en' ? 'Additional instructions...' : 'अतिरिक्त निर्देश...'}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <Button
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    onClick={handleAddMedication}
                  >
                    {language === 'en' ? 'Prescribe Medication' : 'दवा निर्धारित करें'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isTreatmentDialogOpen} onOpenChange={setIsTreatmentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Add Outcome' : 'परिणाम जोड़ें'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'en' ? 'Record Treatment Outcome' : 'उपचार परिणाम रिकॉर्ड करें'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'en' ? 'Document the results of a completed treatment.' : 'पूर्ण उपचार के परिणामों को दस्तावेज़ करें।'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>{language === 'en' ? 'Select Animal' : 'जानवर चुनें'} *</Label>
                    <Select value={outcomeFormData.animalId} onValueChange={(value) => setOutcomeFormData({ ...outcomeFormData, animalId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? 'Choose animal' : 'जानवर चुनें'} />
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
                    <Label>{language === 'en' ? 'Treatment Name' : 'उपचार का नाम'} *</Label>
                    <Input
                      placeholder={language === 'en' ? 'e.g., Respiratory Infection Treatment' : 'जैसे, श्वसन संक्रमण उपचार'}
                      value={outcomeFormData.treatmentName}
                      onChange={(e) => setOutcomeFormData({ ...outcomeFormData, treatmentName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{language === 'en' ? 'Start Date' : 'प्रारंभ तिथि'}</Label>
                      <Input
                        type="date"
                        value={outcomeFormData.startDate}
                        onChange={(e) => setOutcomeFormData({ ...outcomeFormData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{language === 'en' ? 'End Date' : 'समाप्ति तिथि'}</Label>
                      <Input
                        type="date"
                        value={outcomeFormData.endDate}
                        onChange={(e) => setOutcomeFormData({ ...outcomeFormData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{language === 'en' ? 'Outcome' : 'परिणाम'} *</Label>
                    <Select value={outcomeFormData.outcome} onValueChange={(value) => setOutcomeFormData({ ...outcomeFormData, outcome: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? 'Select outcome' : 'परिणाम चुनें'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fully recovered">{language === 'en' ? 'Fully Recovered' : 'पूरी तरह ठीक'}</SelectItem>
                        <SelectItem value="Improved">{language === 'en' ? 'Improved' : 'सुधार हुआ'}</SelectItem>
                        <SelectItem value="Ongoing treatment">{language === 'en' ? 'Ongoing Treatment' : 'चल रहा उपचार'}</SelectItem>
                        <SelectItem value="No improvement">{language === 'en' ? 'No Improvement' : 'कोई सुधार नहीं'}</SelectItem>
                        <SelectItem value="Deceased">{language === 'en' ? 'Deceased' : 'मृत'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{language === 'en' ? 'Notes' : 'नोट्स'}</Label>
                    <Textarea
                      placeholder={language === 'en' ? 'Treatment details and observations...' : 'उपचार विवरण और अवलोकन...'}
                      value={outcomeFormData.notes}
                      onChange={(e) => setOutcomeFormData({ ...outcomeFormData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleAddTreatmentOutcome}
                  >
                    {language === 'en' ? 'Record Outcome' : 'परिणाम दर्ज करें'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">{language === 'en' ? 'Active' : 'सक्रिय'}</TabsTrigger>
            <TabsTrigger value="completed">{language === 'en' ? 'History' : 'इतिहास'}</TabsTrigger>
            {/* <TabsTrigger value="outcomes">{language === 'en' ? 'Outcomes' : 'परिणाम'}</TabsTrigger> */}
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-3">
            {activeMedications.length === 0 ? (
              <Card className="p-8 text-center bg-white">
                <p className="text-gray-500">
                  {language === 'en' ? 'No active medications' : 'कोई सक्रिय दवा नहीं'}
                </p>
              </Card>
            ) : (
              activeMedications.map((med, index) => {
                const animal = animals.find(a => a.id === med.animalId);
                const daysRemaining = Math.ceil((new Date(med.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isEnding = daysRemaining <= 2 && daysRemaining >= 0;

                return (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${isEnding ? 'border-2 border-amber-400 bg-amber-50' : 'bg-white'}`}
                      onClick={() => setViewingMedication(med)}
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
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-gray-900">{med.medicationName}</h3>
                              <p className="text-sm text-gray-600">
                                {animal?.name} • {med.dosage} • {med.frequency}
                              </p>
                            </div>
                            <Badge className="bg-blue-500">
                              {language === 'en' ? 'Active' : 'सक्रिय'}
                            </Badge>
                          </div>

                          {isEnding && (
                            <div className="flex items-center gap-2 text-xs text-amber-700 mb-2 bg-amber-100 p-2 rounded">
                              <AlertTriangle className="w-4 h-4" />
                              <span>
                                {language === 'en' ? `Ending in ${daysRemaining} day(s)` : `${daysRemaining} दिन में समाप्त`}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <div>
                              <span className="text-gray-500">{language === 'en' ? 'Start' : 'शुरू'}: </span>
                              {new Date(med.startDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="text-gray-500">{language === 'en' ? 'End' : 'समाप्त'}: </span>
                              {new Date(med.endDate).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLogAdministration(med.id);
                              }}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              {language === 'en' ? 'Log Dose' : 'खुराक दर्ज करें'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            {completedMedications.length === 0 ? (
              <Card className="p-8 text-center bg-white">
                <p className="text-gray-500">
                  {language === 'en' ? 'No completed medications' : 'कोई पूर्ण दवा नहीं'}
                </p>
              </Card>
            ) : (
              completedMedications.map((med, index) => {
                const animal = animals.find(a => a.id === med.animalId);
                return (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 bg-white opacity-75">
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
                              <h3 className="text-gray-900">{med.medicationName}</h3>
                              <p className="text-sm text-gray-600">{animal?.name}</p>
                            </div>
                            <Badge className={med.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'}>
                              {med.status === 'completed' ? (language === 'en' ? 'Completed' : 'पूर्ण') : (language === 'en' ? 'Discontinued' : 'बंद')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(med.startDate).toLocaleDateString()} - {new Date(med.endDate).toLocaleDateString()}
                          </p>
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

      {/* Medication Detail Dialog */}
      <Dialog open={!!viewingMedication} onOpenChange={(open) => !open && setViewingMedication(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {viewingMedication && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingMedication.medicationName}</DialogTitle>
                <DialogDescription>
                  {language === 'en' ? 'Prescribed by' : 'द्वारा निर्धारित'}: {viewingMedication.prescribedBy}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{language === 'en' ? 'Animal' : 'जानवर'}</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {animals.find(a => a.id === viewingMedication.animalId)?.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{language === 'en' ? 'Dosage' : 'खुराक'}</Label>
                    <p className="text-sm text-gray-700 mt-1">{viewingMedication.dosage}</p>
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Frequency' : 'आवृत्ति'}</Label>
                    <p className="text-sm text-gray-700 mt-1">{viewingMedication.frequency}</p>
                  </div>
                </div>

                <div>
                  <Label>{language === 'en' ? 'Purpose' : 'उद्देश्य'}</Label>
                  <p className="text-sm text-gray-700 mt-1">{viewingMedication.purpose || (language === 'en' ? 'Not specified' : 'निर्दिष्ट नहीं')}</p>
                </div>

                {viewingMedication.notes && (
                  <div>
                    <Label>{language === 'en' ? 'Notes' : 'नोट्स'}</Label>
                    <p className="text-sm text-gray-700 mt-1">{viewingMedication.notes}</p>
                  </div>
                )}

                <div>
                  <Label>{language === 'en' ? 'Administration Log' : 'प्रशासन लॉग'} ({viewingMedication.administrationLog.length})</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {viewingMedication.administrationLog.length === 0 ? (
                      <p className="text-sm text-gray-500">{language === 'en' ? 'No doses logged yet' : 'अभी तक कोई खुराक दर्ज नहीं'}</p>
                    ) : (
                      viewingMedication.administrationLog.map((log) => (
                        <Card key={log.id} className="p-2 bg-gray-50">
                          <p className="text-xs text-cyan-600">{log.administeredBy}</p>
                          <p className="text-xs text-gray-500">{log.administeredAt}</p>
                          {log.notes && <p className="text-xs text-gray-700 mt-1">{log.notes}</p>}
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* Status Update - Vet Only */}
                {isVet && viewingMedication.status === 'active' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        handleUpdateStatus(viewingMedication.id, 'completed');
                        setViewingMedication({ ...viewingMedication, status: 'completed' });
                      }}
                    >
                      {language === 'en' ? 'Mark Completed' : 'पूर्ण चिह्नित करें'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600"
                      onClick={() => {
                        handleUpdateStatus(viewingMedication.id, 'discontinued');
                        setViewingMedication({ ...viewingMedication, status: 'discontinued' });
                      }}
                    >
                      {language === 'en' ? 'Discontinue' : 'बंद करें'}
                    </Button>
                  </div>
                )}

                {/* Delete - Vet Only */}
                {isVet && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteMedication(viewingMedication.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Delete Medication' : 'दवा हटाएं'}
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
