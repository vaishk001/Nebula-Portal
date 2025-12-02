
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, UserPlus, Star, Sparkles, Shield, Lock } from 'lucide-react';
import NebulaBranding from '../NebulaBranding';
import SSOButtons from './SSOButtons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getUsers, createUser, login } from '../../utils/api';
import { User } from '../../types';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user', // Default role
  });
  const [floating, setFloating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  const navigate = useNavigate();

  // Load users from MongoDB on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersFromDB = await getUsers();
        console.log('Loaded users from MongoDB:', usersFromDB);
        setUsers(usersFromDB);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users from database');
      }
    };
    loadUsers();
  }, []);

  // Generate some floating stars in the background
  useEffect(() => {
    setFloating(true);
    return () => setFloating(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login logic - use API endpoint with password verification
        console.log('Login attempt for:', formData.email);
        
        try {
          const user = await login(formData.email, formData.password);
          console.log('Login successful:', user);
          
          // Store user data in localStorage
          localStorage.setItem('nebulaUser', JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
          }));
          
          toast.success(`Welcome back, ${user.name}!`);
          setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error: any) {
          // Error is already handled by API utility with toast
          console.error('Login failed:', error);
        }
      } else {
        // Register logic
        if (!formData.name || !formData.email || !formData.password) {
          toast.error('Please fill in all fields');
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return;
        }
        
        // Password validation
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === formData.email);
        if (existingUser) {
          toast.error('An account with this email already exists');
          return;
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: formData.email,
          password: formData.password,
          role: formData.role as User['role'],
          name: formData.name,
          isApproved: formData.role === 'manager' ? false : true // Managers need approval
        };

        console.log('Creating user in MongoDB:', newUser);
        
        // Save to MongoDB via API
        const createdUser = await createUser(newUser);
        
        console.log('User created in MongoDB:', createdUser);
        
        // Reload users from database
        const updatedUsers = await getUsers();
        setUsers(updatedUsers);
        
        if (formData.role === 'manager') {
          toast.success('Manager account created! Waiting for admin approval.');
        } else {
          toast.success('Account created successfully! Please login.');
        }
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '', role: 'user' });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '', role: 'user' });
    setShowPassword(false);
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Space objects animation */}
      {floating && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Floating stars */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={`star-${i}`}
              className={`absolute rounded-full bg-white opacity-70 animate-star-twinkle star-${i % 6}`}
            />
          ))}
          
          {/* Space dust particles */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={`dust-${i}`}
              className={`absolute rounded-full animate-float dust-${i % 10}`}
            />
          ))}
        </div>
      )}
      
      {/* Main auth card with enhanced glassmorphism effect */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-nebula-950/40 via-nebula-900/50 to-nebula-800/30 border border-nebula-700/30 rounded-3xl shadow-2xl shadow-nebula-600/20 p-8 animate-fade-in overflow-hidden relative hover-lift">
        {/* Enhanced animated nebula glow effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-nebula-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-nebula-600/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:2s]"></div>
        <div className="absolute top-1/4 right-1/4 w-30 h-30 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:3s]"></div>
        
        {/* Security indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1 text-nebula-300/70">
          <Shield size={14} />
          <span className="text-xs">Secure</span>
        </div>
        
        <div className="flex justify-center mb-8 relative">
          <NebulaBranding />
          <div className="absolute top-0 -right-8 animate-pulse-slow opacity-80">
            <Sparkles size={16} className="text-nebula-300/70" />
          </div>
          <div className="absolute -bottom-4 -left-10 animate-pulse-slow opacity-80 [animation-delay:2s]">
            <Star size={18} className="text-nebula-400/70" fill="currentColor" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="nebula-label">Full Name</label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="nebula-input w-full"
                  placeholder="John Stellar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-nebula-400/5 to-nebula-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="nebula-label">Email</label>
            <div className="relative group">
              <input
                type="email"
                id="email"
                name="email"
                className="nebula-input w-full"
                placeholder="explorer@nebula.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-nebula-400/5 to-nebula-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="nebula-label">Password</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="nebula-input w-full pr-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-nebula-300 hover:text-nebula-100 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-nebula-400/5 to-nebula-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>
          
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="role" className="nebula-label">Account Type</label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="nebula-input w-full h-auto">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-nebula-900 border border-nebula-700/30 text-white">
                  <SelectItem value="user" className="hover:bg-nebula-800">Nebula User (Employee)</SelectItem>
                  <SelectItem value="manager" className="hover:bg-nebula-800">Nebula Manager (Requires Admin Approval)</SelectItem>
                  <SelectItem value="admin" className="hover:bg-nebula-800">Nebula Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="nebula-button w-full flex items-center justify-center gap-2 group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="loading w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-nebula-400/0 via-nebula-400/30 to-nebula-400/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></span>
                {isLogin ? (
                  <>
                    <LogIn size={18} className="transition-transform group-hover:rotate-12" />
                    <span>Enter Nebula</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="transition-transform group-hover:rotate-12" />
                    <span>Join Nebula</span>
                  </>
                )}
              </>
            )}
          </button>
        </form>
        
        {/* SSO Buttons - Only show on login */}
        {isLogin && (
          <div className="mt-6">
            <SSOButtons />
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button 
            onClick={toggleForm}
            disabled={isLoading}
            className="text-nebula-300 hover:text-nebula-100 font-medium transition-colors relative group disabled:opacity-50"
          >
            {isLogin ? "New to Nebula? Create account" : "Already part of Nebula? Sign in"}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-nebula-400/80 to-nebula-600/80 group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>
        
        {/* Security features indicator */}
        <div className="mt-6 pt-4 border-t border-nebula-700/30">
          <div className="flex items-center justify-center gap-4 text-xs text-nebula-400/60">
            <div className="flex items-center gap-1">
              <Lock size={12} />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={12} />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
