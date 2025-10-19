
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentTasks from '../components/dashboard/RecentTasks';
import UserList from '../components/dashboard/UserList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { Task } from '../types';

type UserData = {
  id: string;
  email: string;
  role: string;
  name: string;
};

type ActivityData = {
  name: string;
  tasks: number;
  completed: number;
};

const Dashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('nebulaUser');
    if (!storedUser) {
      navigate('/');
      return;
    }
    
    try {
      const user = JSON.parse(storedUser) as UserData;
      setUserData(user);
      
      // Generate activity data based on actual tasks
      generateActivityData(user.id, user.role === 'admin');
    } catch (e) {
      localStorage.removeItem('nebulaUser');
      navigate('/');
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [navigate]);

  const generateActivityData = (userId: string, isAdmin: boolean) => {
    // Get tasks from localStorage
    const tasksJson = localStorage.getItem('nebulaTasks');
    if (!tasksJson) {
      setActivityData(getDummyActivityData());
      return;
    }

    try {
      const tasks = JSON.parse(tasksJson) as Task[];
      
      // Filter tasks based on user role
      const relevantTasks = isAdmin 
        ? tasks 
        : tasks.filter(task => task.assignedTo === userId);
      
      // Generate data for the last 7 days
      const last7Days: ActivityData[] = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStart = new Date(date.setHours(0,0,0,0));
        const dayEnd = new Date(date.setHours(23,59,59,999));
        
        // Count tasks created on this day
        const tasksCreated = relevantTasks.filter(task => {
          const createdDate = new Date(task.createdAt);
          return createdDate >= dayStart && createdDate <= dayEnd;
        }).length;
        
        // Count tasks completed on this day
        const tasksCompleted = relevantTasks.filter(task => {
          const createdDate = new Date(task.createdAt);
          return task.status === 'complete' && createdDate >= dayStart && createdDate <= dayEnd;
        }).length;
        
        last7Days.push({
          name: dayStr,
          tasks: tasksCreated,
          completed: tasksCompleted
        });
      }
      
      setActivityData(last7Days.length > 0 ? last7Days : getDummyActivityData());
    } catch (e) {
      console.error("Error generating activity data:", e);
      setActivityData(getDummyActivityData());
    }
  };

  // Fallback data if no tasks exist yet
  const getDummyActivityData = (): ActivityData[] => {
    return [
      { name: 'Mon', tasks: 0, completed: 0 },
      { name: 'Tue', tasks: 0, completed: 0 },
      { name: 'Wed', tasks: 0, completed: 0 },
      { name: 'Thu', tasks: 0, completed: 0 },
      { name: 'Fri', tasks: 0, completed: 0 },
      { name: 'Sat', tasks: 0, completed: 0 },
      { name: 'Sun', tasks: 0, completed: 0 },
    ];
  };

  if (!userData) return null;
  
  const isAdmin = userData.role === 'admin';
  const greeting = getGreeting();

  function getGreeting() {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{greeting}, {userData.name}</h1>
              <div className="bg-nebula-500/10 px-2 py-1 rounded text-xs text-nebula-400 font-medium animate-pulse">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your {isAdmin ? 'team\'s' : 'assigned'} tasks and recent activity.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <div className="h-10 w-10 rounded-full bg-nebula-500/10 flex items-center justify-center">
              <Calendar size={18} className="text-nebula-400" />
            </div>
          </div>
        </div>
        
        <DashboardStats isAdmin={isAdmin} currentUserId={userData.id} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Weekly Activity</CardTitle>
                <CardDescription>Task creation and completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={activityData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6661e6" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#6661e6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="tasks" 
                        stroke="#6661e6" 
                        fillOpacity={1} 
                        fill="url(#colorTasks)" 
                        name="Total Tasks"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorCompleted)" 
                        name="Completed Tasks"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <RecentTasks isAdmin={isAdmin} currentUserId={userData.id} />
            </div>
          </div>
          
          <div className="space-y-6">
            {isAdmin && (
              <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Users</CardTitle>
                  <CardDescription>Manage your team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserList />
                </CardContent>
              </Card>
            )}
            
            <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Task Status</CardTitle>
                <CardDescription>Overview of current task progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-emerald-500" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span id="completed-count" className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-amber-500" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <span id="in-progress-count" className="font-bold">0</span>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle size={18} className="text-red-500" />
                        <span className="text-sm font-medium">Overdue</span>
                      </div>
                      <span id="overdue-count" className="font-bold">0</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="relative pt-1">
                    <div className="text-xs text-muted-foreground flex justify-between mb-1">
                      <span>Total Completion</span>
                      <span id="completion-percentage">0%</span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary/50">
                      <div id="completion-bar" style={{ width: "0%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-nebula-500"></div>
                    </div>
                  </div>
                </div>

                <script dangerouslySetInnerHTML={{
                  __html: `
                    // Update task counts
                    (function updateTaskCounts() {
                      const tasksJson = localStorage.getItem('nebulaTasks');
                      if (!tasksJson) return;
                      
                      try {
                        const tasks = JSON.parse(tasksJson);
                        const isAdmin = ${isAdmin};
                        const userId = "${userData.id}";
                        
                        // Filter tasks based on user role
                        const relevantTasks = isAdmin 
                          ? tasks 
                          : tasks.filter(task => task.assignedTo === userId);
                          
                        const completed = relevantTasks.filter(task => task.status === 'complete').length;
                        const inProgress = relevantTasks.filter(task => task.status === 'incomplete').length;
                        const now = new Date();
                        const overdue = relevantTasks.filter(task => {
                          const deadline = new Date(task.deadline);
                          return task.status === 'incomplete' && deadline < now;
                        }).length;
                        
                        const total = relevantTasks.length;
                        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                        
                        // Update the DOM
                        document.getElementById('completed-count').textContent = completed;
                        document.getElementById('in-progress-count').textContent = inProgress;
                        if (isAdmin) {
                          document.getElementById('overdue-count').textContent = overdue;
                        }
                        document.getElementById('completion-percentage').textContent = completionPercentage + '%';
                        document.getElementById('completion-bar').style.width = completionPercentage + '%';
                      } catch (e) {
                        console.error("Error updating task counts:", e);
                      }
                    })();
                  `
                }} />
              </CardContent>
            </Card>
            
            {!isAdmin && (
              <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Submit Query</CardTitle>
                  <CardDescription>Need help? Submit a query to your admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const queryInput = form.querySelector('textarea') as HTMLTextAreaElement;
                    
                    if (!queryInput.value.trim()) return;
                    
                    // Store the query in localStorage
                    const query = {
                      id: Date.now().toString(),
                      userId: userData.id,
                      userName: userData.name,
                      text: queryInput.value,
                      timestamp: new Date().toISOString(),
                      status: 'pending'
                    };
                    
                    const queries = JSON.parse(localStorage.getItem('nebulaQueries') || '[]');
                    queries.push(query);
                    localStorage.setItem('nebulaQueries', JSON.stringify(queries));
                    
                    // Reset form and show confirmation
                    queryInput.value = '';
                    alert('Your query has been submitted successfully!');
                  }}>
                    <textarea 
                      className="nebula-input w-full min-h-[100px] mb-4" 
                      placeholder="Type your question or issue here..."
                      required
                    ></textarea>
                    <button type="submit" className="nebula-button w-full">
                      Submit Query
                    </button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
