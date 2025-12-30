import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dealsApi, statsApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Plus, Search, FileText, Building2, TrendingUp, Clock, 
  ArrowRight, Filter, ShoppingCart, ShoppingBag
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatbotWidget from '../components/ChatbotWidget';
import ServerStatus from '../components/ServerStatus';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
  }, [filterStatus, filterType, searchQuery]);

  const loadData = async () => {
    try {
      const [dealsRes, statsRes] = await Promise.all([
        dealsApi.getAll({ 
          status: filterStatus || undefined, 
          deal_type: filterType || undefined,
          search: searchQuery || undefined
        }),
        statsApi.get()
      ]);
      setDeals(dealsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentDeals = deals.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Willkommen, {user?.name?.split(' ')[0] || 'zurück'}
          </h1>
          <p className="text-slate-500 mt-2">
            Hier ist Ihre Übersicht für heute
          </p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Main Stats Card */}
          <Card className="card-premium md:col-span-8 row-span-2 overflow-hidden" data-testid="main-stats-card">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-slate-900">Deal-Übersicht</h2>
                  <p className="text-slate-500 text-sm mt-1">Aktuelle Statistiken</p>
                </div>
                <Button 
                  onClick={() => navigate('/deals/new')} 
                  className="btn-primary"
                  data-testid="create-deal-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Neuer Deal
                </Button>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-bronze/10 rounded-md flex items-center justify-center">
                      <FileText className="w-5 h-5 text-bronze" />
                    </div>
                  </div>
                  <div className="text-3xl font-heading font-bold text-slate-900">
                    {stats?.total_deals || 0}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Gesamte Deals</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-heading font-bold text-slate-900">
                    {stats?.active_deals || 0}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Aktive Deals</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-heading font-bold text-slate-900">
                    {stats?.ankauf_deals || 0}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Ankäufe</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-heading font-bold text-slate-900">
                    {stats?.verkauf_deals || 0}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Verkäufe</div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-slate-600 mb-4">Status-Verteilung</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats?.status_counts || {}).map(([status, count]) => (
                    <Badge key={status} className={`${STATUS_COLORS[status]} px-3 py-1 text-sm`}>
                      {STATUS_LABELS[status]}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-premium md:col-span-4" data-testid="quick-actions-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-lg">Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 hover:border-bronze hover:text-bronze transition-all"
                onClick={() => navigate('/deals/new', { state: { type: 'ankauf' } })}
                data-testid="quick-ankauf-btn"
              >
                <ShoppingCart className="w-4 h-4 mr-3" />
                Neuer Ankauf
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 hover:border-bronze hover:text-bronze transition-all"
                onClick={() => navigate('/deals/new', { state: { type: 'verkauf' } })}
                data-testid="quick-verkauf-btn"
              >
                <ShoppingBag className="w-4 h-4 mr-3" />
                Neuer Verkauf
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 hover:border-bronze hover:text-bronze transition-all"
                onClick={() => navigate('/templates')}
                data-testid="quick-templates-btn"
              >
                <FileText className="w-4 h-4 mr-3" />
                Templates verwalten
              </Button>
            </CardContent>
          </Card>

          {/* Recent Deals */}
          <Card className="card-premium md:col-span-4" data-testid="recent-deals-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">Letzte Deals</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-bronze hover:text-bronze-hover"
                  onClick={() => navigate('/deals')}
                >
                  Alle anzeigen
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : recentDeals.length > 0 ? (
                recentDeals.map(deal => (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    className="block p-3 bg-slate-50 rounded-md hover:bg-slate-100 transition-all border border-transparent hover:border-bronze/20"
                    data-testid={`recent-deal-${deal.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900 text-sm">
                          {deal.company?.name_current || 'Unbenannt'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {deal.deal_number}
                        </div>
                      </div>
                      <Badge className={`${STATUS_COLORS[deal.status]} text-xs`}>
                        {STATUS_LABELS[deal.status]}
                      </Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Noch keine Deals vorhanden</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deals List with Search/Filter */}
        <Card className="card-premium" data-testid="deals-list-card">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="font-heading text-xl">Alle Deals</CardTitle>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64 input-premium"
                    data-testid="search-deals-input"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 px-3 rounded-sm border border-slate-200 bg-white text-sm focus:border-bronze focus:ring-1 focus:ring-bronze"
                  data-testid="filter-status-select"
                >
                  <option value="">Alle Status</option>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-10 px-3 rounded-sm border border-slate-200 bg-white text-sm focus:border-bronze focus:ring-1 focus:ring-bronze"
                  data-testid="filter-type-select"
                >
                  <option value="">Alle Typen</option>
                  <option value="ankauf">Ankauf</option>
                  <option value="verkauf">Verkauf</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-20 bg-slate-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : deals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Deal-Nr.</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Gesellschaft</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Typ</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Kaufpreis</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Erstellt</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map(deal => (
                      <tr 
                        key={deal.id} 
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/deals/${deal.id}`)}
                        data-testid={`deal-row-${deal.id}`}
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-bronze">{deal.deal_number}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-900">
                            {deal.company?.name_current || 'Unbenannt'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {deal.company?.sitz_current || '–'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="capitalize">
                            {deal.deal_type === 'ankauf' ? 'Ankauf' : 'Verkauf'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={STATUS_COLORS[deal.status]}>
                            {STATUS_LABELS[deal.status]}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 font-mono text-sm">
                          {deal.kaufpreis ? `CHF ${deal.kaufpreis.toLocaleString('de-CH')}` : '–'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500">
                          {new Date(deal.created_at).toLocaleDateString('de-CH')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-bronze">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">Keine Deals gefunden</h3>
                <p className="text-sm mb-6">Erstellen Sie Ihren ersten Deal, um loszulegen.</p>
                <Button onClick={() => navigate('/deals/new')} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Neuen Deal erstellen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <ChatbotWidget />
      <ServerStatus />
    </div>
  );
}
