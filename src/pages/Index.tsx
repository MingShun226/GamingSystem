
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import GameProviders from '@/components/GameProviders';
import BettingTransaction from '@/components/BettingTransaction';
import MovieSection from '@/components/MovieSection';
import SponsorsSection from '@/components/SponsorsSection';
import Footer from '@/components/Footer';

const Index = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const user = localStorage.getItem('currentUser');
      if (user) {
        setCurrentUser(JSON.parse(user));
      } else {
        setCurrentUser(null);
      }
    };

    // Check user on mount
    checkUser();

    // Listen for storage changes (when user logs in from another tab)
    window.addEventListener('storage', checkUser);
    
    // Also check periodically for login state changes
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handlePlayNow = () => {
    if (currentUser?.role === 'user') {
      navigate('/game');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gaming-dark max-w-full overflow-x-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={handleSidebarToggle}
      />
      
      <div 
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-12' : 'ml-56'
        } min-h-screen flex flex-col`}
      >
        <Header onSidebarToggle={handleSidebarToggle} />
        
        <div className="flex-1">
          <main className="animate-fade-in max-w-7xl mx-auto">
            <HeroSection onPlayNow={handlePlayNow} />
            <GameProviders />
            <BettingTransaction />
            <MovieSection />
            <SponsorsSection />
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
