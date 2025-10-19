
import React, { useState, useEffect } from 'react';
import { CalendarIcon, Clock, Search } from 'lucide-react';
import TaskItem from './TaskItem';
import { Task, User } from '../../types';
import { useToast } from '../../hooks/use-toast';

interface TaskListProps {
  isAdmin: boolean;
  currentUserId: string;
}

const TaskList = ({ isAdmin, currentUserId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('nebulaTasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks) as Task[];
        // If not admin, only show tasks assigned to the current user
        const filteredTasks = isAdmin ? parsedTasks : parsedTasks.filter(task => task.assignedTo === currentUserId);
        setTasks(filteredTasks);
      } catch (e) {
        console.error("Error parsing tasks:", e);
        setTasks([]);
      }
    }
    
    // Load users for admin view
    const storedUsers = localStorage.getItem('nebulaUsers');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error("Error parsing users:", e);
        setUsers([]);
      }
    }
  }, [isAdmin, currentUserId]);

  const handleStatusChange = (taskId: string, newStatus: 'complete' | 'incomplete') => {
    // Update task status in state
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: newStatus };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Update localStorage
    const allTasks = localStorage.getItem('nebulaTasks');
    if (allTasks) {
      try {
        const parsedTasks = JSON.parse(allTasks) as Task[];
        const updatedAllTasks = parsedTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, status: newStatus };
          }
          return task;
        });
        localStorage.setItem('nebulaTasks', JSON.stringify(updatedAllTasks));
      } catch (e) {
        console.error("Error updating task status:", e);
      }
    }
    
    toast({
      title: "Task updated",
      description: `Task status changed to ${newStatus}`,
    });
  };

  const getFilteredTasks = () => {
    return tasks
      .filter(task => {
        if (filter === 'incomplete') return task.status === 'incomplete';
        if (filter === 'complete') return task.status === 'complete';
        return true;
      })
      .filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            className="nebula-input pl-10 w-full"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-nebula-600 text-white' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'incomplete' 
                ? 'bg-nebula-600 text-white' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            Incomplete
          </button>
          <button
            onClick={() => setFilter('complete')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'complete' 
                ? 'bg-nebula-600 text-white' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="nebula-card p-8 text-center">
          <p className="text-muted-foreground">
            {isAdmin ? 'No tasks created yet. Create a task to get started.' : 'No tasks assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isAdmin={isAdmin}
              assigneeName={getUserName(task.assignedTo)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
