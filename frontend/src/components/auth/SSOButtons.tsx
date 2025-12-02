import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  simulateGoogleOAuth,
  simulateMicrosoftOAuth,
  simulateGitHubOAuth,
  findUserByProvider,
  findUserByEmail,
  createSSOUser,
  createSession,
  type SSOUser
} from '../../utils/sso';

interface SSOButtonsProps {
  onSuccess?: () => void;
}

const SSOButtons: React.FC<SSOButtonsProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSSOLogin = async (provider: 'google' | 'microsoft' | 'github') => {
    setLoading(provider);
    
    try {
      let profile;
      
      // Simulate OAuth flow based on provider
      switch (provider) {
        case 'google':
          profile = await simulateGoogleOAuth();
          break;
        case 'microsoft':
          profile = await simulateMicrosoftOAuth();
          break;
        case 'github':
          profile = await simulateGitHubOAuth();
          break;
      }
      
      if (!profile) {
        toast.error('SSO authentication failed');
        setLoading(null);
        return;
      }

      // Check if user exists with this provider
      let user = findUserByProvider(provider, profile.providerId);
      
      // If not found by provider, check by email
      if (!user) {
        user = findUserByEmail(profile.email);
        
        if (user && !user.ssoLinked) {
          // User exists but hasn't linked SSO - for security, require manual linking
          toast.error('This email is already registered. Please login with password first to link SSO.');
          setLoading(null);
          return;
        }
      }
      
      // Create new user if doesn't exist
      if (!user) {
        user = createSSOUser(
          profile.email,
          profile.name,
          provider,
          profile.providerId,
          profile.picture
        );
        toast.success('SSO account created successfully!');
      }

      // Check manager approval
      if (user.role === 'manager' && user.isApproved === false) {
        toast.error('Your manager account is pending admin approval');
        setLoading(null);
        return;
      }

      // Create SSO session
      createSession(user.id, provider);

      // Store user data
      localStorage.setItem('nebulaUser', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        picture: user.picture,
        provider
      }));

      toast.success(`Welcome${user ? ' back' : ''}, ${user.name}!`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('SSO error:', error);
      toast.error('SSO authentication failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-nebula-700/30" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-nebula-950 px-2 text-nebula-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Google SSO */}
        <button
          type="button"
          onClick={() => handleSSOLogin('google')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-3 px-4 py-3 border border-nebula-700/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-sm font-medium text-nebula-100">
            {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>

        {/* Microsoft SSO */}
        <button
          type="button"
          onClick={() => handleSSOLogin('microsoft')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-3 px-4 py-3 border border-nebula-700/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading === 'microsoft' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f3f3f3" d="M0 0h23v23H0z" />
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
          )}
          <span className="text-sm font-medium text-nebula-100">
            {loading === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
          </span>
        </button>

        {/* GitHub SSO */}
        <button
          type="button"
          onClick={() => handleSSOLogin('github')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-3 px-4 py-3 border border-nebula-700/30 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading === 'github' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          )}
          <span className="text-sm font-medium text-nebula-100">
            {loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SSOButtons;
