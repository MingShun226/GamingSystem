
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoFillMessage, setAutoFillMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Decryption function to match the encryption in n8n
  const decryptPassword = (encryptedPassword: string): string | null => {
    try {
      // Step 1: Base64 decode
      const step1 = atob(encryptedPassword);
      
      // Step 2: Reverse Caesar cipher (shift back by 3)
      let decrypted = '';
      for (let i = 0; i < step1.length; i++) {
        let char = step1.charCodeAt(i);
        // Reverse shift for printable ASCII characters
        if (char >= 32 && char <= 126) {
          char = ((char - 32 - 3 + 95) % 95) + 32;
        }
        decrypted += String.fromCharCode(char);
      }
      
      // Step 3: Base64 decode again to get original password
      return atob(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  };

  // Auto-fill functionality when page loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoUsername = urlParams.get('username');
    const encryptedToken = urlParams.get('token');
    const legacyPassword = urlParams.get('password'); // Fallback for old links
    
    if (autoUsername && (encryptedToken || legacyPassword)) {
      let autoPassword: string | null = null;
      
      if (encryptedToken) {
        // Decrypt the password from the token
        autoPassword = decryptPassword(encryptedToken);
        console.log('🔓 Password decrypted from secure token');
      } else if (legacyPassword) {
        // Fallback for old non-encrypted links
        autoPassword = legacyPassword;
        console.log('⚠️ Using legacy password parameter');
      }
      
      if (autoPassword) {
        // Auto-fill the form fields
        setUsername(autoUsername);
        setPassword(autoPassword);
        
        // Show success message
        setAutoFillMessage('🎉 Welcome! Your credentials have been auto-filled. Just click Sign In!');
        
        // Clear URL parameters after auto-fill to hide sensitive data
        setTimeout(() => {
          if (window.history && window.history.replaceState) {
            const urlWithoutParams = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, urlWithoutParams);
          }
        }, 2000);
        
        console.log('✅ Auto-fill successful');
      } else {
        console.error('❌ Failed to decrypt password');
        setAutoFillMessage('🔒 Invalid secure link. Please enter credentials manually.');
      }
    }
  }, []);

  // Clear auto-fill message after 5 seconds
  useEffect(() => {
    if (autoFillMessage) {
      const timer = setTimeout(() => {
        setAutoFillMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoFillMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting login with:', { username: username.trim(), password: '***' });
      
      const { data, error } = await supabase.rpc('authenticate_wager_user', {
        username_input: username.trim(),
        password_input: password
      });
      
      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error details:', error);
        toast({
          title: "Login Failed",
          description: `Authentication failed: ${error.message}`,
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

        // Store both for compatibility
        localStorage.setItem('wagerWaveUser', JSON.stringify(user));
        
        // Also store in old format for backward compatibility
        const compatUser = {
          id: user.id,
          username: user.username,
          role: 'user',
          phone: user.phone || '',
          points: 0,
          status: 'active'
        };
        localStorage.setItem('currentUser', JSON.stringify(compatUser));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.username}!`,
        });
        navigate('/');
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

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gaming-dark flex items-center justify-center p-4">
      {/* Auto-fill notification */}
      {autoFillMessage && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg font-bold z-50 max-w-sm text-white shadow-lg transition-all duration-300 ${
          autoFillMessage.includes('🎉') 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
            : 'bg-gradient-to-r from-red-600 to-red-700'
        }`}>
          {autoFillMessage}
        </div>
      )}
      
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          onClick={handleBackToHome}
          variant="ghost"
          className="text-gray-300 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-gaming-darker border-gray-700">
          <CardHeader className="text-center">
            <img 
              src="/lovable-uploads/603076d3-9354-4a55-89b3-ce3f167abbfe.png" 
              alt="ECLBET"
              className="h-12 w-auto mx-auto mb-4"
            />
            <CardTitle className="text-white text-2xl">User Login</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your account to start playing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gaming-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-gaming-teal hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link to="/admin-login" className="text-gray-500 hover:text-gray-400 text-sm">
                Admin Access
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
