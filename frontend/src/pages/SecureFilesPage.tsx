
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import FileUpload from '../components/auth/FileUpload';
import EncryptionInfo from '../components/auth/EncryptionInfo';
import { FileIcon, LockIcon, Eye, Download, Shield, KeyRound, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { User, File } from '../types';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Button } from '../components/ui/button';
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getFiles, createFile } from '../utils/api';

// Use our File type as the FileInfo interface
type FileInfo = File;

const SecureFilesPage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userFiles, setUserFiles] = useState<FileInfo[]>([]);
  const [allFiles, setAllFiles] = useState<FileInfo[]>([]);
  const [viewingFile, setViewingFile] = useState<FileInfo | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [filePassword, setFilePassword] = useState('');
  const [currentFileForPassword, setCurrentFileForPassword] = useState<FileInfo | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = localStorage.getItem('nebulaUser');
      if (!storedUser) {
        navigate('/');
        return;
      }
      
      try {
        const user = JSON.parse(storedUser) as User;
        setUserData(user);
        
        // Load files
        await loadFiles(user);
      } catch (e) {
        localStorage.removeItem('nebulaUser');
        navigate('/');
      }
    };

    loadUserData();
  }, [navigate]);

  const loadFiles = async (user: User) => {
    try {
      // Get all files from API
      const allFilesFromDB = await getFiles();
      
      // Get files uploaded by current user
      const userOwnedFiles = allFilesFromDB.filter(file => file.uploadedBy === user.id);
      setUserFiles(userOwnedFiles);
      
      // Set files visible to this user based on role
      if (user.role === 'admin') {
        // Admin sees all files from managers and users
        setAllFiles(allFilesFromDB);
      } else if (user.role === 'manager') {
        // Manager sees files from regular users (not from other managers/admins)
        const userFiles = allFilesFromDB.filter(file => {
          // Find the user who uploaded this file
          const storedUsers = localStorage.getItem('nebulaUsers');
          const users = storedUsers ? JSON.parse(storedUsers) as User[] : [];
          const fileOwner = users.find(u => u.id === file.uploadedBy);
          return fileOwner && fileOwner.role === 'user';
        });
        setAllFiles(userFiles);
      } else {
        // Regular users don't see other users' files
        setAllFiles([]);
      }
    } catch (error) {
      toast.error("Error loading files");
      console.error("Error loading files:", error);
    }
  };

  const handleFileUploaded = async (fileInfo: FileInfo) => {
    if (!userData) return;
    
    // Add user information to file and set pending review status
    const fileWithUserInfo: FileInfo = {
      ...fileInfo,
      uploadedBy: userData.id,
      uploadedAt: new Date().toISOString(),
      reviewStatus: 'pending_review', // Set for manager/admin review
    };
    
    try {
      // Save to MongoDB via API
      const savedFile = await createFile(fileWithUserInfo);
      
      // Show appropriate success message based on role
      if (userData.role === 'user') {
        toast.success("File uploaded and sent for manager review");
      } else if (userData.role === 'manager') {
        toast.success("File uploaded and sent for admin review");
      } else {
        toast.success("File uploaded successfully");
      }
      
      // Reload files to get fresh data
      await loadFiles(userData);
    } catch (error) {
      toast.error("Error saving file");
      console.error("Error saving file:", error);
    }
  };

  const handleViewFile = (file: FileInfo) => {
    // Check if file is password protected
    if (file.encryptionDetails?.passwordProtected) {
      setCurrentFileForPassword(file);
      setFilePassword('');
      setPasswordError('');
      setIsPasswordDialogOpen(true);
    } else {
      // If not password protected, show directly
      setViewingFile(file);
      setIsViewDialogOpen(true);
    }
  };

  const handleDownloadFile = (file: FileInfo) => {
    // Check if file is password protected
    if (file.encryptionDetails?.passwordProtected) {
      setCurrentFileForPassword(file);
      setFilePassword('');
      setPasswordError('');
      setIsPasswordDialogOpen(true);
    } else {
      // If not password protected, download directly
      downloadFile(file);
    }
  };

  const downloadFile = (file: FileInfo) => {
    try {
      // Create anchor element to trigger download
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Error downloading file. Please try again.");
      console.error("Download error:", error);
    }
  };

  // Simple hash function to verify password
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerifyPassword = async () => {
    if (!currentFileForPassword || !filePassword) return;
    
    try {
      // Hash the provided password for comparison
      const hashedPassword = await hashPassword(filePassword);
      
      // Compare with stored hash
      if (currentFileForPassword.encryptionDetails?.passwordHash === hashedPassword) {
        // Password matches
        setIsPasswordDialogOpen(false);
        
        // Determine if this was for viewing or downloading
        if (isViewDialogOpen) {
          setViewingFile(currentFileForPassword);
        } else {
          downloadFile(currentFileForPassword);
        }
        
        // Reset
        setPasswordError('');
        setFilePassword('');
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (error) {
      setPasswordError('Error verifying password. Please try again.');
      console.error("Password verification error:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!userData) return null;
  
  const isAdmin = userData.role === 'admin';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Encrypted Files</h1>
            <p className="text-muted-foreground mt-1">
              Secure file storage with end-to-end encryption
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section - For users and managers */}
          {userData.role !== 'admin' && (
            <div className="lg:col-span-1">
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
          )}
          
          {/* File List Section */}
          <div className={userData.role === 'admin' ? "lg:col-span-3" : "lg:col-span-2"}>  
            <div className="nebula-card mb-6">
              <div className="p-6 border-b border-border/30">
                <h2 className="text-xl font-bold">Your Encrypted Files</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Files you've uploaded securely to Nebula
                </p>
              </div>
              
              <div className="divide-y divide-border/30">
                {userFiles.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No files uploaded yet
                  </div>
                ) : (
                  (Array.isArray(userFiles) ? userFiles : []).map((file, index) => (
                    <div key={index} className="p-4 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-nebula-800/50 p-3 rounded-lg">
                          <FileIcon size={20} className="text-nebula-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-nebula-100 mb-1 flex items-center gap-2">
                            {file.name}
                            {file.encryptionDetails?.passwordProtected && (
                              <KeyRound size={14} className="text-amber-400" />
                            )}
                            {file.reviewStatus === 'reverted' && (
                              <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-xs">
                                <AlertCircle size={10} className="mr-1" />
                                Reverted
                              </Badge>
                            )}
                            {file.reviewStatus === 'approved' && (
                              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-xs">
                                <CheckCircle2 size={10} className="mr-1" />
                                Approved
                              </Badge>
                            )}
                            {file.reviewStatus === 'pending_review' && (
                              <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-xs">
                                <Clock size={10} className="mr-1" />
                                Pending Review
                              </Badge>
                            )}
                          </h3>
                          {file.description && (
                            <p className="text-sm text-nebula-400 mb-2 italic">"{file.description}"</p>
                          )}
                          {file.reviewStatus === 'reverted' && file.reviewComment && (
                            <p className="text-sm text-red-400 mb-2 italic">Manager: {file.reviewComment}</p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-nebula-400">
                            <div className="flex items-center gap-1">
                              <LockIcon size={12} />
                              <span>Encrypted</span>
                            </div>
                            <div>Size: {formatFileSize(file.size)}</div>
                            {file.uploadedAt && (
                              <div>Uploaded: {formatDate(file.uploadedAt)}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleViewFile(file)}
                            className="nebula-button bg-nebula-500/20 text-nebula-400 hover:bg-nebula-500/30"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownloadFile(file)}
                            className="nebula-button bg-nebula-500/20 text-nebula-400 hover:bg-nebula-500/30"
                          >
                            <Download size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Manager/Admin Section - Files from others */}
            {(userData.role === 'manager' || userData.role === 'admin') && allFiles.length > 0 && (
              <div className="nebula-card">
                <div className="p-6 border-b border-border/30 flex items-center gap-2">
                  <Shield size={18} className="text-amber-400" />
                  <h2 className="text-xl font-bold">
                    {userData.role === 'admin' ? 'All User Files (Admin View)' : 'User Files for Review (Manager View)'}
                  </h2>
                </div>
                
                <div className="divide-y divide-border/30">
                  {allFiles.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No files have been uploaded by any users
                    </div>
                  ) : (
                    (Array.isArray(allFiles) ? allFiles : []).map((file, index) => {
                      // Find user info for the file
                      const users = JSON.parse(localStorage.getItem('nebulaUsers') || '[]') as User[];
                      const fileUser = users.find(user => user.id === file.uploadedBy);
                      
                      return (
                        <div key={index} className="p-4 hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="bg-amber-800/30 p-3 rounded-lg">
                              <FileIcon size={20} className="text-amber-300" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-nebula-100 mb-1 flex items-center gap-2">
                                {file.name}
                                {file.encryptionDetails?.passwordProtected && (
                                  <KeyRound size={14} className="text-amber-400" />
                                )}
                              </h3>
                              {file.description && (
                                <p className="text-sm text-nebula-400 mb-2 italic">"{file.description}"</p>
                              )}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-nebula-400">
                                <div className="flex items-center gap-1">
                                  <LockIcon size={12} />
                                  <span>Encrypted</span>
                                </div>
                                <div>Size: {formatFileSize(file.size)}</div>
                                {fileUser && (
                                  <div className="flex items-center gap-1">
                                    <Eye size={12} />
                                    <span>Uploaded by: {fileUser.name}</span>
                                  </div>
                                )}
                                {file.uploadedAt && (
                                  <div>Uploaded: {formatDate(file.uploadedAt)}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleViewFile(file)}
                                className="nebula-button bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleDownloadFile(file)}
                                className="nebula-button bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                              >
                                <Download size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* View File Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>View File</DialogTitle>
            </DialogHeader>
            
            {viewingFile && (
              <div className="space-y-4">
                <div className="bg-nebula-900/50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-nebula-800/50 p-2 rounded-lg">
                      <FileIcon size={18} className="text-nebula-300" />
                    </div>
                    <h3 className="font-medium text-nebula-100">{viewingFile.name}</h3>
                  </div>
                  
                  {viewingFile.description && (
                    <div className="mb-3 p-3 border border-nebula-700/30 bg-nebula-800/20 rounded-md">
                      <p className="text-sm text-nebula-300">{viewingFile.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-nebula-400">
                    <div>
                      <span className="block text-nebula-500">File Type</span>
                      <span>{viewingFile.type || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="block text-nebula-500">File Size</span>
                      <span>{formatFileSize(viewingFile.size)}</span>
                    </div>
                    {viewingFile.uploadedAt && (
                      <div className="col-span-2">
                        <span className="block text-nebula-500">Upload Date</span>
                        <span>{formatDate(viewingFile.uploadedAt)}</span>
                      </div>
                    )}
                    {viewingFile.encryptionDetails?.passwordProtected && (
                      <div className="col-span-2 mt-2 flex items-center gap-2 text-amber-400">
                        <KeyRound size={14} />
                        <span>Password protected</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleDownloadFile(viewingFile)}
                    className="nebula-button bg-nebula-600 text-white hover:bg-nebula-500 flex items-center gap-2"
                  >
                    <Download size={16} />
                    <span>Download File</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Enter File Password</DialogTitle>
            </DialogHeader>
            
            {currentFileForPassword && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-800/30 p-2 rounded-lg">
                    <KeyRound size={18} className="text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm">This file is password protected</p>
                    <p className="text-xs text-nebula-400">Enter the password to {isViewDialogOpen ? 'view' : 'download'} "{currentFileForPassword.name}"</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file-password" className="text-sm">Password</Label>
                  <Input 
                    id="file-password"
                    type="password"
                    placeholder="Enter file password"
                    value={filePassword}
                    onChange={(e) => setFilePassword(e.target.value)}
                    className="bg-nebula-950/50 border-nebula-700/40"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                  />
                  {passwordError && (
                    <p className="text-xs text-red-500">{passwordError}</p>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPasswordDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleVerifyPassword}
                    className="bg-nebula-600 text-white hover:bg-nebula-500"
                  >
                    Unlock File
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Encryption Information Section */}
        <div className="mt-8">
          <EncryptionInfo />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecureFilesPage;
