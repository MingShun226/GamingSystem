
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (username and password)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('register_wager_user', {
        username_input: username.trim(),
        password_input: password,
        phone_input: phone.trim() || null
      });

      if (error) {
        if (error.message.includes('Username already exists')) {
          toast({
            title: "Registration Failed",
            description: "Username already exists. Please choose a different username.",
            variant: "destructive",
          });
        } else if (error.message.includes('Phone number already registered')) {
          toast({
            title: "Registration Failed",
            description: "Phone number already registered. Please use a different number.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: "Failed to create account. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data && data.length > 0) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!",
        });
        
        // Clear form
        setUsername('');
        setPassword('');
        setPhone('');
        onClose();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
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
          <DialogTitle className="text-white text-center">Register</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username" className="text-gray-300">Username</Label>
            <Input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Choose a username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-gray-300">Password</Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter your password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reg-phone" className="text-gray-300">Phone Number (Optional)</Label>
            <Input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button type="submit" className="gaming-button w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onSwitchToLogin}
              className="text-gaming-teal hover:text-gaming-teal/80 text-sm"
            >
              Already have an account? Login here
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
