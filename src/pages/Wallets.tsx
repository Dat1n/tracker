import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import WalletCard from '@/components/WalletCard';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Wallets = () => {
  const { wallets, activeWallet, setActiveWallet, addWallet } = useApp();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'personal' as 'personal' | 'shared',
  });

  const handleCreateWallet = () => {
    if (!newWallet.name.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    addWallet({
      name: newWallet.name,
      type: newWallet.type,
      members: newWallet.type === 'shared' ? ['You'] : undefined,
    });

    toast.success('Wallet created!');
    setIsDialogOpen(false);
    setNewWallet({ name: '', type: 'personal' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Fredoka' }}>
              My Wallets
            </h1>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="wallet-name">Wallet Name</Label>
                  <Input
                    id="wallet-name"
                    placeholder="e.g., Family Budget"
                    value={newWallet.name}
                    onChange={(e) =>
                      setNewWallet({ ...newWallet, name: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Wallet Type</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Button
                      type="button"
                      variant={newWallet.type === 'personal' ? 'default' : 'outline'}
                      onClick={() => setNewWallet({ ...newWallet, type: 'personal' })}
                    >
                      Personal
                    </Button>
                    <Button
                      type="button"
                      variant={newWallet.type === 'shared' ? 'default' : 'outline'}
                      onClick={() => setNewWallet({ ...newWallet, type: 'shared' })}
                    >
                      Shared
                    </Button>
                  </div>
                </div>
                <Button onClick={handleCreateWallet} className="w-full">
                  Create Wallet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              isActive={wallet.id === activeWallet}
              onClick={() => {
                setActiveWallet(wallet.id);
                toast.success(`Switched to ${wallet.name}`);
              }}
            />
          ))}
        </div>

        {wallets.length === 0 && (
          <Card className="p-12 text-center shadow-soft border-none">
            <p className="text-muted-foreground text-lg">No wallets yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first wallet to get started!
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Wallets;
