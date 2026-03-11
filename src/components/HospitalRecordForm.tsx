import React, { useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, Language, Animal } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Calendar, FileText, TestTube, Pill, MessageSquare, PawPrint } from 'lucide-react';

export interface HospitalRecord {
    id: string;
    animalId: string;
    animalName: string;
    vetId: string;
    vetName: string;
    date: string;
    observation: string;
    tests: string;
    dosage: string;
    remarks: string;
    status: 'ongoing' | 'completed' | 'follow-up';
    createdAt: string;
    updatedAt?: string;
}

interface HospitalRecordFormProps {
    animalId?: string;
    animalName?: string;
    animals?: Animal[];
    existingRecord?: HospitalRecord;
    language: Language;
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: HospitalRecord) => void;
}

export function HospitalRecordForm({
    animalId,
    animalName,
    animals,
    existingRecord,
    language,
    isOpen,
    onClose,
    onSave,
}: HospitalRecordFormProps) {
    const { currentUser } = useContext(AppContext);
    const [date, setDate] = useState(existingRecord?.date || new Date().toISOString().split('T')[0]);
    const [observation, setObservation] = useState(existingRecord?.observation || '');
    const [tests, setTests] = useState(existingRecord?.tests || '');
    const [dosage, setDosage] = useState(existingRecord?.dosage || '');
    const [remarks, setRemarks] = useState(existingRecord?.remarks || '');
    const [status, setStatus] = useState<'ongoing' | 'completed' | 'follow-up'>(
        existingRecord?.status || 'ongoing'
    );
    const [selectedAnimalId, setSelectedAnimalId] = useState<string>(existingRecord?.animalId || animalId || '');
    const [isSaving, setIsSaving] = useState(false);

    const t = {
        en: {
            title: existingRecord ? 'Edit Hospital Record' : 'New Hospital Record',
            description: 'Record medical observations and treatment details',
            selectAnimal: 'Select Animal',
            date: 'Date',
            observation: 'Observation',
            observationPlaceholder: 'Describe the animal\'s condition, symptoms, behavior...',
            tests: 'Tests Conducted',
            testsPlaceholder: 'Blood test, X-ray, Ultrasound...',
            dosage: 'Dosage/Treatment',
            dosagePlaceholder: 'Medication name, dosage, frequency...',
            remarks: 'Remarks',
            remarksPlaceholder: 'Additional notes, follow-up instructions...',
            status: 'Status',
            ongoing: 'Ongoing',
            completed: 'Completed',
            followUp: 'Follow-up Required',
            cancel: 'Cancel',
            save: 'Save Record',
            saving: 'Saving...',
            required: 'This field is required',
            animalRequired: 'Please select an animal',
            success: 'Hospital record saved successfully',
            error: 'Failed to save hospital record',
        },
        hi: {
            title: existingRecord ? 'अस्पताल रिकॉर्ड संपादित करें' : 'नया अस्पताल रिकॉर्ड',
            description: 'चिकित्सा अवलोकन और उपचार विवरण रिकॉर्ड करें',
            selectAnimal: 'जानवर चुनें',
            date: 'तारीख',
            observation: 'अवलोकन',
            observationPlaceholder: 'जानवर की स्थिति, लक्षण, व्यवहार का वर्णन करें...',
            tests: 'किए गए परीक्षण',
            testsPlaceholder: 'रक्त परीक्षण, एक्स-रे, अल्ट्रासाउंड...',
            dosage: 'खुराक/उपचार',
            dosagePlaceholder: 'दवा का नाम, खुराक, आवृत्ति...',
            remarks: 'टिप्पणियाँ',
            remarksPlaceholder: 'अतिरिक्त नोट्स, फॉलो-अप निर्देश...',
            status: 'स्थिति',
            ongoing: 'जारी',
            completed: 'पूर्ण',
            followUp: 'फॉलो-अप आवश्यक',
            cancel: 'रद्द करें',
            save: 'रिकॉर्ड सहेजें',
            saving: 'सहेजा जा रहा है...',
            required: 'यह फ़ील्ड आवश्यक है',
            animalRequired: 'कृपया एक जानवर चुनें',
            success: 'अस्पताल रिकॉर्ड सफलतापूर्वक सहेजा गया',
            error: 'अस्पताल रिकॉर्ड सहेजने में विफल',
        },
    };

    const text = t[language];

    useEffect(() => {
        if (existingRecord) {
            setDate(existingRecord.date);
            setObservation(existingRecord.observation);
            setTests(existingRecord.tests);
            setDosage(existingRecord.dosage);
            setRemarks(existingRecord.remarks);
            setStatus(existingRecord.status);
            setSelectedAnimalId(existingRecord.animalId);
        } else if (animalId) {
            setSelectedAnimalId(animalId);
        } else {
            setSelectedAnimalId('');
        }
    }, [existingRecord, animalId, isOpen]);

    const handleSave = async () => {
        // Validation
        if (!selectedAnimalId) {
            toast.error(text.animalRequired);
            return;
        }
        if (!observation.trim()) {
            toast.error(text.required);
            return;
        }

        setIsSaving(true);

        let currentAnimalName = animalName;
        if (!currentAnimalName && animals) {
            const animal = animals.find(a => a.id === selectedAnimalId);
            currentAnimalName = animal ? animal.name : 'Unknown';
        }

        const record: HospitalRecord = {
            id: existingRecord?.id || `hr_${Date.now()}`,
            animalId: selectedAnimalId,
            animalName: currentAnimalName || '',
            vetId: currentUser?.id || '',
            vetName: currentUser?.name || '',
            date,
            observation,
            tests,
            dosage,
            remarks,
            status,
            createdAt: existingRecord?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            if (existingRecord) {
                // Update existing record
                await axios.put(`${API_BASE_URL}/hospital-records/${existingRecord.id}`, record);
            } else {
                // Create new record
                await axios.post(`${API_BASE_URL}/hospital-records`, record);
            }

            toast.success(text.success);
            onSave(record);
            handleClose();
        } catch (error) {
            console.error('Failed to save hospital record:', error);
            toast.error(text.error);
            // For development, still call onSave even if API fails
            onSave(record);
            handleClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        // Reset form
        setDate(new Date().toISOString().split('T')[0]);
        setObservation('');
        setTests('');
        setDosage('');
        setRemarks('');
        setStatus('ongoing');
        if (!animalId) setSelectedAnimalId('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-blue-900">{text.title}</DialogTitle>
                    <DialogDescription>
                        {text.description}
                        {animalName && <> - <span className="font-semibold">{animalName}</span></>}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Animal Selection (if not provided) */}
                    {!animalId && animals && (
                        <div>
                            <Label className="flex items-center gap-2">
                                <PawPrint className="w-4 h-4" />
                                {text.selectAnimal} <span className="text-red-500">*</span>
                            </Label>
                            <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={text.selectAnimal} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {animals.map(animal => (
                                        <SelectItem key={animal.id} value={animal.id}>
                                            {animal.name} ({animal.species})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <Label className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {text.date}
                        </Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {/* Observation */}
                    <div>
                        <Label className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {text.observation} <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder={text.observationPlaceholder}
                            className="mt-1 min-h-[100px]"
                        />
                    </div>

                    {/* Tests */}
                    <div>
                        <Label className="flex items-center gap-2">
                            <TestTube className="w-4 h-4" />
                            {text.tests}
                        </Label>
                        <Textarea
                            value={tests}
                            onChange={(e) => setTests(e.target.value)}
                            placeholder={text.testsPlaceholder}
                            className="mt-1 min-h-[80px]"
                        />
                    </div>

                    {/* Dosage */}
                    <div>
                        <Label className="flex items-center gap-2">
                            <Pill className="w-4 h-4" />
                            {text.dosage}
                        </Label>
                        <Textarea
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            placeholder={text.dosagePlaceholder}
                            className="mt-1 min-h-[80px]"
                        />
                    </div>

                    {/* Remarks */}
                    <div>
                        <Label className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            {text.remarks}
                        </Label>
                        <Textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={text.remarksPlaceholder}
                            className="mt-1 min-h-[80px]"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label>{text.status}</Label>
                        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ongoing">{text.ongoing}</SelectItem>
                                <SelectItem value="completed">{text.completed}</SelectItem>
                                <SelectItem value="follow-up">{text.followUp}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                            disabled={isSaving}
                        >
                            {text.cancel}
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={isSaving}
                        >
                            {isSaving ? text.saving : text.save}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
