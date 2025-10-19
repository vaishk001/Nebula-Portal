
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import StarBackground from '../components/StarBackground';
import ThemeToggle from '../components/ThemeToggle';
import { Rocket, Globe, Satellite, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('nebulaUser');
    if (storedUser) {
      // Redirect to dashboard
      navigate('/dashboard');
    }
    
    // Trigger animations after mount
    setMounted(true);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gradient-to-b from-[#0B0118] via-[#150A2E] to-[#0A0A1E] relative">
      {/* Enhanced Stars Background */}
      <StarBackground />
      
      {/* Additional Space Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Space Objects */}
        <div className="absolute top-20 left-10 animate-float opacity-60">
          <Globe size={24} className="text-nebula-400/50" />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-40" style={{ animationDelay: '2s' }}>
          <Satellite size={20} className="text-nebula-300/40" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float opacity-50" style={{ animationDelay: '4s' }}>
          <Rocket size={18} className="text-nebula-500/60" />
        </div>
        
        {/* Shooting Stars */}
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-comet opacity-80"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-nebula-300 rounded-full animate-comet opacity-60" style={{ animationDelay: '3s' }}></div>
        
        {/* Nebula Glow Effects */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nebula-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      {/* Welcome Message */}
      <div className="absolute top-8 left-8 z-20 text-nebula-200/80">
        <h1 className="text-lg font-medium">Welcome to Nebula Portal</h1>
      </div>
      
      {/* Auth Form with Enhanced Styling */}
      <div className={`z-10 relative transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <AuthForm />
      </div>
      
      {/* Bottom Space Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center text-nebula-300/60">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-2 h-2 bg-nebula-400 rounded-full animate-pulse"></div>
          <span className="text-xs">Connected to Nebula Network</span>
          <div className="w-2 h-2 bg-nebula-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <p className="text-xs">Secure • Encrypted • Reliable</p>
      </div>
    </div>
  );
};

export default Index;
