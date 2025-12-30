import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Plus, Users, Trash2, User, Mail, Shield, AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatbotWidget from '../components/ChatbotWidget';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const response = await axios.post(`${API}/users`, newUser);
      setUsers(prev => [...prev, response.data]);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', name: '', role: 'user' });
      toast.success('Benutzer erfolgreich erstellt');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler beim Erstellen');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error('Sie können sich nicht selbst löschen');
      return;
    }
    
    if (!window.confirm('Benutzer wirklich löschen?')) return;
    
    try {
      await axios.delete(`${API}/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Benutzer gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-snow">
        <Sidebar />
        <main className="flex-1 p-8 lg:p-12 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-heading font-semibold text-slate-700">Zugriff verweigert</h2>
            <p className="text-slate-500 mt-2">Sie haben keine Berechtigung für diese Seite.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-snow">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 tracking-tight">
              Benutzerverwaltung
            </h1>
            <p className="text-slate-500 mt-2">
              Verwalten Sie die Benutzer der Anwendung
            </p>
          </div>
          
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            data-testid="create-user-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neuer Benutzer
          </Button>
        </div>

        {/* Users List */}
        <Card className="card-premium" data-testid="users-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-bronze" />
              Alle Benutzer ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-3">
                {users.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    data-testid={`user-${user.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-bronze/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-bronze" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={user.role === 'admin' ? 'bg-bronze text-white' : 'bg-slate-200 text-slate-700'}>
                        {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                      </Badge>
                      
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Keine Benutzer gefunden</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-scale-in" data-testid="create-user-modal">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Neuen Benutzer erstellen</CardTitle>
                <CardDescription>Füllen Sie die Daten für den neuen Benutzer aus</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Max Muster"
                      required
                      className="input-premium"
                      data-testid="new-user-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>E-Mail *</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@beispiel.ch"
                      required
                      className="input-premium"
                      data-testid="new-user-email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Passwort *</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="input-premium"
                      data-testid="new-user-password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rolle</Label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full h-10 px-3 rounded-sm border border-slate-200 bg-white focus:border-bronze focus:ring-1 focus:ring-bronze"
                      data-testid="new-user-role"
                    >
                      <option value="user">Benutzer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      disabled={creating}
                      className="flex-1 btn-primary"
                      data-testid="submit-new-user"
                    >
                      {creating ? 'Erstellen...' : 'Erstellen'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <ChatbotWidget />
    </div>
  );
}
