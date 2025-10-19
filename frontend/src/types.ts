
export type User = {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  password?: string;
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
};
