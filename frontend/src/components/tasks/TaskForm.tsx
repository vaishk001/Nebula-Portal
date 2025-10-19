
import React, { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../../hooks/use-toast';
import { User } from '../../types';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    assignedTo: '',
    assignToAll: false,
    deadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Default 7 days from now
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('nebulaUsers');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        // Filter to only show regular users, not admins
        const regularUsers = parsedUsers.filter((user: User) => user.role === 'user');
        setUsers(regularUsers);
      } catch (e) {
        console.error("Error parsing users:", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || (!formData.assignedTo && !formData.assignToAll) || !formData.deadline) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate unique ID for task
    const taskId = `task_${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Handle task creation
    const newTasks = [];
    
    // Get existing tasks
    const existingTasksJson = localStorage.getItem('nebulaTasks');
    const existingTasks = existingTasksJson ? JSON.parse(existingTasksJson) : [];
    
    if (formData.assignToAll) {
      // Create a task for each user
      for (const user of users) {
        newTasks.push({
          id: `${taskId}_${user.id}`,
          title: formData.title,
          description: formData.description,
          longDescription: formData.longDescription,
          assignedTo: user.id,
          status: 'incomplete',
          deadline: new Date(formData.deadline).toISOString(),
          createdAt
        });
      }
    } else {
      // Create a task for the selected user only
      newTasks.push({
        id: taskId,
        title: formData.title,
        description: formData.description,
        longDescription: formData.longDescription,
        assignedTo: formData.assignedTo,
        status: 'incomplete',
        deadline: new Date(formData.deadline).toISOString(),
        createdAt
      });
    }
    
    // Save to localStorage
    localStorage.setItem('nebulaTasks', JSON.stringify([...existingTasks, ...newTasks]));
    
    toast({
      title: "Task Created",
      description: formData.assignToAll 
        ? `Task assigned to all users (${users.length})` 
        : "The task has been created successfully"
    });
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      assignedTo: '',
      assignToAll: false,
      deadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="nebula-card p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Create New Task</h2>
      
      <div>
        <label htmlFor="title" className="nebula-label">Task Title <span className="text-destructive">*</span></label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="nebula-input w-full"
          placeholder="Enter task title"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="nebula-label">Short Description <span className="text-destructive">*</span></label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="nebula-input w-full"
          placeholder="Brief description"
        />
      </div>
      
      <div>
        <label htmlFor="longDescription" className="nebula-label">Detailed Description</label>
        <textarea
          id="longDescription"
          name="longDescription"
          value={formData.longDescription}
          onChange={handleChange}
          className="nebula-input w-full min-h-[100px]"
          placeholder="Enter a detailed description"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="assignToAll"
              name="assignToAll"
              checked={formData.assignToAll}
              onChange={handleCheckboxChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="assignToAll" className="nebula-label mb-0">Assign to all users</label>
          </div>
          
          {!formData.assignToAll && (
            <>
              <label htmlFor="assignedTo" className="nebula-label">Assign To <span className="text-destructive">*</span></label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="nebula-input w-full"
                disabled={formData.assignToAll}
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        
        <div>
          <label htmlFor="deadline" className="nebula-label">Deadline <span className="text-destructive">*</span></label>
          <div className="relative">
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="nebula-input w-full"
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button type="submit" className="nebula-button">
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
