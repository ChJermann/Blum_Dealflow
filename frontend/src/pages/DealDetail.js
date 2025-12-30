import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dealsApi, documentsApi, attachmentsApi, templatesApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, Building2, FileText, Download, Trash2, 
  Upload, Plus, RefreshCw, CheckCircle, AlertTriangle,
  Clock, Edit, MoreVertical
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatbotWidget from '../components/ChatbotWidget';
import ServerStatus from '../components/ServerStatus';
import { toast } from 'sonner';

const STATUS_LABELS = {
  entwurf: 'Entwurf',
  in_pruefung: 'In Prüfung',
  freigegeben: 'Freigegeben',
  versendet: 'Versendet',
  abgeschlossen: 'Abgeschlossen',
  archiviert: 'Archiviert'
};

const STATUS_COLORS = {
  entwurf: 'bg-slate-100 text-slate-700',
  in_pruefung: 'bg-blue-100 text-blue-700',
  freigegeben: 'bg-green-100 text-green-700',
  versendet: 'bg-purple-100 text-purple-700',
  abgeschlossen: 'bg-emerald-100 text-emerald-700',
  archiviert: 'bg-gray-100 text-gray-500'
};

const STATUS_FLOW = ['entwurf', 'in_pruefung', 'freigegeben', 'versendet', 'abgeschlossen', 'archiviert'];

const ATTACHMENT_TYPES = [
  { value: 'pass_kopie', label: 'Pass-/ID-Kopie' },
  { value: 'hr_auszug', label: 'Handelsregisterauszug' },
  { value: 'vr_annahme', label: 'VR-Annahmeerklärung' },
  { value: 'aktionaersregister', label: 'Aktionärsregister' },
  { value: 'zahlungsbestaetigung', label: 'Zahlungsbestätigung' },
  { value: 'notariatsunterlagen', label: 'Notariatsunterlagen' },
  { value: 'sonstige', label: 'Sonstige' }
];

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deal, setDeal] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [dealRes, docsRes, attachRes, templatesRes, validationRes] = await Promise.all([
        dealsApi.getById(id),
        documentsApi.getByDeal(id),
        attachmentsApi.getByDeal(id),
        templatesApi.getAll(),
        dealsApi.validate(id)
      ]);
      
      setDeal(dealRes.data);
      setDocuments(docsRes.data);
      setAttachments(attachRes.data);
      setTemplates(templatesRes.data);
      setValidation(validationRes.data);
    } catch (error) {
      console.error('Failed to load deal:', error);
      toast.error('Deal konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await dealsApi.updateStatus(id, newStatus);
      setDeal(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status geändert zu "${STATUS_LABELS[newStatus]}"`);
    } catch (error) {
      toast.error('Status konnte nicht geändert werden');
    }
  };

  const handleGenerateDocument = async (templateId) => {
    setGenerating(templateId);
    try {
      const response = await documentsApi.generate(id, templateId);
      setDocuments(prev => [response.data, ...prev]);
      toast.success('Dokument erfolgreich erstellt');
    } catch (error) {
      toast.error('Dokument konnte nicht erstellt werden');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadDocument = async (docId, filename) => {
    try {
      const response = await documentsApi.download(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Download fehlgeschlagen');
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachment_type', 'sonstige');
    formData.append('description', file.name);
    formData.append('show_in_documents', 'true');
    formData.append('include_in_zip', 'true');

    setUploading(true);
    try {
      const response = await attachmentsApi.upload(id, formData);
      setAttachments(prev => [response.data, ...prev]);
      toast.success('Anhang hochgeladen');
    } catch (error) {
      toast.error('Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await attachmentsApi.delete(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      toast.success('Anhang gelöscht');
    } catch (error) {
      toast.error('Löschen fehlgeschlagen');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-snow">
        <Sidebar />
        <main className="flex-1 p-8 lg:p-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-64 bg-slate-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex min-h-screen bg-snow">
        <Sidebar />
        <main className="flex-1 p-8 lg:p-12 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-heading font-semibold text-slate-700">Deal nicht gefunden</h2>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Zurück zum Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(deal.status);
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1];

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12">
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
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
                  {deal.company?.name_current || 'Unbenannt'}
                </h1>
                <Badge className={STATUS_COLORS[deal.status]}>
                  {STATUS_LABELS[deal.status]}
                </Badge>
              </div>
              <p className="text-slate-500">
                <span className="font-mono text-bronze">{deal.deal_number}</span>
                {' • '}
                {deal.deal_type === 'ankauf' ? 'Ankauf' : 'Verkauf'}
                {' • '}
                Erstellt am {new Date(deal.created_at).toLocaleDateString('de-CH')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/deals/${id}/edit`)}
                className="hover:border-bronze hover:text-bronze"
              >
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
              
              {nextStatus && (
                <Button
                  onClick={() => handleStatusChange(nextStatus)}
                  className="btn-primary"
                  data-testid="advance-status-btn"
                >
                  → {STATUS_LABELS[nextStatus]}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Validation Alerts */}
        {validation && !validation.valid && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in" data-testid="validation-errors">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Validierungsfehler
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              {validation.errors.map((err, i) => (
                <li key={i}>• {err.message}</li>
              ))}
            </ul>
          </div>
        )}

        {validation?.warnings?.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Hinweise
            </div>
            <ul className="text-sm text-yellow-600 space-y-1">
              {validation.warnings.map((warn, i) => (
                <li key={i}>• {warn.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-bronze data-[state=active]:text-white">
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-bronze data-[state=active]:text-white">
              Dokumente
            </TabsTrigger>
            <TabsTrigger value="attachments" className="data-[state=active]:bg-bronze data-[state=active]:text-white">
              Anhänge
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-bronze data-[state=active]:text-white">
              Historie
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Info */}
              <Card className="card-premium" data-testid="company-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-bronze" />
                    Gesellschaft
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Firma aktuell</span>
                      <p className="font-medium">{deal.company?.name_current || '–'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Firma neu</span>
                      <p className="font-medium">{deal.company?.name_new || '–'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Sitz</span>
                      <p className="font-medium">{deal.company?.sitz_current || '–'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">CHE-Nr.</span>
                      <p className="font-medium font-mono">{deal.company?.che_nummer || '–'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Aktienkapital</span>
                      <p className="font-medium font-mono">
                        {deal.company?.aktienkapital ? `CHF ${deal.company.aktienkapital.toLocaleString('de-CH')}` : '–'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Aktien</span>
                      <p className="font-medium">
                        {deal.company?.anzahl_aktien || 0} × CHF {deal.company?.nennwert || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conditions */}
              <Card className="card-premium" data-testid="conditions-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-bronze" />
                    Konditionen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Kaufpreis</span>
                      <p className="font-medium font-mono text-lg">
                        {deal.kaufpreis ? `CHF ${deal.kaufpreis.toLocaleString('de-CH')}` : '–'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Besitzantritt</span>
                      <p className="font-medium">{deal.besitzantritt || '–'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Unterschriftsort</span>
                      <p className="font-medium">{deal.unterschriftsort || '–'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Unterschriftsdatum</span>
                      <p className="font-medium">{deal.unterschriftsdatum || '–'}</p>
                    </div>
                    {deal.anzahlung_aktiviert && (
                      <div>
                        <span className="text-slate-500">Anzahlung</span>
                        <p className="font-medium font-mono">CHF {deal.anzahlung?.toLocaleString('de-CH')}</p>
                      </div>
                    )}
                    {deal.darlehen_uebernahme && (
                      <div>
                        <span className="text-slate-500">Darlehen</span>
                        <p className="font-medium font-mono">CHF {deal.darlehen_betrag?.toLocaleString('de-CH')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sellers */}
              <Card className="card-premium" data-testid="sellers-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Verkäufer ({deal.sellers?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {deal.sellers?.length > 0 ? (
                    <div className="space-y-3">
                      {deal.sellers.map((seller, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{seller.name}</p>
                              <p className="text-sm text-slate-500">
                                {seller.ort && `${seller.plz} ${seller.ort}`}
                                {seller.role && ` • ${seller.role === 'aktionaer' ? 'Aktionär' : seller.role === 'vr' ? 'VR' : 'Aktionär & VR'}`}
                              </p>
                            </div>
                            {seller.requires_signature && (
                              <Badge variant="outline" className="text-xs">Unterschrift</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Keine Verkäufer definiert</p>
                  )}
                </CardContent>
              </Card>

              {/* Buyers */}
              <Card className="card-premium" data-testid="buyers-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Käufer ({deal.buyers?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {deal.buyers?.length > 0 ? (
                    <div className="space-y-3">
                      {deal.buyers.map((buyer, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{buyer.name}</p>
                              <p className="text-sm text-slate-500">
                                {buyer.ort && `${buyer.plz} ${buyer.ort}`}
                                {buyer.role && ` • ${buyer.role === 'aktionaer' ? 'Aktionär' : buyer.role === 'vr' ? 'VR' : 'Aktionär & VR'}`}
                              </p>
                            </div>
                            {buyer.requires_signature && (
                              <Badge variant="outline" className="text-xs">Unterschrift</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Keine Käufer definiert</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {deal.notizen && (
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Notizen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{deal.notizen}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="card-premium" data-testid="documents-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg">Dokumente generieren</CardTitle>
                    <CardDescription>Wählen Sie ein Template aus</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates
                    .filter(t => t.deal_types.includes(deal.deal_type))
                    .map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleGenerateDocument(template.id)}
                        disabled={generating === template.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-bronze hover:bg-bronze/5 transition-all text-left group disabled:opacity-50"
                        data-testid={`generate-${template.document_type}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <FileText className="w-5 h-5 text-bronze" />
                          {generating === template.id && (
                            <RefreshCw className="w-4 h-4 text-bronze animate-spin" />
                          )}
                        </div>
                        <h4 className="font-medium text-slate-900 group-hover:text-bronze transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium" data-testid="generated-docs-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Generierte Dokumente</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-bronze" />
                          <div>
                            <p className="font-medium text-slate-900">{doc.template_name}</p>
                            <p className="text-xs text-slate-500">
                              Version {doc.version} • {new Date(doc.created_at).toLocaleString('de-CH')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                          className="hover:border-bronze hover:text-bronze"
                          data-testid={`download-${doc.id}`}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Noch keine Dokumente generiert</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-6">
            <Card className="card-premium" data-testid="attachments-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg">Anhänge / Beilagen</CardTitle>
                    <CardDescription>Dokumente die dem Deal beigefügt werden</CardDescription>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleUploadAttachment}
                      disabled={uploading}
                    />
                    <Button
                      as="span"
                      variant="outline"
                      disabled={uploading}
                      className="hover:border-bronze hover:text-bronze cursor-pointer"
                    >
                      {uploading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Hochladen
                    </Button>
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                {attachments.length > 0 ? (
                  <div className="space-y-3">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{attachment.filename}</p>
                            <p className="text-xs text-slate-500">
                              {ATTACHMENT_TYPES.find(t => t.value === attachment.attachment_type)?.label || 'Sonstige'}
                              {' • '}
                              {new Date(attachment.created_at).toLocaleDateString('de-CH')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Noch keine Anhänge hochgeladen</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Verlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-bronze/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Plus className="w-4 h-4 text-bronze" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Deal erstellt</p>
                      <p className="text-sm text-slate-500">
                        {new Date(deal.created_at).toLocaleString('de-CH')}
                      </p>
                    </div>
                  </div>
                  
                  {deal.updated_at !== deal.created_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Zuletzt bearbeitet</p>
                        <p className="text-sm text-slate-500">
                          {new Date(deal.updated_at).toLocaleString('de-CH')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {doc.template_name} generiert (v{doc.version})
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(doc.created_at).toLocaleString('de-CH')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ChatbotWidget dealId={id} />
      <ServerStatus />
    </div>
  );
}
