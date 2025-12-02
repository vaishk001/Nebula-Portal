
export type User = {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  password?: string;
  isApproved?: boolean; // For manager approval by admin
};

export type Task = {
  _id?: string;
  id: string;
  title: string;
  description: string;
  longDescription: string;
  assignedTo: string;
  status: 'complete' | 'incomplete';
  deadline: string;
  createdAt: string;
  reviewStatus?: 'pending_review' | 'approved' | 'reverted'; // Manager review status
  reviewedBy?: string; // Manager ID who reviewed
  reviewComment?: string; // Comment from manager if reverted
};

export type File = {
  _id?: string;
  name: string;
  size: number;
  type: string;
  url: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  encryptionDetails?: {
    algorithm: string;
    keyIdentifier: string;
    iv?: string; // Initialization vector
    encryptedAt: string;
    passwordProtected?: boolean;
    passwordHash?: string;
  };
  reviewStatus?: 'pending_review' | 'approved' | 'reverted'; // Manager review status
  reviewedBy?: string; // Manager ID who reviewed
  reviewComment?: string; // Comment from manager if reverted
};
