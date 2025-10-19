
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileIcon } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import UserProfile from '../components/dashboard/UserProfile';
import Queries from '../components/dashboard/Queries';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../components/ui/dialog";
import { User } from '../types';

const TasksPage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQueries, setShowQueries] = useState(false);
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
    } catch (e) {
      localStorage.removeItem('nebulaUser');
      navigate('/');
    }
  }, [navigate]);

  if (!userData) return null;
  
  const isAdmin = userData.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? 'Manage and track all tasks' : 'View and update your assigned tasks'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowProfile(true)}
              className="nebula-button bg-nebula-500/20 text-nebula-400 hover:bg-nebula-500/30"
            >
              Profile
            </button>
            
            <button 
              onClick={() => navigate('/dashboard/files')}
              className="nebula-button bg-nebula-500/20 text-nebula-400 hover:bg-nebula-500/30 flex items-center gap-2"
            >
              <FileIcon size={16} />
              <span>Secure Files</span>
            </button>
            
            {isAdmin && (
              <>
                <button 
                  onClick={() => setShowQueries(true)}
                  className="nebula-button bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                >
                  Queries
                </button>
                
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="nebula-button flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>{showForm ? 'Hide Form' : 'New Task'}</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {isAdmin && showForm && (
          <div className="mb-6">
            <TaskForm />
          </div>
        )}
        
        <TaskList isAdmin={isAdmin} currentUserId={userData.id} />
      </div>
      
      {/* Profile Dialog */}
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
      
      {/* Queries Dialog for Admin */}
      {isAdmin && (
        <Dialog open={showQueries} onOpenChange={setShowQueries}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>User Queries</DialogTitle>
            </DialogHeader>
            <Queries />
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default TasksPage;
