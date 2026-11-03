import { useState } from 'react';
import { useStore } from '../store/useStore';
import { t } from '../i18n/translations';
import { Droplets, CloudRain, Loader2, AlertCircle } from 'lucide-react';

export function Login() {
  const { lang, setLang, login, loginAsCitizen } = useStore();
  const [state, setState] = useState<'idle' | 'authenticating' | 'error'>('idle');
  const [demoEmail, setDemoEmail] = useState('');
  const [showDemoPicker, setShowDemoPicker] = useState(false);

  const demoAccounts = [
    { email: 'ward.engineer@mcg.gov.in', name: 'Rajesh Kumar', role: 'Ward Engineer' },
    { email: 'control.room@mcg.gov.in', name: 'Priya Sharma', role: 'Control Room' },
    { email: 'commissioner@mcg.gov.in', name: 'Amit Verma', role: 'Commissioner' },
    { email: 'ddma.officer@gurugram.gov.in', name: 'Suresh Singh', role: 'DDMA Officer' },
  ];

  const handleGoogleSignIn = () => {
    setState('authenticating');
    // Simulate Google OAuth flow
    setTimeout(() => {
      setShowDemoPicker(true);
      setState('idle');
    }, 800);
  };

  const handleSelectDemoAccount = (email: string, name: string) => {
    setState('authenticating');
    setTimeout(() => {
      login(email, name, '');
      setState('idle');
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #F7F9FC 0%, #EAF0F8 100%)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">GFC</span>
          </div>
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary border border-border rounded-lg bg-white/60 backdrop-blur"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <div className="relative">
                <Droplets size={28} className="text-white" />
                <CloudRain size={14} className="text-white/70 absolute -top-1 -right-2" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{t('app.name', lang)}</h1>
            <p className="text-sm text-text-secondary mt-1">{t('app.tagline', lang)}</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
            {state === 'error' && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} className="text-risk-high flex-shrink-0" />
                <p className="text-sm text-risk-high">
                  {lang === 'en' ? 'Something went wrong. Please try again.' : 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'}
                </p>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={state === 'authenticating'}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-white hover:bg-background transition-colors font-medium text-sm disabled:opacity-60"
            >
              {state === 'authenticating' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>{lang === 'en' ? 'Sign in with Google' : 'Google से साइन इन करें'}</span>
            </button>

            {/* Demo account picker */}
            {showDemoPicker && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-text-secondary text-center mb-2">
                  {lang === 'en' ? 'Select a demo account:' : 'डेमो खाता चुनें:'}
                </p>
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectDemoAccount(acc.email, acc.name)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-background transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {acc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{acc.name}</p>
                      <p className="text-xs text-text-secondary truncate">{acc.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Continue as citizen */}
            <button
              onClick={loginAsCitizen}
              className="w-full py-2.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              {lang === 'en' ? 'Continue as citizen' : 'नागरिक के रूप में जारी रखें'}
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-text-secondary mt-4 px-4">
            {lang === 'en'
              ? 'Authorised MCG / GMDA officials only. Citizens can continue without signing in.'
              : 'केवल अधिकृत MCG / GMDA अधिकारी। नागरिक बिना साइन इन किए जारी रख सकते हैं।'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
