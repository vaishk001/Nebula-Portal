
import React, { useState } from 'react';
import { Calendar, Clock, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../../types';
import { useToast } from '../../hooks/use-toast';

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
  
  const formattedDeadline = format(new Date(task.deadline), 'MMM dd, yyyy');
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    // Validate form
    if (!editedTask.title || !editedTask.description) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive"
      });
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
        
        toast({
          title: "Task Updated",
          description: "The task has been updated successfully"
        });
        
        // Reload the page to reflect changes
        window.location.reload();
      } catch (e) {
        console.error("Error updating task:", e);
        toast({
          title: "Update Failed",
          description: "There was an error updating the task",
          variant: "destructive"
        });
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
        
        toast({
          title: "Task Deleted",
          description: "The task has been deleted successfully"
        });
        
        // Reload the page to reflect changes
        window.location.reload();
      } catch (e) {
        console.error("Error deleting task:", e);
        toast({
          title: "Delete Failed",
          description: "There was an error deleting the task",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div 
      className="nebula-card overflow-hidden transition-all duration-200"
      style={{ maxHeight: isExpanded ? '1000px' : '180px' }}
    >
      {isEditing ? (
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
          
          <div className="space-y-4">
            <div>
              <label className="nebula-label">Title</label>
              <input
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleEditChange}
                className="nebula-input w-full"
              />
            </div>
            
            <div>
              <label className="nebula-label">Description</label>
              <input
                type="text"
                name="description"
                value={editedTask.description}
                onChange={handleEditChange}
                className="nebula-input w-full"
              />
            </div>
            
            <div>
              <label className="nebula-label">Detailed Description</label>
              <textarea
                name="longDescription"
                value={editedTask.longDescription}
                onChange={handleEditChange}
                className="nebula-input w-full min-h-[100px]"
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
              <div className="flex items-center">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <div className={`ml-3 nebula-badge ${task.status === 'complete' ? 'badge-complete' : 'badge-incomplete'}`}>
                  {task.status === 'complete' ? 'Completed' : 'Incomplete'}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button 
                      className="p-1 rounded-full hover:bg-secondary/70"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={16} className="text-muted-foreground" />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-secondary/70"
                      onClick={deleteTask}
                    >
                      <Trash size={16} className="text-muted-foreground" />
                    </button>
                  </>
                )}
                <button className="p-1 rounded-full hover:bg-secondary/70">
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
                
                {!isAdmin && (
                  <div className="mt-4">
                    <label className="nebula-label">Update Status:</label>
                    <select 
                      className="nebula-input w-full max-w-xs"
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as 'complete' | 'incomplete')}
                    >
                      <option value="incomplete">Incomplete</option>
                      <option value="complete">Complete</option>
                    </select>
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
