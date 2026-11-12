import { useStore } from '../store/useStore';
import { ShieldAlert, Home } from 'lucide-react';

export function Denied() {
  const { lang, setCurrentScreen } = useStore();

  return (
    <div className="h-full flex items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-2xl flex items-center justify-center">
          <ShieldAlert size={32} className="text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          {lang === 'en' ? 'Access Restricted' : 'पहुँच प्रतिबंधित'}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {lang === 'en'
            ? 'This section is reserved for authorised MCG / GMDA officials. If you believe you should have access, please contact your administrator.'
            : 'यह अनुभाग अधिकृत MCG / GMDA अधिकारियों के लिए आरक्षित है। यदि आपको लगता है कि आपको पहुँच मिलनी चाहिए, तो कृपया अपने व्यवस्थापक से संपर्क करें।'
          }
        </p>
        <button
          onClick={() => setCurrentScreen('citizen-home')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors"
        >
          <Home size={18} />
          {lang === 'en' ? 'Go to citizen home' : 'नागरिक होम पर जाएं'}
        </button>
      </div>
    </div>
  );
}
