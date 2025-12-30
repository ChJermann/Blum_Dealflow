import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const LOGIN_BG = "https://images.unsplash.com/photo-1752999050353-6386a060b771?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxzd2lzcyUyMGFscHMlMjBtb3VudGFpbnMlMjBsYW5kc2NhcGUlMjBtaW5pbWFsaXN0fGVufDB8fHx8MTc2NzA4NTgwMHww&ixlib=rb-4.1.0&q=85";
const BLUM_LOGO = "https://customer-assets.emergentagent.com/job_9070e371-71fc-4a23-b411-e6a30412bc7d/artifacts/04io5yv7_blum-logo.svg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ungültige Anmeldedaten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 xl:w-2/3 parallax-bg relative"
        style={{ backgroundImage: `url(${LOGIN_BG})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40" />
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
          <div className="flex items-center gap-4 mb-8">
            <img 
              src={BLUM_LOGO} 
              alt="Blum Verwaltungs- und Treuhand AG" 
              className="h-16 w-auto"
            />
          </div>
          
          <h2 className="font-heading text-4xl xl:text-5xl text-white font-bold mb-6 leading-tight">
            Professionelles<br />
            Deal-Management
          </h2>
          <p className="text-white/80 text-lg max-w-lg leading-relaxed">
            Verwalten Sie Ihre AG-Transaktionen effizient. Automatisierte Dokumentenerstellung, 
            strukturierte Workflows und intelligente Unterstützung.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-md p-4">
              <div className="text-2xl font-heading text-bronze font-bold">100+</div>
              <div className="text-white/70 text-sm">Abgeschlossene Deals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-md p-4">
              <div className="text-2xl font-heading text-bronze font-bold">6</div>
              <div className="text-white/70 text-sm">Dokumenttypen</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-md p-4">
              <div className="text-2xl font-heading text-bronze font-bold">24/7</div>
              <div className="text-white/70 text-sm">KI-Assistent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8 bg-snow">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img 
              src={BLUM_LOGO} 
              alt="Blum Verwaltungs- und Treuhand AG" 
              className="h-12 w-auto"
            />
          </div>

          <Card className="border-0 shadow-card-hover animate-fade-in" data-testid="login-card">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-heading font-semibold text-slate-900">
                Willkommen
              </CardTitle>
              <CardDescription className="text-slate-500">
                Melden Sie sich an, um fortzufahren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@beispiel.ch"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-premium h-11"
                    data-testid="login-email-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-premium h-11 pr-10"
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm animate-scale-in" data-testid="login-error">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-primary h-11 text-base"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Bitte warten...
                    </span>
                  ) : (
                    'Anmelden'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} Blum Verwaltungs- und Treuhand AG
          </p>
        </div>
      </div>
    </div>
  );
}
