import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dealsApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { 
  ArrowLeft, ArrowRight, Building2, Users, FileText, 
  CheckCircle, Plus, Trash2, Save, AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatbotWidget from '../components/ChatbotWidget';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Grunddaten', icon: FileText },
  { id: 2, title: 'Gesellschaft', icon: Building2 },
  { id: 3, title: 'Parteien', icon: Users },
  { id: 4, title: 'Konditionen', icon: FileText },
  { id: 5, title: 'Übersicht', icon: CheckCircle }
];

const EMPTY_PARTY = {
  party_type: 'person',
  name: '',
  address: '',
  plz: '',
  ort: '',
  land: 'Schweiz',
  email: '',
  phone: '',
  identification: '',
  role: 'aktionaer',
  requires_signature: true
};

const EMPTY_VR = {
  name: '',
  zeichnungsart: 'einzeln',
  zeichnungsdetails: '',
  unterschreibt: true
};

export default function DealWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    deal_type: location.state?.type || 'ankauf',
    company: {
      name_current: '',
      name_new: '',
      sitz_current: '',
      sitz_new: '',
      zweck_current: '',
      zweck_new: '',
      che_nummer: '',
      hr_nummer: '',
      gruendungsdatum: '',
      aktienkapital: 0,
      liberierung: 'voll',
      anzahl_aktien: 0,
      nennwert: 0,
      bankkonto: '',
      saldo: 0,
      gewaehrleistung: false,
      gewaehrleistung_notiz: ''
    },
    sellers: [{ ...EMPTY_PARTY }],
    buyers: [{ ...EMPTY_PARTY }],
    vr_members: [{ ...EMPTY_VR }],
    kaufpreis: 0,
    kaufpreis_regelung: '',
    besitzantritt: '',
    unterschriftsort: 'Zürich',
    unterschriftsdatum: new Date().toISOString().split('T')[0],
    anzahlung: 0,
    anzahlung_aktiviert: false,
    darlehen_uebernahme: false,
    darlehen_betrag: 0,
    notizen: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const updateCompany = (field, value) => {
    setFormData(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value }
    }));
    setErrors(prev => ({ ...prev, [`company.${field}`]: null }));
  };

  const addParty = (type) => {
    const key = type === 'seller' ? 'sellers' : 'buyers';
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], { ...EMPTY_PARTY }]
    }));
  };

  const updateParty = (type, index, field, value) => {
    const key = type === 'seller' ? 'sellers' : 'buyers';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const removeParty = (type, index) => {
    const key = type === 'seller' ? 'sellers' : 'buyers';
    if (formData[key].length > 1) {
      setFormData(prev => ({
        ...prev,
        [key]: prev[key].filter((_, i) => i !== index)
      }));
    }
  };

  const addVR = () => {
    setFormData(prev => ({
      ...prev,
      vr_members: [...prev.vr_members, { ...EMPTY_VR }]
    }));
  };

  const updateVR = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      vr_members: prev.vr_members.map((v, i) => i === index ? { ...v, [field]: value } : v)
    }));
  };

  const removeVR = (index) => {
    if (formData.vr_members.length > 1) {
      setFormData(prev => ({
        ...prev,
        vr_members: prev.vr_members.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.deal_type) newErrors.deal_type = 'Deal-Typ erforderlich';
    }
    
    if (currentStep === 2) {
      if (!formData.company.name_current) newErrors['company.name_current'] = 'Firmenname erforderlich';
    }
    
    if (currentStep === 3) {
      if (formData.sellers.length === 0) newErrors.sellers = 'Mindestens ein Verkäufer erforderlich';
      if (formData.buyers.length === 0) newErrors.buyers = 'Mindestens ein Käufer erforderlich';
      formData.sellers.forEach((s, i) => {
        if (!s.name) newErrors[`seller_${i}_name`] = 'Name erforderlich';
      });
      formData.buyers.forEach((b, i) => {
        if (!b.name) newErrors[`buyer_${i}_name`] = 'Name erforderlich';
      });
    }
    
    if (currentStep === 4) {
      if (!formData.kaufpreis && !formData.kaufpreis_regelung) {
        newErrors.kaufpreis = 'Kaufpreis oder Regelung erforderlich';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setSaving(true);
    try {
      const response = await dealsApi.create(formData);
      toast.success('Deal erfolgreich erstellt');
      navigate(`/deals/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create deal:', error);
      toast.error(error.response?.data?.detail || 'Fehler beim Erstellen des Deals');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      
      <main className="flex-1 flex">
        {/* Form Area */}
        <div className="flex-1 p-8 lg:p-12 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 -ml-2 text-slate-600 hover:text-bronze"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
              Neuer Deal
            </h1>
            <p className="text-slate-500 mt-2">
              Schritt {currentStep} von {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive 
                        ? 'bg-bronze text-white' 
                        : isCompleted 
                          ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                    disabled={step.id > currentStep}
                    data-testid={`step-${step.id}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <Card className="card-premium animate-fade-in" data-testid="wizard-card">
            <CardContent className="p-8">
              {/* Step 1: Grunddaten */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="font-heading text-xl mb-2">Deal-Typ wählen</CardTitle>
                    <CardDescription>Wählen Sie den Typ der Transaktion</CardDescription>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => updateFormData('deal_type', 'ankauf')}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        formData.deal_type === 'ankauf'
                          ? 'border-bronze bg-bronze/5'
                          : 'border-slate-200 hover:border-bronze/50'
                      }`}
                      data-testid="deal-type-ankauf"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-slate-900">Ankauf</h3>
                      <p className="text-sm text-slate-500 mt-1">Blum kauft eine AG</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => updateFormData('deal_type', 'verkauf')}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        formData.deal_type === 'verkauf'
                          ? 'border-bronze bg-bronze/5'
                          : 'border-slate-200 hover:border-bronze/50'
                      }`}
                      data-testid="deal-type-verkauf"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-slate-900">Verkauf</h3>
                      <p className="text-sm text-slate-500 mt-1">Blum verkauft eine AG</p>
                    </button>
                  </div>
                  
                  {errors.deal_type && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.deal_type}
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Gesellschaft */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="font-heading text-xl mb-2">Gesellschaftsdaten</CardTitle>
                    <CardDescription>Angaben zur AG</CardDescription>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Firmenname aktuell *</Label>
                      <Input
                        value={formData.company.name_current}
                        onChange={(e) => updateCompany('name_current', e.target.value)}
                        placeholder="Muster AG"
                        className={`input-premium ${errors['company.name_current'] ? 'border-red-500' : ''}`}
                        data-testid="company-name-input"
                      />
                      {errors['company.name_current'] && (
                        <p className="text-red-600 text-sm">{errors['company.name_current']}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Firmenname neu (optional)</Label>
                      <Input
                        value={formData.company.name_new || ''}
                        onChange={(e) => updateCompany('name_new', e.target.value)}
                        placeholder="Falls Umbenennung"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Sitz aktuell</Label>
                      <Input
                        value={formData.company.sitz_current}
                        onChange={(e) => updateCompany('sitz_current', e.target.value)}
                        placeholder="Zürich"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Sitz neu (optional)</Label>
                      <Input
                        value={formData.company.sitz_new || ''}
                        onChange={(e) => updateCompany('sitz_new', e.target.value)}
                        placeholder="Falls Sitzverlegung"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>CHE-Nummer</Label>
                      <Input
                        value={formData.company.che_nummer}
                        onChange={(e) => updateCompany('che_nummer', e.target.value)}
                        placeholder="CHE-123.456.789"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>HR-Nummer</Label>
                      <Input
                        value={formData.company.hr_nummer}
                        onChange={(e) => updateCompany('hr_nummer', e.target.value)}
                        placeholder="CH-020.1.234.567-8"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Gründungsdatum</Label>
                      <Input
                        type="date"
                        value={formData.company.gruendungsdatum || ''}
                        onChange={(e) => updateCompany('gruendungsdatum', e.target.value)}
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Aktienkapital (CHF)</Label>
                      <Input
                        type="number"
                        value={formData.company.aktienkapital}
                        onChange={(e) => updateCompany('aktienkapital', parseFloat(e.target.value) || 0)}
                        placeholder="100000"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Anzahl Aktien</Label>
                      <Input
                        type="number"
                        value={formData.company.anzahl_aktien}
                        onChange={(e) => updateCompany('anzahl_aktien', parseInt(e.target.value) || 0)}
                        placeholder="100"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Nennwert (CHF)</Label>
                      <Input
                        type="number"
                        value={formData.company.nennwert}
                        onChange={(e) => updateCompany('nennwert', parseFloat(e.target.value) || 0)}
                        placeholder="1000"
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Liberierung</Label>
                      <select
                        value={formData.company.liberierung}
                        onChange={(e) => updateCompany('liberierung', e.target.value)}
                        className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white focus:border-bronze focus:ring-1 focus:ring-bronze"
                      >
                        <option value="voll">Voll liberiert</option>
                        <option value="teil">Teil liberiert</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Zweck aktuell</Label>
                    <Textarea
                      value={formData.company.zweck_current}
                      onChange={(e) => updateCompany('zweck_current', e.target.value)}
                      placeholder="Zweckangabe gemäss Handelsregister"
                      className="input-premium min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Checkbox
                      checked={formData.company.gewaehrleistung}
                      onCheckedChange={(checked) => updateCompany('gewaehrleistung', checked)}
                    />
                    <div>
                      <Label className="text-sm font-medium">Gewährleistung/Bonität bestätigt</Label>
                      <p className="text-xs text-slate-500">Prüfung der finanziellen Situation erfolgt</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Parteien */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  {/* Verkäufer */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <CardTitle className="font-heading text-xl">Verkäufer</CardTitle>
                        <CardDescription>Mindestens ein Verkäufer erforderlich</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addParty('seller')}
                        className="hover:border-bronze hover:text-bronze"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Hinzufügen
                      </Button>
                    </div>
                    
                    {formData.sellers.map((seller, index) => (
                      <Card key={index} className="mb-4 border-slate-200" data-testid={`seller-${index}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-slate-900">Verkäufer {index + 1}</h4>
                            {formData.sellers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeParty('seller', index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Typ</Label>
                              <select
                                value={seller.party_type}
                                onChange={(e) => updateParty('seller', index, 'party_type', e.target.value)}
                                className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white"
                              >
                                <option value="person">Natürliche Person</option>
                                <option value="firma">Firma</option>
                              </select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Name/Firma *</Label>
                              <Input
                                value={seller.name}
                                onChange={(e) => updateParty('seller', index, 'name', e.target.value)}
                                placeholder={seller.party_type === 'person' ? 'Max Muster' : 'Muster GmbH'}
                                className={`input-premium ${errors[`seller_${index}_name`] ? 'border-red-500' : ''}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Adresse</Label>
                              <Input
                                value={seller.address}
                                onChange={(e) => updateParty('seller', index, 'address', e.target.value)}
                                placeholder="Musterstrasse 1"
                                className="input-premium"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>PLZ</Label>
                                <Input
                                  value={seller.plz}
                                  onChange={(e) => updateParty('seller', index, 'plz', e.target.value)}
                                  placeholder="8000"
                                  className="input-premium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Ort</Label>
                                <Input
                                  value={seller.ort}
                                  onChange={(e) => updateParty('seller', index, 'ort', e.target.value)}
                                  placeholder="Zürich"
                                  className="input-premium"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>E-Mail</Label>
                              <Input
                                type="email"
                                value={seller.email}
                                onChange={(e) => updateParty('seller', index, 'email', e.target.value)}
                                placeholder="email@beispiel.ch"
                                className="input-premium"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Rolle</Label>
                              <select
                                value={seller.role}
                                onChange={(e) => updateParty('seller', index, 'role', e.target.value)}
                                className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white"
                              >
                                <option value="aktionaer">Aktionär</option>
                                <option value="vr">Verwaltungsrat</option>
                                <option value="beide">Beides</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <Checkbox
                              checked={seller.requires_signature}
                              onCheckedChange={(checked) => updateParty('seller', index, 'requires_signature', checked)}
                            />
                            <Label className="text-sm">Unterschrift erforderlich</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Käufer */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <CardTitle className="font-heading text-xl">Käufer</CardTitle>
                        <CardDescription>Mindestens ein Käufer erforderlich</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addParty('buyer')}
                        className="hover:border-bronze hover:text-bronze"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Hinzufügen
                      </Button>
                    </div>
                    
                    {formData.buyers.map((buyer, index) => (
                      <Card key={index} className="mb-4 border-slate-200" data-testid={`buyer-${index}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-slate-900">Käufer {index + 1}</h4>
                            {formData.buyers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeParty('buyer', index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Typ</Label>
                              <select
                                value={buyer.party_type}
                                onChange={(e) => updateParty('buyer', index, 'party_type', e.target.value)}
                                className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white"
                              >
                                <option value="person">Natürliche Person</option>
                                <option value="firma">Firma</option>
                              </select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Name/Firma *</Label>
                              <Input
                                value={buyer.name}
                                onChange={(e) => updateParty('buyer', index, 'name', e.target.value)}
                                placeholder={buyer.party_type === 'person' ? 'Max Muster' : 'Muster GmbH'}
                                className={`input-premium ${errors[`buyer_${index}_name`] ? 'border-red-500' : ''}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Adresse</Label>
                              <Input
                                value={buyer.address}
                                onChange={(e) => updateParty('buyer', index, 'address', e.target.value)}
                                placeholder="Musterstrasse 1"
                                className="input-premium"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>PLZ</Label>
                                <Input
                                  value={buyer.plz}
                                  onChange={(e) => updateParty('buyer', index, 'plz', e.target.value)}
                                  placeholder="8000"
                                  className="input-premium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Ort</Label>
                                <Input
                                  value={buyer.ort}
                                  onChange={(e) => updateParty('buyer', index, 'ort', e.target.value)}
                                  placeholder="Zürich"
                                  className="input-premium"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>E-Mail</Label>
                              <Input
                                type="email"
                                value={buyer.email}
                                onChange={(e) => updateParty('buyer', index, 'email', e.target.value)}
                                placeholder="email@beispiel.ch"
                                className="input-premium"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Rolle</Label>
                              <select
                                value={buyer.role}
                                onChange={(e) => updateParty('buyer', index, 'role', e.target.value)}
                                className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white"
                              >
                                <option value="aktionaer">Aktionär</option>
                                <option value="vr">Verwaltungsrat</option>
                                <option value="beide">Beides</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <Checkbox
                              checked={buyer.requires_signature}
                              onCheckedChange={(checked) => updateParty('buyer', index, 'requires_signature', checked)}
                            />
                            <Label className="text-sm">Unterschrift erforderlich</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* VR Members */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <CardTitle className="font-heading text-xl">Verwaltungsrat</CardTitle>
                        <CardDescription>VR-Mitglieder und Zeichnungsberechtigte</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVR}
                        className="hover:border-bronze hover:text-bronze"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Hinzufügen
                      </Button>
                    </div>
                    
                    {formData.vr_members.map((vr, index) => (
                      <Card key={index} className="mb-4 border-slate-200" data-testid={`vr-${index}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-slate-900">VR-Mitglied {index + 1}</h4>
                            {formData.vr_members.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVR(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                value={vr.name}
                                onChange={(e) => updateVR(index, 'name', e.target.value)}
                                placeholder="Max Muster"
                                className="input-premium"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Zeichnungsart</Label>
                              <select
                                value={vr.zeichnungsart}
                                onChange={(e) => updateVR(index, 'zeichnungsart', e.target.value)}
                                className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white"
                              >
                                <option value="einzeln">Einzelzeichnung</option>
                                <option value="kollektiv">Kollektivzeichnung zu zweien</option>
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={vr.unterschreibt}
                                onCheckedChange={(checked) => updateVR(index, 'unterschreibt', checked)}
                              />
                              <Label className="text-sm">Unterschreibt</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Konditionen */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="font-heading text-xl mb-2">Konditionen</CardTitle>
                    <CardDescription>Finanzielle Details und Termine</CardDescription>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Kaufpreis (CHF) *</Label>
                      <Input
                        type="number"
                        value={formData.kaufpreis}
                        onChange={(e) => updateFormData('kaufpreis', parseFloat(e.target.value) || 0)}
                        placeholder="50000"
                        className={`input-premium ${errors.kaufpreis ? 'border-red-500' : ''}`}
                        data-testid="kaufpreis-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Kaufpreis-Regelung</Label>
                      <Input
                        value={formData.kaufpreis_regelung}
                        onChange={(e) => updateFormData('kaufpreis_regelung', e.target.value)}
                        placeholder="z.B. Ratenzahlung, Verrechnung..."
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Besitzantritt</Label>
                      <Input
                        type="date"
                        value={formData.besitzantritt}
                        onChange={(e) => updateFormData('besitzantritt', e.target.value)}
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Unterschriftsdatum</Label>
                      <Input
                        type="date"
                        value={formData.unterschriftsdatum}
                        onChange={(e) => updateFormData('unterschriftsdatum', e.target.value)}
                        className="input-premium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Unterschriftsort</Label>
                      <Input
                        value={formData.unterschriftsort}
                        onChange={(e) => updateFormData('unterschriftsort', e.target.value)}
                        placeholder="Zürich"
                        className="input-premium"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.anzahlung_aktiviert}
                        onCheckedChange={(checked) => updateFormData('anzahlung_aktiviert', checked)}
                      />
                      <Label>Anzahlung vereinbart</Label>
                    </div>
                    
                    {formData.anzahlung_aktiviert && (
                      <div className="space-y-2 pl-7">
                        <Label>Anzahlungsbetrag (CHF)</Label>
                        <Input
                          type="number"
                          value={formData.anzahlung}
                          onChange={(e) => updateFormData('anzahlung', parseFloat(e.target.value) || 0)}
                          placeholder="10000"
                          className="input-premium max-w-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.darlehen_uebernahme}
                        onCheckedChange={(checked) => updateFormData('darlehen_uebernahme', checked)}
                      />
                      <Label>Darlehensübernahme</Label>
                    </div>
                    
                    {formData.darlehen_uebernahme && (
                      <div className="space-y-2 pl-7">
                        <Label>Darlehensbetrag (CHF)</Label>
                        <Input
                          type="number"
                          value={formData.darlehen_betrag}
                          onChange={(e) => updateFormData('darlehen_betrag', parseFloat(e.target.value) || 0)}
                          placeholder="25000"
                          className="input-premium max-w-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Notizen</Label>
                    <Textarea
                      value={formData.notizen}
                      onChange={(e) => updateFormData('notizen', e.target.value)}
                      placeholder="Interne Notizen zum Deal..."
                      className="input-premium min-h-[100px]"
                    />
                  </div>
                  
                  {errors.kaufpreis && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.kaufpreis}
                    </p>
                  )}
                </div>
              )}

              {/* Step 5: Übersicht */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="font-heading text-xl mb-2">Zusammenfassung</CardTitle>
                    <CardDescription>Überprüfen Sie Ihre Angaben</CardDescription>
                  </div>

                  <div className="grid gap-6">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-700 mb-3">Grunddaten</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-500">Deal-Typ:</span>
                        <span className="font-medium capitalize">{formData.deal_type}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-700 mb-3">Gesellschaft</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-500">Firma:</span>
                        <span className="font-medium">{formData.company.name_current || '–'}</span>
                        <span className="text-slate-500">Sitz:</span>
                        <span className="font-medium">{formData.company.sitz_current || '–'}</span>
                        <span className="text-slate-500">CHE-Nr.:</span>
                        <span className="font-medium">{formData.company.che_nummer || '–'}</span>
                        <span className="text-slate-500">Aktienkapital:</span>
                        <span className="font-medium">CHF {formData.company.aktienkapital?.toLocaleString('de-CH')}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-700 mb-3">Parteien</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">Verkäufer:</span>
                          <ul className="ml-4 mt-1">
                            {formData.sellers.map((s, i) => (
                              <li key={i} className="font-medium">{s.name || `Verkäufer ${i + 1}`}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-slate-500">Käufer:</span>
                          <ul className="ml-4 mt-1">
                            {formData.buyers.map((b, i) => (
                              <li key={i} className="font-medium">{b.name || `Käufer ${i + 1}`}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-700 mb-3">Konditionen</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-slate-500">Kaufpreis:</span>
                        <span className="font-medium font-mono">CHF {formData.kaufpreis?.toLocaleString('de-CH')}</span>
                        <span className="text-slate-500">Besitzantritt:</span>
                        <span className="font-medium">{formData.besitzantritt || '–'}</span>
                        <span className="text-slate-500">Unterschriftsort:</span>
                        <span className="font-medium">{formData.unterschriftsort}</span>
                        {formData.anzahlung_aktiviert && (
                          <>
                            <span className="text-slate-500">Anzahlung:</span>
                            <span className="font-medium font-mono">CHF {formData.anzahlung?.toLocaleString('de-CH')}</span>
                          </>
                        )}
                        {formData.darlehen_uebernahme && (
                          <>
                            <span className="text-slate-500">Darlehen:</span>
                            <span className="font-medium font-mono">CHF {formData.darlehen_betrag?.toLocaleString('de-CH')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="hover:border-bronze hover:text-bronze"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
                
                {currentStep < 5 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="btn-primary"
                    data-testid="next-step-btn"
                  >
                    Weiter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="btn-primary"
                    data-testid="submit-deal-btn"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Speichern...
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Deal erstellen
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="hidden lg:block w-96 bg-slate-50 border-l border-slate-200 p-8">
          <div className="sticky top-8">
            <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">Live-Vorschau</h3>
            
            <Card className="border-slate-200">
              <CardContent className="p-4 space-y-4 text-sm">
                <div>
                  <span className="text-slate-500">Deal-Typ</span>
                  <p className="font-medium capitalize">{formData.deal_type || '–'}</p>
                </div>
                
                <div>
                  <span className="text-slate-500">Gesellschaft</span>
                  <p className="font-medium">{formData.company.name_current || '–'}</p>
                </div>
                
                <div>
                  <span className="text-slate-500">Kaufpreis</span>
                  <p className="font-medium font-mono">
                    {formData.kaufpreis ? `CHF ${formData.kaufpreis.toLocaleString('de-CH')}` : '–'}
                  </p>
                </div>
                
                <div>
                  <span className="text-slate-500">Verkäufer</span>
                  <p className="font-medium">{formData.sellers.filter(s => s.name).length} Partei(en)</p>
                </div>
                
                <div>
                  <span className="text-slate-500">Käufer</span>
                  <p className="font-medium">{formData.buyers.filter(b => b.name).length} Partei(en)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ChatbotWidget />
    </div>
  );
}
