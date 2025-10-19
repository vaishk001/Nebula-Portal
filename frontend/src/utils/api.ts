
import axios from 'axios';
import { User, Task, File } from '../types';
import { toast } from 'sonner';

const API_URL = '/api';

// Create axios instance for API requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for file operations
  timeout: 30000,
});

// API error handler
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
  toast.error(message);
  return Promise.reject(error);
};

// Users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createUser = async (user: User): Promise<User> => {
  try {
    const response = await api.post('/users', user);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Tasks
export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTaskById = async (id: string): Promise<Task> => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createTask = async (task: Task): Promise<Task> => {
  try {
    const response = await api.post('/tasks', task);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<void> => {
  try {
    await api.put(`/tasks/${id}`, task);
  } catch (error) {
    return handleApiError(error);
  }
};

// Files
export const getFiles = async (): Promise<File[]> => {
  try {
    const response = await api.get('/files');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getFileById = async (id: string): Promise<File> => {
  try {
    const response = await api.get(`/files/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createFile = async (file: File): Promise<File> => {
  try {
    const response = await api.post('/files', file);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteFile = async (id: string): Promise<void> => {
  try {
    await api.delete(`/files/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
};

// Direct file download helper - creates a download link in the browser
export const downloadFileHelper = (file: File): void => {
  try {
    // For blob URLs or data URLs, create a temporary anchor
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success(`Downloading ${file.name}`);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Error downloading file. Please try again.');
  }
};
