import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, ShieldCheck } from 'lucide-react';

const CLIAuthPage: React.FC = () => {
  const { user, idToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'ready' | 'connecting' | 'done' | 'error'>('checking');
  
  const port = searchParams.get('port');

  useEffect(() => {
    if (!user) {
      // Not logged in, send to login but remember where we were
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${returnUrl}`);
      return;
    }

    if (user && idToken && port) {
      handleConnect();
    }
  }, [user, idToken, port]);

  const handleConnect = async () => {
    setStatus('connecting');
    try {
      // Get full session info from storage or context if available
      // For now we'll send the available idToken and user details
      const callbackUrl = `http://localhost:${port}/callback?idToken=${idToken}&email=${encodeURIComponent(user?.email || '')}&uid=${user?.uid}&refreshToken=${localStorage.getItem('fb_refresh_token') || ''}`;
      window.location.href = callbackUrl;
      setStatus('done');
    } catch (err) {
      console.error('Connection error:', err);
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

        <h1 className="text-2xl font-bold text-white mb-2">CLI Authentication</h1>
        <p className="text-slate-400 mb-8">
          Linking your browser session to the EbookStudio terminal.
        </p>

        {status === 'connecting' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-indigo-400 font-medium">Sending credentials to CLI...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-400">
            <p>Something went wrong. Please try running <code className="bg-slate-800 px-2 py-1 rounded">ebookstudio login</code> manually.</p>
          </div>
        )}
        
        {!port && (
          <div className="text-yellow-400">
            <p>Invalid request. Missing port parameter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CLIAuthPage;
