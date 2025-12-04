
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Shield } from 'lucide-react';
import { User } from '../../types';
import { Badge } from '../ui/badge';
import { getUsers } from '../../utils/api';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from MongoDB
    const loadUsers = async () => {
      try {
        const allUsers = await getUsers();
        // Show regular users and approved managers, not admins
        const regularUsers = allUsers.filter((user: User) => 
          (user.role === 'user') || (user.role === 'manager' && user.isApproved)
        );
        setUsers(regularUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  if (users.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No users found</p>
        <p className="text-xs mt-2">Users will appear here when they register</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
      {(Array.isArray(users) ? users : []).map(user => (
        <div key={user.id} className="flex items-center p-3 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors">
          <div className="w-8 h-8 bg-nebula-600/20 text-nebula-500 rounded-full flex items-center justify-center mr-3">
            {user.role === 'manager' ? <Shield size={16} /> : <UserIcon size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{user.name}</p>
              {user.role === 'manager' && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  Manager
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
              <Mail size={12} className="mr-1" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
