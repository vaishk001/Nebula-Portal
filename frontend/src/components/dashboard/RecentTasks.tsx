
import React, { useState, useEffect } from 'react';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../../types';

interface RecentTasksProps {
  isAdmin: boolean;
  currentUserId: string;
}

const RecentTasks = ({ isAdmin, currentUserId }: RecentTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('nebulaTasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks) as Task[];
        
        // Filter tasks by user role
        const filteredTasks = isAdmin 
          ? parsedTasks 
          : parsedTasks.filter(task => task.assignedTo === currentUserId);
        
        // Sort by creation date (newest first) and limit to 5
        const sortedTasks = filteredTasks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        
        setTasks(sortedTasks);
      } catch (e) {
        console.error("Error parsing tasks:", e);
      }
    }
  }, [isAdmin, currentUserId]);

  return (
    <div className="nebula-card">
      <div className="p-6 border-b border-border/30">
        <h2 className="text-xl font-bold">Recent Tasks</h2>
      </div>
      {tasks.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          No tasks available
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-secondary/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{task.title}</h3>
                <div className={`nebula-badge ${task.status === 'complete' ? 'badge-complete' : 'badge-incomplete'}`}>
                  {task.status === 'complete' ? 'Completed' : 'Incomplete'}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <div className="flex items-center mr-4">
                  <CalendarIcon size={12} className="mr-1" />
                  <span>Due: {format(new Date(task.deadline), 'MMM dd')}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  <span>Created: {format(new Date(task.createdAt), 'MMM dd')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="p-4 border-t border-border/30">
        <a href="/dashboard/tasks" className="text-sm text-nebula-400 hover:text-nebula-300">
          View all tasks →
        </a>
      </div>
    </div>
  );
};

export default RecentTasks;
