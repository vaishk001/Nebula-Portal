
import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, ClipboardList } from 'lucide-react';
import { Card } from "../ui/card";
import { Task } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  colorClass?: string;
}

interface DashboardStatsProps {
  isAdmin: boolean;
  currentUserId: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  colorClass = 'from-nebula-500/20 to-nebula-600/20' 
}: StatCardProps) => (
  <Card className={`overflow-hidden border-border/30 bg-card/60 backdrop-blur-sm`}>
    <div className={`absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b ${colorClass}`}></div>
    <div className="p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-end gap-2 mt-2">
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  </Card>
);

const DashboardStats = ({ isAdmin, currentUserId }: DashboardStatsProps) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0
  });

  useEffect(() => {
    // Get tasks from localStorage
    const tasksJson = localStorage.getItem('nebulaTasks');
    if (!tasksJson) return;

    try {
      const tasks = JSON.parse(tasksJson) as Task[];
      
      // Filter tasks based on user role
      const relevantTasks = isAdmin 
        ? tasks // Admin sees all tasks
        : tasks.filter(task => task.assignedTo === currentUserId); // User sees only their tasks
      
      const completed = relevantTasks.filter(task => task.status === 'complete').length;
      const inProgress = relevantTasks.filter(task => task.status === 'incomplete').length;
      
      setStats({
        total: relevantTasks.length,
        completed,
        inProgress
      });
    } catch (e) {
      console.error("Error parsing tasks:", e);
    }
  }, [isAdmin, currentUserId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Tasks"
        value={stats.total}
        description={isAdmin ? "All assigned tasks" : "Your assigned tasks"}
        icon={<ClipboardList size={24} className="text-nebula-500" />}
        colorClass="from-nebula-500/20 to-nebula-600/20"
      />
      <StatCard
        title="Completed"
        value={stats.completed}
        description="Tasks finished"
        icon={<CheckCircle size={24} className="text-emerald-500" />}
        colorClass="from-emerald-500/20 to-emerald-600/20"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgress}
        description="Tasks ongoing"
        icon={<Clock size={24} className="text-amber-500" />}
        colorClass="from-amber-500/20 to-amber-600/20"
      />
    </div>
  );
};

export default DashboardStats;
