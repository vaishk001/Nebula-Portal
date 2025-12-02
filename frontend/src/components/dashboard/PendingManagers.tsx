import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserCheck, UserX, Clock, Mail, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { User } from '../../types';
import { getUsers } from '../../utils/api';
import axios from 'axios';

const PendingManagers: React.FC = () => {
  const [pendingManagers, setPendingManagers] = useState<User[]>([]);

  useEffect(() => {
    console.log('PendingManagers component mounted');
    loadPendingManagers();
    
    // Poll for changes every 2 seconds
    const interval = setInterval(loadPendingManagers, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingManagers = async () => {
    try {
      const allUsers = await getUsers();
      console.log('Loading pending managers from MongoDB:', allUsers);
      const pending = allUsers.filter(user => {
        const isManager = user.role === 'manager';
        const notApproved = user.isApproved === false;
        console.log(`User ${user.name}: role=${user.role}, isApproved=${user.isApproved}`);
        return isManager && notApproved;
      });
      console.log('Filtered pending managers:', pending);
      setPendingManagers(pending);
    } catch (error) {
      console.error('Error loading pending managers:', error);
    }
  };

  const handleApprove = async (managerId: string, managerName: string) => {
    try {
      await axios.put(`/api/users/${managerId}/approve`);
      loadPendingManagers();
      toast.success(`${managerName} has been approved as a manager`);
    } catch (error) {
      console.error('Error approving manager:', error);
      toast.error('Failed to approve manager');
    }
  };

  const handleReject = async (managerId: string, managerName: string) => {
    try {
      await axios.delete(`/api/users/${managerId}/reject`);
      loadPendingManagers();
      toast.success(`${managerName}'s manager request has been rejected`);
    } catch (error) {
      console.error('Error rejecting manager:', error);
      toast.error('Failed to reject manager');
    }
  };

  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <UserCheck className="text-nebula-500" />
          Pending Manager Approvals
          {pendingManagers.length > 0 && (
            <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
              {pendingManagers.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Review and approve manager signup requests</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingManagers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock size={40} className="mx-auto mb-3 opacity-50" />
            <p>No pending manager requests</p>
            <p className="text-xs mt-2">Manager signups will appear here for approval</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {pendingManagers.map(manager => (
              <Card key={manager.id} className="border-border/30 bg-secondary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-nebula-600/20 text-nebula-500 rounded-full flex items-center justify-center">
                        <UserIcon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate">{manager.name}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Mail size={14} className="mr-1" />
                          <span className="truncate">{manager.email}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                      Pending
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleApprove(manager.id, manager.name)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                    >
                      <UserCheck size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(manager.id, manager.name)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <UserX size={16} className="mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingManagers;
