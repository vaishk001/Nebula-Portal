// SSO Authentication Context and Utilities

export interface SSOProvider {
  id: 'google' | 'microsoft' | 'github';
  name: string;
  enabled: boolean;
}

export interface SSOUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  providerId: string;
  role: 'admin' | 'user' | 'manager';
  isApproved: boolean;
  ssoLinked: boolean;
  createdAt: string;
}

// SSO Session Token
export interface SSOSession {
  token: string;
  expiresAt: number;
  userId: string;
  provider: string;
}

// Check if SSO session is valid
export const isSessionValid = (): boolean => {
  const session = localStorage.getItem('nebulaSSO');
  if (!session) return false;
  
  try {
    const ssoSession: SSOSession = JSON.parse(session);
    return Date.now() < ssoSession.expiresAt;
  } catch {
    return false;
  }
};

// Get current SSO session
export const getSession = (): SSOSession | null => {
  const session = localStorage.getItem('nebulaSSO');
  if (!session) return null;
  
  try {
    const ssoSession: SSOSession = JSON.parse(session);
    if (Date.now() < ssoSession.expiresAt) {
      return ssoSession;
    }
    // Session expired, clear it
    clearSession();
    return null;
  } catch {
    return null;
  }
};

// Create new SSO session
export const createSession = (userId: string, provider: string): SSOSession => {
  const session: SSOSession = {
    token: generateSessionToken(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    userId,
    provider
  };
  
  localStorage.setItem('nebulaSSO', JSON.stringify(session));
  return session;
};

// Clear SSO session
export const clearSession = (): void => {
  localStorage.removeItem('nebulaSSO');
};

// Generate secure session token
const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Link SSO account to existing user
export const linkSSOAccount = (
  userId: string,
  provider: string,
  providerId: string
): boolean => {
  try {
    const usersJson = localStorage.getItem('nebulaUsers');
    if (!usersJson) return false;
    
    const users = JSON.parse(usersJson);
    const updatedUsers = users.map((user: SSOUser) => {
      if (user.id === userId) {
        return {
          ...user,
          ssoLinked: true,
          provider,
          providerId
        };
      }
      return user;
    });
    
    localStorage.setItem('nebulaUsers', JSON.stringify(updatedUsers));
    return true;
  } catch {
    return false;
  }
};

// Find user by SSO provider ID
export const findUserByProvider = (
  provider: string,
  providerId: string
): SSOUser | null => {
  try {
    const usersJson = localStorage.getItem('nebulaUsers');
    if (!usersJson) return null;
    
    const users: SSOUser[] = JSON.parse(usersJson);
    return users.find(u => u.provider === provider && u.providerId === providerId) || null;
  } catch {
    return null;
  }
};

// Find user by email
export const findUserByEmail = (email: string): SSOUser | null => {
  try {
    const usersJson = localStorage.getItem('nebulaUsers');
    if (!usersJson) return null;
    
    const users: SSOUser[] = JSON.parse(usersJson);
    return users.find(u => u.email === email) || null;
  } catch {
    return null;
  }
};

// Create new SSO user
export const createSSOUser = (
  email: string,
  name: string,
  provider: string,
  providerId: string,
  picture?: string
): SSOUser => {
  const newUser: SSOUser = {
    id: Date.now().toString(),
    email,
    name,
    picture,
    provider,
    providerId,
    role: 'user', // Default role for SSO users
    isApproved: true, // SSO users are auto-approved
    ssoLinked: true,
    createdAt: new Date().toISOString()
  };
  
  const usersJson = localStorage.getItem('nebulaUsers');
  const users = usersJson ? JSON.parse(usersJson) : [];
  users.push(newUser);
  localStorage.setItem('nebulaUsers', JSON.stringify(users));
  
  return newUser;
};

// Simulate Google OAuth (in production, use actual OAuth flow)
export const simulateGoogleOAuth = async (): Promise<{
  email: string;
  name: string;
  picture: string;
  providerId: string;
} | null> => {
  // Simulated OAuth - in production, this would open OAuth popup/redirect
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful OAuth
      const mockProfile = {
        email: `user${Date.now()}@gmail.com`,
        name: 'Google User',
        picture: 'https://via.placeholder.com/150',
        providerId: `google_${Date.now()}`
      };
      resolve(mockProfile);
    }, 1000);
  });
};

// Simulate Microsoft OAuth
export const simulateMicrosoftOAuth = async (): Promise<{
  email: string;
  name: string;
  picture: string;
  providerId: string;
} | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProfile = {
        email: `user${Date.now()}@outlook.com`,
        name: 'Microsoft User',
        picture: 'https://via.placeholder.com/150',
        providerId: `microsoft_${Date.now()}`
      };
      resolve(mockProfile);
    }, 1000);
  });
};

// Simulate GitHub OAuth
export const simulateGitHubOAuth = async (): Promise<{
  email: string;
  name: string;
  picture: string;
  providerId: string;
} | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProfile = {
        email: `user${Date.now()}@users.noreply.github.com`,
        name: 'GitHub User',
        picture: 'https://via.placeholder.com/150',
        providerId: `github_${Date.now()}`
      };
      resolve(mockProfile);
    }, 1000);
  });
};

// Logout and clear all sessions
export const handleSSOLogout = (): void => {
  clearSession();
  localStorage.removeItem('nebulaUser');
};

// Check for existing session on app load
export const checkExistingSession = (): SSOUser | null => {
  const session = getSession();
  if (!session) return null;
  
  const userJson = localStorage.getItem('nebulaUser');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as SSOUser;
  } catch {
    return null;
  }
};
