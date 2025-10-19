import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { User } from '../../types';

interface UserProfileProps {
  userData: User;
  onUpdate: (updatedUser: User) => void;
}

const UserProfile = ({ userData, onUpdate }: UserProfileProps) => {
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    password: '',
    confirmPassword: '',
  });
  
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password) {
      if (formData.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters",
          variant: "destructive"
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please ensure both passwords match",
          variant: "destructive"
        });
        return;
      }
    }
    
    const updatedUser: User = {
      ...userData,
      name: formData.name,
      email: formData.email,
    };
    
    if (formData.password) {
      updatedUser.password = formData.password;
    }
    
    const usersJson = localStorage.getItem('nebulaUsers');
    if (usersJson) {
      try {
        const users = JSON.parse(usersJson);
        const updatedUsers = users.map((user: User) => {
          if (user.id === userData.id) {
            return updatedUser;
          }
          return user;
        });
        localStorage.setItem('nebulaUsers', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error("Error updating user in users list:", e);
      }
    }
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully"
    });
    
    onUpdate(updatedUser);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div>
        <label htmlFor="name" className="nebula-label">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="nebula-input w-full"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="nebula-label">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="nebula-input w-full"
          required
        />
      </div>
      
      <div className="pt-2 border-t border-border/30">
        <p className="text-sm text-muted-foreground mb-3">Change Password (leave blank to keep current)</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="nebula-label">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              className="nebula-input w-full"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="nebula-label">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              className="nebula-input w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button type="submit" className="nebula-button w-full">
          Update Profile
        </button>
      </div>
      
      <div className="text-center text-xs text-muted-foreground pt-2">
        <p>Role: {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</p>
        <p>User ID: {userData.id}</p>
      </div>
    </form>
  );
};

export default UserProfile;
