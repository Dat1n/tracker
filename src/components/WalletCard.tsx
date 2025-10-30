import React from 'react';
import { Card } from '@/components/ui/card';
import { Wallet } from '@/context/AppContext';
import { Users, User } from 'lucide-react';

interface WalletCardProps {
  wallet: Wallet;
  isActive: boolean;
  onClick: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, isActive, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className={`p-6 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer border-2 ${
        isActive
          ? 'border-primary bg-gradient-primary'
          : 'border-transparent hover:border-primary/50'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/20' : 'bg-primary/10'}`}>
            {wallet.type === 'shared' ? (
              <Users className={`w-6 h-6 ${isActive ? 'text-white' : 'text-primary'}`} />
            ) : (
              <User className={`w-6 h-6 ${isActive ? 'text-white' : 'text-primary'}`} />
            )}
          </div>
          <div>
            <p className={`font-semibold ${isActive ? 'text-white' : 'text-foreground'}`}>
              {wallet.name}
            </p>
            <p className={`text-sm ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
              {wallet.type === 'shared' ? `${wallet.members?.length || 0} members` : 'Personal'}
            </p>
          </div>
        </div>
      </div>
      <div>
        <p className={`text-sm ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
          Balance
        </p>
        <p className={`text-3xl font-bold ${isActive ? 'text-white' : 'text-foreground'}`}>
          ${wallet.balance.toFixed(2)}
        </p>
      </div>
    </Card>
  );
};

export default WalletCard;
