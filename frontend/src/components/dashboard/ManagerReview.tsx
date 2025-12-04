import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, FileText, ListTodo, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Task, File } from '../../types';
import { getTasks, getFiles, getUsers, updateTask, reviewFile } from '../../utils/api';

type ManagerReviewProps = {
  managerId: string;
  managerName: string;
};

const ManagerReview: React.FC<ManagerReviewProps> = ({ managerId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [reviewComment, setReviewComment] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all tasks and files from API
      const [allTasks, allFiles, allUsers] = await Promise.all([
        getTasks(),
        getFiles(),
        getUsers()
      ]);
      
      // Filter completed tasks that need review
      const completedTasks = allTasks.filter(task => 
        task.status === 'complete' && 
        (!task.reviewStatus || task.reviewStatus === 'pending_review')
      );
      setTasks(completedTasks);

      // Filter files uploaded by regular users (not managers/admins) that need review
      const pendingFiles = allFiles.filter(file => {
        const fileOwner = allUsers.find(u => u.id === file.uploadedBy);
        return fileOwner && fileOwner.role === 'user' && 
               (!file.reviewStatus || file.reviewStatus === 'pending_review');
      });
      setFiles(pendingFiles);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load review data');
    }
  };

  const handleTaskReview = async (taskId: string, status: 'approved' | 'reverted') => {
    const comment = reviewComment[taskId] || '';
    
    if (status === 'reverted' && !comment.trim()) {
      toast.error('Please provide a comment when reverting a task');
      return;
    }

    try {
      await updateTask(taskId, {
        reviewStatus: status,
        reviewedBy: managerId,
        reviewComment: comment,
        status: status === 'reverted' ? 'incomplete' : 'complete'
      });
      
      setReviewComment(prev => ({ ...prev, [taskId]: '' }));
      await loadData();
      
      toast.success(`Task ${status === 'approved' ? 'approved' : 'reverted'} successfully`);
    } catch (error) {
      console.error('Error reviewing task:', error);
      toast.error('Failed to review task');
    }
  };

  const handleFileReview = async (fileId: string, status: 'approved' | 'reverted') => {
    const comment = reviewComment[fileId] || '';
    
    if (status === 'reverted' && !comment.trim()) {
      toast.error('Please provide a comment when reverting a file');
      return;
    }

    try {
      await reviewFile(fileId, status, managerId, comment);
      
      setReviewComment(prev => ({ ...prev, [fileId]: '' }));
      await loadData();
      
      toast.success(`File ${status === 'approved' ? 'approved' : 'reverted'} successfully`);
    } catch (error) {
      console.error('Error reviewing file:', error);
      toast.error('Failed to review file');
    }
  };

  const getStatusBadge = (reviewStatus?: string) => {
    switch (reviewStatus) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Approved</Badge>;
      case 'reverted':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Reverted</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending Review</Badge>;
    }
  };

  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CheckCircle className="text-nebula-500" />
          Manager Review Panel
        </CardTitle>
        <CardDescription>Review and approve or revert employee tasks and files</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo size={16} />
              Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText size={16} />
              Files ({files.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tasks pending review</p>
              </div>
            ) : (
              (Array.isArray(tasks) ? tasks : []).map(task => (
                <Card key={task.id} className="border-border/30 bg-secondary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="mt-1">{task.description}</CardDescription>
                      </div>
                      {getStatusBadge(task.reviewStatus)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Details:</strong> {task.longDescription}</p>
                      <p className="mt-1"><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                      <p className="mt-1"><strong>Completed At:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare size={14} />
                        Review Comment {task.reviewStatus !== 'approved' && <span className="text-red-500">(Required for revert)</span>}
                      </label>
                      <Textarea
                        value={reviewComment[task.id] || ''}
                        onChange={(e) => setReviewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                        placeholder="Add your review comments here..."
                        className="nebula-input min-h-[80px]"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleTaskReview(task.id, 'approved')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleTaskReview(task.id, 'reverted')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle size={16} className="mr-2" />
                        Revert to Employee
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            {files.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No files pending review</p>
              </div>
            ) : (
              (Array.isArray(files) ? files : []).map(file => (
                <Card key={file._id} className="border-border/30 bg-secondary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{file.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {file.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(file.reviewStatus)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Type:</strong> {file.type}</p>
                      <p className="mt-1"><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                      <p className="mt-1"><strong>Uploaded:</strong> {new Date(file.uploadedAt).toLocaleString()}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare size={14} />
                        Review Comment {file.reviewStatus !== 'approved' && <span className="text-red-500">(Required for revert)</span>}
                      </label>
                      <Textarea
                        value={reviewComment[file._id || ''] || ''}
                        onChange={(e) => setReviewComment(prev => ({ ...prev, [file._id || '']: e.target.value }))}
                        placeholder="Add your review comments here..."
                        className="nebula-input min-h-[80px]"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleFileReview(file._id || '', 'approved')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleFileReview(file._id || '', 'reverted')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle size={16} className="mr-2" />
                        Revert to Employee
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ManagerReview;
