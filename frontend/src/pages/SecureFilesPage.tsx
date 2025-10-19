
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import FileUpload from '../components/auth/FileUpload';
import EncryptionInfo from '../components/auth/EncryptionInfo';
import { FileIcon, LockIcon, Eye, Download, Shield, KeyRound } from 'lucide-react';
import { User, File } from '../types';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { connectToDatabase } from '../utils/mongodb';
import { Button } from '../components/ui/button';
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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
      // Get all files from localStorage as a fallback
      const storedFiles = localStorage.getItem('nebulaFiles');
      let allStoredFiles: FileInfo[] = storedFiles ? JSON.parse(storedFiles) : [];
      
      // Try to connect to the database
      try {
        const { db } = await connectToDatabase();
        const filesCollection = db.collection('files');
        
        // If admin, get all files
        if (user.role === 'admin') {
          const files = await filesCollection.find().toArray();
          // If files exist in the database, use them; otherwise use localStorage
          if (files && files.length > 0) {
            setAllFiles(files as unknown as FileInfo[]);
          } else {
            setAllFiles(allStoredFiles);
          }
        } else {
          setAllFiles(allStoredFiles);
        }
        
        // Get files for the current user
        const userOwnedFiles = await filesCollection.find({ uploadedBy: user.id }).toArray();
        if (userOwnedFiles && userOwnedFiles.length > 0) {
          setUserFiles(userOwnedFiles as unknown as FileInfo[]);
        } else {
          // Fallback to localStorage for user's files
          const userLocalFiles = allStoredFiles.filter(file => file.uploadedBy === user.id);
          setUserFiles(userLocalFiles);
        }
      } catch (dbError) {
        console.error("Failed to load from MongoDB, falling back to localStorage", dbError);
        
        // Fallback to localStorage
        if (user.role === 'admin') {
          setAllFiles(allStoredFiles);
        }
        
        // Get files for the current user from localStorage
        const userOwnedFiles = allStoredFiles.filter(file => file.uploadedBy === user.id);
        setUserFiles(userOwnedFiles);
      }
    } catch (error) {
      toast.error("Error loading files");
      console.error("Error loading files:", error);
    }
  };

  const handleFileUploaded = async (fileInfo: FileInfo) => {
    if (!userData) return;
    
    // Add user information to file
    const fileWithUserInfo: FileInfo = {
      ...fileInfo,
      uploadedBy: userData.id,
      uploadedAt: new Date().toISOString(),
    };
    
    try {
      // Always update localStorage first to ensure persistence
      const storedFiles = localStorage.getItem('nebulaFiles');
      let files = storedFiles ? JSON.parse(storedFiles) as FileInfo[] : [];
      files = [...files, fileWithUserInfo];
      localStorage.setItem('nebulaFiles', JSON.stringify(files));
      
      // Try to save to MongoDB
      try {
        const { db } = await connectToDatabase();
        const filesCollection = db.collection('files');
        
        // Convert to a plain object and remove any _id field for a new document
        const fileDocument = { ...fileWithUserInfo };
        if (fileDocument._id === undefined) {
          delete fileDocument._id;
        }
        
        await filesCollection.insertOne(fileDocument);
        toast.success("File saved to database");
      } catch (dbError) {
        console.error("Failed to save to MongoDB, using localStorage only", dbError);
        toast.warning("File saved locally (database connection failed)");
      }
      
      // Update state
      setUserFiles([...userFiles, fileWithUserInfo]);
      if (userData.role === 'admin') {
        setAllFiles([...allFiles, fileWithUserInfo]);
      }
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
          {/* File Upload Section - Only for non-admin users */}
          {!isAdmin && (
            <div className="lg:col-span-1">
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
          )}
          
          {/* File List Section */}
          <div className={isAdmin ? "lg:col-span-3" : "lg:col-span-2"}>
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
                  userFiles.map((file, index) => (
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
            
            {/* Admin Only Section */}
            {isAdmin && (
              <div className="nebula-card">
                <div className="p-6 border-b border-border/30 flex items-center gap-2">
                  <Shield size={18} className="text-amber-400" />
                  <h2 className="text-xl font-bold">All User Files (Admin View)</h2>
                </div>
                
                <div className="divide-y divide-border/30">
                  {allFiles.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No files have been uploaded by any users
                    </div>
                  ) : (
                    allFiles.map((file, index) => {
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
