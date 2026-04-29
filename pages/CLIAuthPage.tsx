import React, { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, ShieldCheck } from 'lucide-react';

const CLIAuthPage: React.FC = () => {
  const { currentUser: user, idToken } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'ready' | 'connecting' | 'done' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  
  const deviceCode = searchParams.get('code');

  useEffect(() => {
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${returnUrl}`);
      return;
    }
    setStatus('ready');
  }, [user, navigate]);

  const handleAuthorize = async () => {
    if (!user || !idToken || !deviceCode) return;
    
    setStatus('connecting');
    try {
      const response = await fetch('/api/cli-authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceCode,
          idToken,
          refreshToken: localStorage.getItem('fb_refresh_token') || '',
          email: user.email,
          uid: user.uid
        })
      });

      if (response.ok) {
        setStatus('done');
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Authorization failed');
        setStatus('error');
      }
    } catch (err) {
      console.error('Authorization error:', err);
      setErrorMessage('Network error');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Connect Device</h1>
        
        {status === 'ready' && (
          <>
            <p className="text-slate-400 mb-6">
              Confirm this code matches the one shown in your terminal:
            </p>
            <div className="bg-slate-800 text-white text-3xl font-mono tracking-widest py-4 px-6 rounded-xl mb-8 border border-slate-700">
              {deviceCode}
            </div>
            <button
              onClick={handleAuthorize}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Authorize Terminal
            </button>
          </>
        )}

        {status === 'connecting' && (
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-indigo-400 font-medium">Authorizing...</p>
          </div>
        )}

        {status === 'done' && (
          <div className="py-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connected!</h2>
            <p className="text-slate-400">You can now close this window and return to your terminal.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 text-center">
            <p className="text-red-400 mb-4 font-medium">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CLIAuthPage;
