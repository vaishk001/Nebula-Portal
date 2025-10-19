
import React from 'react';
import { Shield, Lock, Key, Server, FileCheck } from 'lucide-react';

const EncryptionInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="text-nebula-400" size={20} />
        <h3 className="text-lg font-medium text-nebula-100">Document Security</h3>
      </div>
      
      <div className="space-y-4 text-sm">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Lock size={18} className="text-nebula-400" />
          </div>
          <div>
            <h4 className="font-medium text-nebula-200 mb-1">End-to-End Encryption</h4>
            <p className="text-nebula-300 text-xs leading-relaxed">
              All documents are encrypted before leaving your browser using AES-256-GCM, 
              one of the strongest encryption algorithms available. This ensures that 
              your data is secure both in transit and at rest.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Key size={18} className="text-nebula-400" />
          </div>
          <div>
            <h4 className="font-medium text-nebula-200 mb-1">Key Management</h4>
            <p className="text-nebula-300 text-xs leading-relaxed">
              Encryption keys are derived from your password using PBKDF2 with 100,000 iterations
              and stored in a secure enclave. The original key never leaves your device, ensuring
              that only you can decrypt your documents.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Server size={18} className="text-nebula-400" />
          </div>
          <div>
            <h4 className="font-medium text-nebula-200 mb-1">Secure Storage</h4>
            <p className="text-nebula-300 text-xs leading-relaxed">
              Encrypted files are stored in a secure, isolated environment with multiple 
              layers of protection. Our zero-knowledge architecture ensures that even our 
              administrators cannot access your unencrypted data.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="mt-0.5">
            <FileCheck size={18} className="text-nebula-400" />
          </div>
          <div>
            <h4 className="font-medium text-nebula-200 mb-1">Data Integrity</h4>
            <p className="text-nebula-300 text-xs leading-relaxed">
              SHA-256 checksums verify that your documents haven't been tampered with
              during upload or storage. This cryptographic verification ensures the 
              authenticity and integrity of all your important files.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-nebula-400 mt-4 pt-4 border-t border-nebula-800/50">
        Your security is our priority. All encryption processes comply with SOC 2 Type II 
        and GDPR requirements, ensuring industry-standard protection for your sensitive documents.
      </div>
    </div>
  );
};

export default EncryptionInfo;
