import React, { useState } from 'react';
import { Calendar, Clock, Edit, MoreHorizontal, Trash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { Badge } from '../ui/badge';

interface TaskItemProps {
  task: Task;
  isAdmin: boolean;
  assigneeName: string;
  onStatusChange: (taskId: string, status: 'complete' | 'incomplete') => void;
}

const TaskItem = ({ task, isAdmin, assigneeName, onStatusChange }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const { toast } = useToast();
  
  // Safely format deadline, handle invalid dates
  const formattedDeadline = React.useMemo(() => {
    try {
      if (!task.deadline) return 'No deadline';
      const date = new Date(task.deadline);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting deadline:', error);
      return 'Invalid date';
    }
  }, [task.deadline]);
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    // Validate form
    if (!editedTask.title || !editedTask.description) {
      toast.error("Title and description are required");
      return;
    }
    
    // Update the task in localStorage
    const tasksJson = localStorage.getItem('nebulaTasks');
    if (tasksJson) {
      try {
        const tasks = JSON.parse(tasksJson);
        const updatedTasks = tasks.map((t: Task) => {
          if (t.id === task.id) {
            return editedTask;
          }
          return t;
        });
        
        localStorage.setItem('nebulaTasks', JSON.stringify(updatedTasks));
        
        toast.success("Task updated successfully");
        
        // Reload the page to reflect changes
        window.location.reload();
      } catch (e) {
        console.error("Error updating task:", e);
        toast.error("Error updating task");
      }
    }
    
    setIsEditing(false);
  };

  const deleteTask = () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    // Remove the task from localStorage
    const tasksJson = localStorage.getItem('nebulaTasks');
    if (tasksJson) {
      try {
        const tasks = JSON.parse(tasksJson);
        const updatedTasks = tasks.filter((t: Task) => t.id !== task.id);
        
        localStorage.setItem('nebulaTasks', JSON.stringify(updatedTasks));
        
        toast.success("Task deleted successfully");
        
        // Reload the page to reflect changes
        window.location.reload();
      } catch (e) {
        console.error("Error deleting task:", e);
        toast.error("Error deleting task");
      }
    }
  };
  
  return (
    <div 
      className={`nebula-card overflow-hidden transition-all duration-200 ${isExpanded ? 'task-item-expanded' : 'task-item-collapsed'}`}
    >
      {isEditing ? (
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="task-title" className="nebula-label">Title</label>
              <input
                id="task-title"
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleEditChange}
                className="nebula-input w-full"
                placeholder="Enter task title"
                required
                aria-required="true"
              />
            </div>
            
            <div>
              <label htmlFor="task-description" className="nebula-label">Description</label>
              <input
                id="task-description"
                type="text"
                name="description"
                value={editedTask.description}
                onChange={handleEditChange}
                className="nebula-input w-full"
                placeholder="Enter a brief description"
                required
                aria-required="true"
              />
            </div>
            
            <div>
              <label htmlFor="task-longDescription" className="nebula-label">Detailed Description</label>
              <textarea
                id="task-longDescription"
                name="longDescription"
                value={editedTask.longDescription}
                onChange={handleEditChange}
                className="nebula-input w-full min-h-[100px]"
                placeholder="Add more detailed information"
              />
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="nebula-button bg-secondary hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="nebula-button"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="p-5">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <div className={`ml-1 nebula-badge ${task.status === 'complete' ? 'badge-complete' : 'badge-incomplete'}`}>
                  {task.status === 'complete' ? 'Completed' : 'Incomplete'}
                </div>
                {task.reviewStatus === 'reverted' && (
                  <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                    <AlertCircle size={12} className="mr-1" />
                    Reverted
                  </Badge>
                )}
                {task.reviewStatus === 'approved' && (
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                    <CheckCircle2 size={12} className="mr-1" />
                    Approved
                  </Badge>
                )}
                {task.status === 'complete' && task.reviewStatus === 'pending_review' && (
                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                    <Clock size={12} className="mr-1" />
                    Pending Review
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button 
                      className="p-1 rounded-full hover:bg-secondary/70"
                      onClick={() => setIsEditing(true)}
                      title="Edit task"
                    >
                      <Edit size={16} className="text-muted-foreground" />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-secondary/70"
                      onClick={deleteTask}
                      title="Delete task"
                    >
                      <Trash size={16} className="text-muted-foreground" />
                    </button>
                  </>
                )}
                <button className="p-1 rounded-full hover:bg-secondary/70" title="More options">
                  <MoreHorizontal size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">{task.description}</p>
            
            <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Due: {formattedDeadline}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="ml-auto">
                <span>Assigned to: {assigneeName}</span>
              </div>
            </div>
            
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <h4 className="font-medium mb-2">Detailed Description:</h4>
                <p className="text-muted-foreground">{task.longDescription || 'No detailed description provided.'}</p>
                
                {task.reviewStatus === 'reverted' && task.reviewComment && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h5 className="font-medium text-red-500 mb-1 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Manager Feedback
                    </h5>
                    <p className="text-sm text-muted-foreground">{task.reviewComment}</p>
                  </div>
                )}
                
                {!isAdmin && (
                  <div className="mt-4">
                    <label className="nebula-label">Update Status:</label>
                    <select 
                      className="nebula-input w-full max-w-xs"
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as 'complete' | 'incomplete')}
                      aria-label="Task status"
                    >
                      <option value="incomplete">Incomplete</option>
                      <option value="complete">Complete</option>
                    </select>
                    {task.status === 'incomplete' && task.reviewStatus === 'reverted' && (
                      <p className="text-xs text-amber-500 mt-2">Task was reverted by manager. Please review feedback and resubmit.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 text-sm text-center text-muted-foreground hover:bg-secondary/50 transition-colors border-t border-border/30"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </>
      )}
    </div>
  );
};

export default TaskItem;