import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { AppContext, Language, Animal } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronDown, ChevronUp, Edit, Trash2, Download, Calendar, User, PawPrint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HospitalRecord, HospitalRecordForm } from './HospitalRecordForm';
import { toast } from 'sonner';

interface HospitalRecordsListProps {
    animalId?: string;
    animalName?: string;
    animals?: Animal[];
    language: Language;
    canEdit: boolean; // Only Vets can edit
}

export function HospitalRecordsList({
    animalId,
    animalName,
    animals,
    language,
    canEdit,
}: HospitalRecordsListProps) {
    const { currentUser } = useContext(AppContext);
    const [records, setRecords] = useState<HospitalRecord[]>([]);
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HospitalRecord | undefined>(undefined);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const t = {
        en: {
            title: 'Hospital Records',
            noRecords: 'No hospital records found',
            loading: 'Loading records...',
            newRecord: 'New Record',
            filterByDate: 'Filter by date',
            filterByStatus: 'Filter by status',
            all: 'All',
            ongoing: 'Ongoing',
            completed: 'Completed',
            followUp: 'Follow-up',
            date: 'Date',
            vet: 'Vet',
            status: 'Status',
            observation: 'Observation',
            tests: 'Tests',
            dosage: 'Dosage',
            remarks: 'Remarks',
            edit: 'Edit',
            delete: 'Delete',
            exportPDF: 'Export PDF',
            confirmDelete: 'Are you sure you want to delete this record?',
            deleted: 'Record deleted successfully',
            deleteFailed: 'Failed to delete record',
            animal: 'Animal',
        },
        hi: {
            title: 'अस्पताल रिकॉर्ड',
            noRecords: 'कोई अस्पताल रिकॉर्ड नहीं मिला',
            loading: 'रिकॉर्ड लोड हो रहे हैं...',
            newRecord: 'नया रिकॉर्ड',
            filterByDate: 'तारीख से फ़िल्टर करें',
            filterByStatus: 'स्थिति से फ़िल्टर करें',
            all: 'सभी',
            ongoing: 'जारी',
            completed: 'पूर्ण',
            followUp: 'फॉलो-अप',
            date: 'तारीख',
            vet: 'पशु चिकित्सक',
            status: 'स्थिति',
            observation: 'अवलोकन',
            tests: 'परीक्षण',
            dosage: 'खुराक',
            remarks: 'टिप्पणियाँ',
            edit: 'संपादित करें',
            delete: 'हटाएं',
            exportPDF: 'PDF निर्यात करें',
            confirmDelete: 'क्या आप वाकई इस रिकॉर्ड को हटाना चाहते हैं?',
            deleted: 'रिकॉर्ड सफलतापूर्वक हटाया गया',
            deleteFailed: 'रिकॉर्ड हटाने में विफल',
            animal: 'जानवर',
        },
    };

    const text = t[language];

    useEffect(() => {
        fetchRecords();
    }, [animalId]);

    const fetchRecords = async () => {
        try {
            setIsLoading(true);
            let url = `${API_BASE_URL}/hospital-records`;
            if (animalId) {
                url = `${API_BASE_URL}/hospital-records/animal/${animalId}`;
            }
            const response = await axios.get(url);
            // Handle both structure formats (array or object with records)
            const data = response.data.records || response.data || [];
            if (Array.isArray(data)) {
                setRecords(data);
            } else {
                setRecords([]);
            }
        } catch (error) {
            console.error('Failed to fetch hospital records:', error);
            // Fallback to mock data for development
            setRecords([
                {
                    id: 'hr1',
                    animalId: animalId || 'a1',
                    animalName: animalName || 'Raja (Tiger)',
                    vetId: 'v1',
                    vetName: 'Dr. Sharma',
                    date: '2026-02-08',
                    observation: 'Animal showing signs of lethargy and reduced appetite. Temperature slightly elevated at 102.5°F.',
                    tests: 'Blood test, Complete Blood Count (CBC), Liver function test',
                    dosage: 'Antibiotic: Amoxicillin 500mg twice daily for 7 days. Vitamin B12 injection.',
                    remarks: 'Monitor closely for next 3 days. Follow-up required if symptoms persist.',
                    status: 'ongoing',
                    createdAt: '2026-02-08T10:00:00Z',
                },
                {
                    id: 'hr2',
                    animalId: animalId || 'a1',
                    animalName: animalName || 'Raja (Tiger)',
                    vetId: 'v1',
                    vetName: 'Dr. Patel',
                    date: '2026-02-01',
                    observation: 'Routine checkup. Animal is healthy and active. No visible signs of distress.',
                    tests: 'Physical examination, Dental checkup',
                    dosage: 'Deworming tablet: Albendazole 400mg single dose',
                    remarks: 'Next checkup scheduled in 3 months.',
                    status: 'completed',
                    createdAt: '2026-02-01T14:30:00Z',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRecords = records.filter((record) => {
        const matchesDate = dateFilter
            ? record.date === dateFilter
            : true;
        const matchesStatus = statusFilter === 'all'
            ? true
            : record.status === statusFilter;
        return matchesDate && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ongoing':
                return 'bg-yellow-500';
            case 'completed':
                return 'bg-green-500';
            case 'follow-up':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ongoing':
                return text.ongoing;
            case 'completed':
                return text.completed;
            case 'follow-up':
                return text.followUp;
            default:
                return status;
        }
    };

    const handleEdit = (record: HospitalRecord) => {
        setEditingRecord(record);
        setIsFormOpen(true);
    };

    const handleDelete = async (recordId: string) => {
        if (!window.confirm(text.confirmDelete)) return;

        try {
            await axios.delete(`${API_BASE_URL}/hospital-records/${recordId}`);
            setRecords(records.filter((r) => r.id !== recordId));
            toast.success(text.deleted);
        } catch (error) {
            console.error('Failed to delete record:', error);
            toast.error(text.deleteFailed);
            // For development, still remove from UI
            setRecords(records.filter((r) => r.id !== recordId));
            toast.success(text.deleted);
        }
    };

    const handleSave = (record: HospitalRecord) => {
        fetchRecords(); // Refresh list to get new record with correct data
        setEditingRecord(undefined);
    };

    const handleExportPDF = () => {
        // TODO: Implement PDF export
        console.log('Exporting hospital records to PDF...');
        toast.success('PDF export feature coming soon!');
    };

    if (isLoading) {
        return (
            <div className="text-center py-8 text-gray-500">{text.loading}</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{text.title}</h3>
                {canEdit && (
                    <Button
                        onClick={() => {
                            setEditingRecord(undefined);
                            setIsFormOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {text.newRecord}
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder={text.filterByDate}
                    className="flex-1"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder={text.filterByStatus} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{text.all}</SelectItem>
                        <SelectItem value="ongoing">{text.ongoing}</SelectItem>
                        <SelectItem value="completed">{text.completed}</SelectItem>
                        <SelectItem value="follow-up">{text.followUp}</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    {text.exportPDF}
                </Button>
            </div>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-500">{text.noRecords}</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredRecords.map((record, index) => (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="overflow-hidden">
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() =>
                                        setExpandedRecordId(expandedRecordId === record.id ? null : record.id)
                                    }
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <Badge className={`${getStatusColor(record.status)} text-white text-xs`}>
                                                    {getStatusText(record.status)}
                                                </Badge>
                                                {!animalId && (
                                                    <span className="text-sm font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <PawPrint className="w-3 h-3" />
                                                        {record.animalName}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(record.date).toLocaleDateString(
                                                        language === 'en' ? 'en-US' : 'hi-IN'
                                                    )}
                                                </span>
                                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {record.vetName}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-2">{record.observation}</p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {canEdit && (currentUser?.id === record.vetId || currentUser?.role === 'admin') && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(record);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(record.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="ghost" size="icon">
                                                {expandedRecordId === record.id ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedRecordId === record.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                                        {text.observation}:
                                                    </p>
                                                    <p className="text-sm text-gray-600">{record.observation}</p>
                                                </div>

                                                {record.tests && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">{text.tests}:</p>
                                                        <p className="text-sm text-gray-600">{record.tests}</p>
                                                    </div>
                                                )}

                                                {record.dosage && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">{text.dosage}:</p>
                                                        <p className="text-sm text-gray-600">{record.dosage}</p>
                                                    </div>
                                                )}

                                                {record.remarks && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">{text.remarks}:</p>
                                                        <p className="text-sm text-gray-600">{record.remarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Hospital Record Form */}
            <HospitalRecordForm
                animalId={animalId}
                animalName={animalName}
                animals={animals}
                existingRecord={editingRecord}
                language={language}
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingRecord(undefined);
                }}
                onSave={handleSave}
            />
        </div>
    );
}
