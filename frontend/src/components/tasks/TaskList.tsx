
import React, { useState, useEffect } from 'react';
import { CalendarIcon, Clock, Search } from 'lucide-react';
import TaskItem from './TaskItem';
import { Task, User } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { getTasks, getUsers, updateTask } from '../../utils/api';

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
    // Load tasks and users from MongoDB
    const loadData = async () => {
      try {
        const [allTasks, allUsers] = await Promise.all([getTasks(), getUsers()]);
        // If not admin, only show tasks assigned to the current user
        const filteredTasks = isAdmin ? allTasks : allTasks.filter(task => task.assignedTo === currentUserId);
        setTasks(filteredTasks);
        setUsers(allUsers);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" });
      }
    };
    loadData();
  }, [isAdmin, currentUserId]);

  const handleStatusChange = async (taskId: string, newStatus: 'complete' | 'incomplete') => {
    try {
      // Update task status via API
      const updateData = {
        status: newStatus,
        reviewStatus: newStatus === 'complete' ? 'pending_review' : undefined,
        reviewedBy: undefined,
        reviewComment: undefined
      };
      
      await updateTask(taskId, updateData);
      
      // Update state
      const updatedTasks = (Array.isArray(tasks) ? tasks : []).map(task => {
        if (task.id === taskId) {
          return { ...task, ...updateData };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      toast({
        title: "Task Updated",
        description: newStatus === 'complete' 
          ? 'Task marked as complete and sent for manager review' 
          : `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
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
          {(Array.isArray(filteredTasks) ? filteredTasks : []).map(task => (
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
