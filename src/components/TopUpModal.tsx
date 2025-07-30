
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, X } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  onTopUpSuccess: (newPoints: number) => void;
}

const TopUpModal = ({ isOpen, onClose, currentPoints, onTopUpSuccess }: TopUpModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const topUpOptions = [50, 100, 200, 500, 1000, 2000];

  const handleTopUp = async () => {
    if (!selectedAmount) {
      toast({
        title: "Please select an amount",
        description: "Choose how much you want to top up",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const newPoints = currentPoints + selectedAmount;
      
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (currentUser.id) {
        // Update currentUser in localStorage
        currentUser.points = newPoints;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update the user in the users array as well
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = allUsers.findIndex((user: any) => user.id === currentUser.id);
        
        if (userIndex !== -1) {
          allUsers[userIndex].points = newPoints;
          localStorage.setItem('users', JSON.stringify(allUsers));
          console.log('Updated user points in users array:', allUsers[userIndex]);
        }
        
        console.log('Updated currentUser points:', currentUser);
        console.log('New points total:', newPoints);
      }
      
      // Call the success callback to update parent component
      onTopUpSuccess(newPoints);
      setIsLoading(false);
      setSelectedAmount(null);
      onClose();
      
      toast({
        title: "Top Up Successful!",
        description: `${selectedAmount} points added to your account`,
      });
    }, 1500);
  };

  const handleCancel = () => {
    setSelectedAmount(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gaming-dark border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-gaming-teal" />
            Top Up Points
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Points */}
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400 text-sm">Current Points</p>
            <p className="text-2xl font-bold text-gaming-teal">{currentPoints}</p>
          </div>

          {/* Top Up Options */}
          <div className="space-y-3">
            <p className="text-white font-medium">Select Top Up Amount:</p>
            <div className="grid grid-cols-2 gap-3">
              {topUpOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAmount === amount
                      ? 'border-gaming-teal bg-gaming-teal/20 text-gaming-teal'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {amount} Points
                </button>
              ))}
            </div>
          </div>

          {/* Selected Amount Preview */}
          {selectedAmount && (
            <div className="p-4 bg-gaming-teal/10 border border-gaming-teal/30 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Current Points:</span>
                <span className="text-white">{currentPoints}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Top Up Amount:</span>
                <span className="text-gaming-teal">+{selectedAmount}</span>
              </div>
              <hr className="my-2 border-gray-600" />
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">New Total:</span>
                <span className="text-gaming-teal">{currentPoints + selectedAmount}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={!selectedAmount || isLoading}
              className="flex-1 bg-gaming-teal hover:bg-gaming-teal/80 text-white"
            >
              {isLoading ? 'Processing...' : `Top Up ${selectedAmount || 0} Points`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpModal;
