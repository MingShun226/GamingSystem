
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  username: string;
  points: number;
  phone: string;
  referralCode: string;
  status: string;
  role: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pointsToAdd, setPointsToAdd] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadUsers = () => {
    // Load users
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const regularUsers = allUsers.filter((user: User) => user.role === 'user');
    setUsers(regularUsers);
    console.log('Loaded users:', regularUsers);
  };

  useEffect(() => {
    // Check if current user is admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }

    loadUsers();

    // Set up an interval to refresh user data periodically
    const interval = setInterval(loadUsers, 2000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const handleAddPoints = () => {
    if (!selectedUser || !pointsToAdd || parseInt(pointsToAdd) <= 0) {
      toast({
        title: "Error",
        description: "Please select a user and enter a valid points amount",
        variant: "destructive",
      });
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = allUsers.findIndex((user: User) => user.id === selectedUser);
    
    if (userIndex !== -1) {
      allUsers[userIndex].points += parseInt(pointsToAdd);
      localStorage.setItem('users', JSON.stringify(allUsers));
      
      // Update local state
      loadUsers(); // Refresh the users list

      toast({
        title: "Points Added",
        description: `Successfully added ${pointsToAdd} points to ${allUsers[userIndex].username}`,
      });

      setSelectedUser('');
      setPointsToAdd('');
    }
  };

  const handleRefresh = () => {
    loadUsers();
    toast({
      title: "Refreshed",
      description: "User data has been refreshed",
    });
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      {/* Header */}
      <header className="bg-gaming-darker border-b border-gray-700/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/603076d3-9354-4a55-89b3-ce3f167abbfe.png" 
              alt="ECLBET"
              className="h-8 w-auto"
            />
            <h1 className="text-white text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Add Points Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
          <h2 className="text-white text-lg font-semibold mb-4">Add Points to User</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-gray-300 text-sm mb-2">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="">Choose a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-300 text-sm mb-2">Points to Add</label>
              <Input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="Enter points amount"
                className="bg-gray-700 border-gray-600 text-white"
                min="1"
              />
            </div>
            <Button
              onClick={handleAddPoints}
              className="bg-gaming-teal hover:bg-gaming-teal/80 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Points
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-white text-lg font-semibold">User Management</h2>
              <p className="text-gray-400 text-sm mt-1">Total Users: {users.length}</p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-700/50">
                  <TableHead className="text-gray-300">Username</TableHead>
                  <TableHead className="text-gray-300">Points</TableHead>
                  <TableHead className="text-gray-300">Phone</TableHead>
                  <TableHead className="text-gray-300">Referral Code</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell className="text-white font-medium">{user.username}</TableCell>
                    <TableCell className="text-gaming-teal font-semibold">{user.points}</TableCell>
                    <TableCell className="text-gray-300">{user.phone || 'N/A'}</TableCell>
                    <TableCell className="text-gray-300">{user.referralCode || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No users registered yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
