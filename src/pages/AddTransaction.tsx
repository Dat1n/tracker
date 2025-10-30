import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VirtualPet from '@/components/VirtualPet';

const AddTransaction = () => {
  const { addTransaction, categories, activeWallet } = useApp();
  const navigate = useNavigate();
  const [showPet, setShowPet] = useState(false);

  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income' | 'savings',
    amount: '',
    category: '',
    title: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      walletId: activeWallet,
    });

    if (formData.type === 'savings') {
      setShowPet(true);
      setTimeout(() => {
        toast.success('Great job saving! 🎉');
        navigate('/');
      }, 3000);
    } else {
      toast.success('Transaction added!');
      navigate('/');
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (formData.type === 'income') return c.id === 'income';
    if (formData.type === 'savings') return c.id === 'savings';
    return c.id !== 'income' && c.id !== 'savings';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      <VirtualPet show={showPet} onComplete={() => setShowPet(false)} />

      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card">
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
            Add Transaction
          </h1>
        </div>
      </div>

      <div className="px-6 mt-6">
        <Card className="p-6 shadow-card border-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <Label>Transaction Type</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {['expense', 'income', 'savings'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.type === type ? 'default' : 'outline'}
                    onClick={() =>
                      setFormData({ ...formData, type: type as any, category: '' })
                    }
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="text-2xl font-bold mt-2"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {filteredCategories.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={formData.category === category.id ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, category: category.id })}
                    className="h-auto py-3 flex flex-col gap-1"
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-xs">{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Grocery shopping"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Note */}
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full rounded-full" size="lg">
              Add Transaction
            </Button>
          </form>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default AddTransaction;
