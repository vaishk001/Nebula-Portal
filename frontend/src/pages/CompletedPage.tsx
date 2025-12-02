
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskItem from '../components/tasks/TaskItem';
import { User, Task } from '../types';
import { Card } from '../components/ui/card';
import { CheckCircle, FileText, Calendar, User as UserIcon } from 'lucide-react';
import { connectToDatabase } from '../utils/mongodb';

const CompletedPage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const storedUser = localStorage.getItem('nebulaUser');
      if (!storedUser) {
        navigate('/');
        return;
      }
      
      try {
        const user = JSON.parse(storedUser) as User;
        setUserData(user);
        
        // Only admin can access this page
        if (user.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        
        // Load completed tasks
        await loadCompletedTasks();
        await loadUsers();
      } catch (e) {
        localStorage.removeItem('nebulaUser');
        navigate('/');
      }
    };

    loadData();
  }, [navigate]);

  const loadCompletedTasks = async () => {
    try {
      // Try to load from MongoDB first
      try {
        const { db } = await connectToDatabase();
        const tasksCollection = db.collection('tasks');
        const tasks = await tasksCollection.find({ status: 'complete' }).toArray();
        
        if (tasks && tasks.length > 0) {
          setCompletedTasks(tasks as unknown as Task[]);
          return;
        }
      } catch (dbError) {
        console.error("Failed to load from MongoDB, falling back to localStorage", dbError);
      }
      
      // Fallback to localStorage
      const storedTasks = localStorage.getItem('nebulaTasks');
      if (storedTasks) {
        const allTasks = JSON.parse(storedTasks) as Task[];
        const completed = allTasks.filter(task => task.status === 'complete');
        setCompletedTasks(completed);
      }
    } catch (error) {
      console.error("Error loading completed tasks:", error);
    }
  };

  const loadUsers = async () => {
    try {
      // Try to load from MongoDB first
      try {
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');
        const usersData = await usersCollection.find().toArray();
        
        if (usersData && usersData.length > 0) {
          setUsers(usersData as unknown as User[]);
          return;
        }
      } catch (dbError) {
        console.error("Failed to load users from MongoDB, falling back to localStorage", dbError);
      }
      
      // Fallback to localStorage
      const storedUsers = localStorage.getItem('nebulaUsers');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers) as User[]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!userData) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              Completed Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              All completed tasks across the organization
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Completed</p>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/20">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {completedTasks.filter(task => {
                    const completedDate = new Date(task.createdAt);
                    const now = new Date();
                    return completedDate.getMonth() === now.getMonth() && 
                           completedDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/20">
                <UserIcon className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {new Set(completedTasks.map(task => task.assignedTo)).size}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Completed Tasks List */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-nebula-400" />
              Completed Tasks
            </h2>
            
            {completedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-muted">
                  <CheckCircle size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No completed tasks yet</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Completed tasks will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div key={task.id} className="group">
                    <Card className="p-4 bg-background/50 border-border/50 hover:border-green-500/30 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/20 mt-1">
                            <CheckCircle className="text-green-400" size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
                            
                            {task.longDescription && (
                              <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {task.longDescription}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <UserIcon size={14} />
                                <span>{getUserName(task.assignedTo)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>Due: {formatDate(task.deadline)}</span>
                              </div>
                              {task.createdAt && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle size={14} />
                                  <span>Completed: {formatDate(task.createdAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompletedPage;
