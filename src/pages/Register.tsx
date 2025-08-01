
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting registration with:', { username: username.trim(), phone: phone.trim() });
      
      // Register user in Supabase with password
      const { data, error } = await supabase.rpc('register_wager_user', {
        username_input: username.trim(),
        password_input: password,
        phone_input: phone.trim() || null
      });
      
      console.log('Supabase response:', { data, error });

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
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Also store in localStorage for backward compatibility with existing features
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
          id: data[0].id,
          username: username.trim(),
          password, // Keep password for localStorage compatibility
          role: 'user',
          phone: phone.trim(),
          referralCode: referralCode.trim(),
          points: 0,
          status: 'active',
          createdAt: data[0].created_at
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        toast({
          title: "Registration Successful",
          description: "User account has been created successfully!",
        });
        
        navigate('/login');
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
    <div className="min-h-screen bg-gaming-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="gaming-card rounded-lg p-8 border border-gray-700/50">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-white text-2xl font-bold">Sign up</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/603076d3-9354-4a55-89b3-ce3f167abbfe.png"
              alt="ECLBET"
              className="h-12 w-auto"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 h-12"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 h-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-teal hover:text-gaming-teal/80"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 h-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-teal hover:text-gaming-teal/80"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>

            <div>
              <Input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Referral code (optional)"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold h-12 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>

            <div className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-gaming-teal hover:text-gaming-teal/80 font-medium"
              >
                Login now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
