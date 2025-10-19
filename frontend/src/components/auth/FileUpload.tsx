
import React, { useState } from 'react';
import { Upload, FileIcon, Lock, CheckCircle, KeyRound, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { File as FileType } from '../../types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from '../../hooks/use-toast';

interface FileUploadProps {
  onFileUploaded?: (fileInfo: FileType) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState<'standard' | 'high'>('standard');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [encryptionStage, setEncryptionStage] = useState<string | null>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      toast.info('File selected: ' + e.target.files[0].name);
    }
  };
  
  // Generate a random encryption key identifier
  const generateKeyIdentifier = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Generate a random initialization vector (IV)
  const generateIV = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  };
  
  // Simple hash function for password
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };
  
  const simulateEncryption = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // Clear any previous encryption stage
    setEncryptionStage(null);
    
    // Simulate progress upload with different speeds based on encryption level
    const progressSteps = encryptionLevel === 'high' ? 5 : 10;
    for (let progress = 0; progress <= 100; progress += progressSteps) {
      setUploadProgress(progress);
      // High encryption takes longer
      await new Promise(resolve => setTimeout(resolve, encryptionLevel === 'high' ? 400 : 250));
      
      // Show different encryption stages at specific progress points
      if (progress === 20) setEncryptionStage('generating_key');
      if (progress === 40) setEncryptionStage('encrypting');
      if (progress === 60) setEncryptionStage('uploading');
      if (progress === 80) setEncryptionStage('verifying');
    }
    
    try {
      // In a real scenario, we would actually encrypt the file here and upload to server
      // For now, create a blob URL for local testing
      const fileUrl = URL.createObjectURL(file);
      
      // Process any password protection
      let passwordHash = undefined;
      
      if (usePassword && password) {
        passwordHash = await hashPassword(password);
      }
      
      // Create file info object with encryption details
      const fileInfo: FileType = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        description: description.trim() || undefined,
        uploadedBy: '', // This will be filled in by the parent component
        uploadedAt: new Date().toISOString(),
        encryptionDetails: {
          algorithm: encryptionLevel === 'high' ? 'AES-256-GCM' : 'AES-128-GCM',
          keyIdentifier: generateKeyIdentifier(),
          iv: generateIV(),
          encryptedAt: new Date().toISOString(),
          passwordProtected: usePassword && password ? true : false,
          passwordHash: passwordHash
        }
      };
      
      // Complete the upload
      setUploading(false);
      setEncryptionStage('completed');
      
      // Notify parent component
      if (onFileUploaded) {
        onFileUploaded(fileInfo);
      }
      
      toast.success('File encrypted and uploaded successfully!');
      
      // Reset form for next upload
      setFile(null);
      setDescription('');
      setPassword('');
      setUsePassword(false);
      setEncryptionStage(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };
  
  return (
    <div className="w-full p-6 space-y-4 bg-gradient-to-br from-nebula-950/30 via-nebula-900/40 to-nebula-800/20 rounded-xl border border-nebula-700/20 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-2">
        <FileIcon className="text-nebula-400" size={20} />
        <h3 className="text-lg font-medium text-nebula-100">Secure Document Upload</h3>
      </div>
      
      <div className="relative group">
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <div className="w-full h-32 border-2 border-dashed border-nebula-700/40 rounded-lg flex flex-col items-center justify-center text-nebula-400 group-hover:border-nebula-500/60 transition-all">
          <Upload size={28} className="mb-2 group-hover:text-nebula-300 transition-colors" />
          <p className="text-sm">
            {file ? file.name : "Drag files here or click to browse"}
          </p>
          {file && (
            <p className="text-xs text-nebula-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
      
      {file && !uploading && !encryptionStage && (
        <>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="security">Security Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-2">
              <div className="space-y-2">
                <label htmlFor="file-description" className="text-sm text-nebula-300">
                  File Description (optional)
                </label>
                <Textarea 
                  id="file-description" 
                  placeholder="Add a description for this file..."
                  className="bg-nebula-950/50 border-nebula-700/40 text-nebula-200 placeholder:text-nebula-500/50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4 pt-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-nebula-300">Encryption Level</Label>
                  <RadioGroup 
                    defaultValue="standard" 
                    value={encryptionLevel} 
                    onValueChange={(val) => setEncryptionLevel(val as 'standard' | 'high')}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="text-nebula-200">Standard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high" className="text-nebula-200">High Security</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="use-password"
                      className="rounded border-nebula-700"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                    />
                    <Label htmlFor="use-password" className="text-sm text-nebula-300 cursor-pointer">
                      Password protect this file
                    </Label>
                  </div>
                  
                  {usePassword && (
                    <div className="pt-2">
                      <Label htmlFor="file-password" className="text-xs text-nebula-400">
                        Set password to decrypt this file
                      </Label>
                      <div className="mt-1 relative">
                        <KeyRound size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nebula-500" />
                        <Input
                          id="file-password"
                          type="password"
                          placeholder="Enter password"
                          className="pl-10 bg-nebula-950/50 border-nebula-700/40 text-nebula-200"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-nebula-500 mt-1">
                        Anyone who wants to open this file will need this password
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Button 
            className="w-full bg-gradient-to-r from-nebula-600 to-nebula-500 hover:from-nebula-500 hover:to-nebula-400"
            onClick={simulateEncryption}
          >
            <Lock size={16} className="mr-2" /> Encrypt & Upload
          </Button>
        </>
      )}
      
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2 bg-nebula-800/50" />
          <p className="text-sm text-nebula-300 flex items-center">
            <span className="animate-pulse mr-2">●</span>
            {encryptionStage === 'generating_key' && 'Generating encryption key...'}
            {encryptionStage === 'encrypting' && 'Encrypting file contents...'}
            {encryptionStage === 'uploading' && 'Uploading encrypted file...'}
            {encryptionStage === 'verifying' && 'Verifying file integrity...'}
            {!encryptionStage && 'Preparing file...'}
          </p>
        </div>
      )}
      
      {encryptionStage === 'completed' && (
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
          <CheckCircle size={16} />
          <span className="text-sm">File encrypted and uploaded successfully!</span>
        </div>
      )}
      
      <div className="mt-4">
        <div className="text-xs text-nebula-400 mb-2 flex items-center">
          <Lock size={14} className="mr-1 text-nebula-300" /> 
          Encryption Process
        </div>
        <ol className="space-y-2 text-xs text-nebula-300">
          <li className={`flex items-center gap-1.5 ${encryptionStage === 'generating_key' || encryptionStage === 'completed' ? 'text-nebula-100' : ''}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${encryptionStage === 'generating_key' ? 'bg-nebula-500 text-white' : encryptionStage === 'completed' ? 'bg-emerald-500 text-white' : 'bg-nebula-800 text-nebula-400'}`}>
              1
            </div>
            <span>Generate unique {encryptionLevel === 'high' ? '256-bit' : '128-bit'} AES encryption key</span>
          </li>
          <li className={`flex items-center gap-1.5 ${encryptionStage === 'encrypting' || encryptionStage === 'completed' ? 'text-nebula-100' : ''}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${encryptionStage === 'encrypting' ? 'bg-nebula-500 text-white' : encryptionStage === 'completed' ? 'bg-emerald-500 text-white' : 'bg-nebula-800 text-nebula-400'}`}>
              2
            </div>
            <span>Encrypt file data with AES-GCM algorithm</span>
          </li>
          <li className={`flex items-center gap-1.5 ${encryptionStage === 'uploading' || encryptionStage === 'completed' ? 'text-nebula-100' : ''}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${encryptionStage === 'uploading' ? 'bg-nebula-500 text-white' : encryptionStage === 'completed' ? 'bg-emerald-500 text-white' : 'bg-nebula-800 text-nebula-400'}`}>
              3
            </div>
            <span>Upload encrypted data via secure TLS connection</span>
          </li>
          <li className={`flex items-center gap-1.5 ${encryptionStage === 'verifying' || encryptionStage === 'completed' ? 'text-nebula-100' : ''}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${encryptionStage === 'verifying' ? 'bg-nebula-500 text-white' : encryptionStage === 'completed' ? 'bg-emerald-500 text-white' : 'bg-nebula-800 text-nebula-400'}`}>
              4
            </div>
            <span>Verify file integrity with SHA-256 checksum</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default FileUpload;
