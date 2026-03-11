import React, { useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AppContext, Animal } from '../App';
import { API_BASE_URL } from '../config';
import { translations } from './mockData';
import { API_BASE_URL } from '../config';
import { Button } from './ui/button';
import { API_BASE_URL } from '../config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { API_BASE_URL } from '../config';
import { Textarea } from './ui/textarea';
import { API_BASE_URL } from '../config';
import { Label } from './ui/label';
import { API_BASE_URL } from '../config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { API_BASE_URL } from '../config';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import { AlertTriangle, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function SOSModal() {
  const { currentUser, language, showSOS, setShowSOS } = useContext(AppContext);
  const t = translations[language];

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);


  useEffect(() => {
    if (showSOS) {
      const fetchAnimals = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/animals`);
          setAnimals(response.data);
        } catch (error) {
          console.error("Failed to fetch animals for SOS modal:", error);
          toast.error(language === 'en' ? 'Could not load animals' : 'जानवरों को लोड नहीं किया जा सका');
        }
      };
      fetchAnimals();
    }
  }, [showSOS, language]);

  const handleSendAlert = async () => {
    if (!selectedAnimalId) {
      toast.error(language === 'en' ? 'Please select an animal' : 'कृपया एक जानवर चुनें');
      return;
    }
    if (!message.trim()) {
      toast.error(language === 'en' ? 'Please enter a message' : 'कृपया एक संदेश दर्ज करें');
      return;
    }

    const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
    if (!selectedAnimal) return;

    setIsSending(true);
    try {
      const payload = {
        type: 'sos',
        animalName: selectedAnimal.name,
        message: message,
        location: selectedAnimal.enclosure,
        createdBy: currentUser?.name,
      };
      await axios.post(`${API_BASE_URL}/alerts`, payload);
      toast.success(language === 'en' ? 'SOS Alert Sent!' : 'SOS अलर्ट भेजा गया!');
      setShowSOS(false);
      setMessage('');
      setSelectedAnimalId('');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to send alert' : 'अलर्ट भेजने में विफल');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={showSOS} onOpenChange={setShowSOS}>
      <DialogContent className="bg-red-50 border-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle />
            {t.sosAlert}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' ? 'This will immediately notify all relevant personnel.' : 'यह तुरंत सभी संबंधित कर्मियों को सूचित करेगा।'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="animal-select">{language === 'en' ? 'Select Animal' : 'जानवर चुनें'}</Label>
            <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
              <SelectTrigger id="animal-select">
                <SelectValue placeholder={language === 'en' ? 'Select an animal...' : 'एक जानवर चुनें...'} />
              </SelectTrigger>
              <SelectContent>
                {animals.map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} ({animal.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sos-message">{language === 'en' ? 'Emergency Message' : 'आपातकालीन संदेश'}</Label>
            <Textarea
              id="sos-message"
              placeholder={language === 'en' ? 'Describe the emergency...' : 'आपातकाल का वर्णन करें...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-24"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowSOS(false)}>{t.cancel}</Button>
          <Button onClick={handleSendAlert} disabled={isSending} className="bg-red-600 hover:bg-red-700">
            {isSending ? (language === 'en' ? 'Sending...' : 'भेज रहा है...') : t.sendAlert}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
