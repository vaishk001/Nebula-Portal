import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, LogOut, 
  Bell, Menu, X, ChevronRight, User as UserIcon, LayoutDashboard, FileIcon,
  CheckCircle
} from 'lucide-react';
import NebulaBranding from '../NebulaBranding';
import StarBackground from '../StarBackground';
import ThemeToggle from '../ThemeToggle';
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import UserProfile from '../dashboard/UserProfile';
import { User } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [notifications, setNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('nebulaUser');
    if (!storedUser) {
      navigate('/');
      return;
    }
    
    try {
      const user = JSON.parse(storedUser) as User;
      setUserData(user);
      
      // Set active menu based on current path
      const path = window.location.pathname;
      if (path.includes('tasks')) setActiveMenu('tasks');
      else if (path.includes('files')) setActiveMenu('files');
      else if (path.includes('completed')) setActiveMenu('completed');
      else setActiveMenu('dashboard');
      
      // Check for notifications (like pending queries for admin)
      if (user.role === 'admin') {
        const queries = JSON.parse(localStorage.getItem('nebulaQueries') || '[]');
        const pendingQueries = queries.filter((q: any) => q.status === 'pending');
        setNotifications(pendingQueries.length);
      }
    } catch (e) {
      localStorage.removeItem('nebulaUser');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('nebulaUser');
    navigate('/');
  };

  if (!userData) {
    return null; // Will redirect due to the useEffect
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} className="text-nebula-400" />,
      path: '/dashboard',
    },
    {
      key: 'tasks',
      label: 'Tasks',
      icon: <ClipboardList size={18} className="text-nebula-400" />,
      path: '/dashboard/tasks',
    },
    {
      key: 'files',
      label: 'Secure Files',
      icon: <FileIcon size={18} className="text-nebula-400" />,
      path: '/dashboard/files',
    }
  ];
  
  if (userData.role === 'admin') {
    menuItems.push(
      {
        key: 'completed',
        label: 'Completed',
        icon: <CheckCircle size={18} className="text-nebula-400" />,
        path: '/dashboard/completed',
      }
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <StarBackground />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nebula-glow opacity-15 blur-3xl"></div>
      </div>
      
      <header className="relative z-50 border-b border-border/30 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto">
          <div className="flex justify-between items-center h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <NebulaBranding size="medium" />
            </div>
            
            <div className="hidden lg:flex items-center justify-center flex-1">
              <NavigationMenu className="mx-auto">
                <NavigationMenuList className="flex space-x-2">
                  {menuItems.map(item => (
                    <NavigationMenuItem key={item.key}>
                      <NavigationMenuLink
                        href={item.path}
                        className={
                          activeMenu === item.key
                            ? "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-nebula-600/20 text-nebula-300 hover:bg-nebula-600/30 transition-all"
                            : "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full hover:bg-nebula-600/10 transition-all"
                        }
                        onClick={() => setActiveMenu(item.key)}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-nebula-950 shadow-inner shadow-nebula-500/20">
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            
            <div className="flex lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(true)}
                className="text-foreground"
              >
                <Menu size={24} />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              {userData?.role === 'admin' && (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => {
                      navigate('/dashboard/tasks');
                      const url = new URL(window.location.href);
                      url.searchParams.set('showQueries', 'true');
                      window.history.pushState({}, '', url);
                      window.dispatchEvent(new Event('popstate'));
                    }}
                  >
                    <Bell size={20} />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nebula-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-nebula-500 text-[10px] font-medium justify-center items-center text-white">
                          {notifications}
                        </span>
                      </span>
                    )}
                  </Button>
                </div>
              )}
              
              <ThemeToggle />
              
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center gap-2 h-9 bg-transparent">
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={`https://avatar.vercel.sh/${userData.id}.png`} />
                        <AvatarFallback className="bg-nebula-600 text-white">{getInitials(userData.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:block">
                        {userData.name}
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-60 p-3">
                        <div className="mb-2 mt-1 px-2 text-xs font-semibold text-muted-foreground">
                          Signed in as <span className="text-foreground font-bold">{userData.email}</span>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => setShowProfile(true)}
                            className="w-full px-2 py-1.5 rounded-md hover:bg-secondary/80 text-sm flex items-center gap-2 text-left"
                          >
                            <UserIcon size={15} />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => navigate('/dashboard/tasks')}
                            className="w-full px-2 py-1.5 rounded-md hover:bg-secondary/80 text-sm flex items-center gap-2 text-left"
                          >
                            <ClipboardList size={15} />
                            <span>Tasks</span>
                          </button>
                          <button 
                            onClick={handleLogout}
                            className="w-full mt-2 px-2 py-1.5 rounded-md hover:bg-destructive/20 hover:text-destructive text-sm flex items-center gap-2 text-left"
                          >
                            <LogOut size={15} />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </header>
      
      <div className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)}>
        <div 
          className={`absolute top-0 left-0 h-full w-3/4 max-w-xs bg-sidebar/95 backdrop-blur-lg shadow-xl transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-5 border-b border-border/30">
            <NebulaBranding size="small" />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-full hover:bg-sidebar-accent"
            >
              <X size={20} className="text-sidebar-foreground" />
            </button>
          </div>
          
          <div className="px-4 py-6">
            <Card className="p-4 bg-sidebar-accent/50 border-border/10">
              <div className="flex items-center gap-3">
                <Avatar className="border-2 border-nebula-500/50">
                  <AvatarImage src={`https://avatar.vercel.sh/${userData.id}.png`} />
                  <AvatarFallback className="bg-nebula-600 text-white">{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{userData.name}</p>
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-nebula-500/20 text-nebula-400">
                    {userData.role}
                  </span>
                </div>
              </div>
            </Card>
          </div>
          
          <nav className="px-4 space-y-1">
            {menuItems.map(item => (
              <a 
                key={item.key}
                href={item.path} 
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/80 group transition-all"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-nebula-600/10 group-hover:bg-nebula-600/20 transition-all">
                  {item.icon}
                </div>
                <span>{item.label}</span>
                <ChevronRight size={16} className="ml-auto text-muted-foreground" />
              </a>
            ))}
            
            <div className="pt-4 mt-4 border-t border-border/30">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowProfile(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/80 group transition-all"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-nebula-600/10 group-hover:bg-sidebar-accent/20 transition-all">
                  <UserIcon size={18} className="text-nebula-400" />
                </div>
                <span>Profile</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/80 group transition-all"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-nebula-600/10 group-hover:bg-destructive/20 transition-all">
                  <LogOut size={18} className="text-nebula-400 group-hover:text-destructive" />
                </div>
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      <main className="flex-1 overflow-auto bg-background/30 backdrop-blur-sm">
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-14 h-14 rounded-full bg-nebula-600 text-white flex items-center justify-center shadow-lg shadow-nebula-600/20 hover:shadow-nebula-600/40 transition-all"
        >
          <LayoutDashboard size={24} />
        </button>
      </div>
      
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <UserProfile userData={userData} onUpdate={updatedUser => {
            localStorage.setItem('nebulaUser', JSON.stringify(updatedUser));
            setUserData(updatedUser);
            setShowProfile(false);
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardLayout;
