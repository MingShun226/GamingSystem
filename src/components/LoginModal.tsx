
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase, WagerWaveUser } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess?: (user: WagerWaveUser) => void;
}

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('authenticate_wager_user', {
        username_input: username.trim(),
        password_input: password
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: "Failed to authenticate. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        const user = data[0];
        
        if (!user.is_active) {
          toast({
            title: "Account Deactivated",
            description: "Your account has been deactivated. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.username}!`,
        });
        
        // Store user data in localStorage for session management
        localStorage.setItem('wagerWaveUser', JSON.stringify(user));
        
        // Clear form
        setUsername('');
        setPassword('');
        
        // Call success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
        
        onClose();
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gaming-dark border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">Login</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button type="submit" className="gaming-button w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onSwitchToRegister}
              className="text-gaming-teal hover:text-gaming-teal/80 text-sm"
            >
              Don't have an account? Register here
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
