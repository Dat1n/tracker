import React, { useState } from 'react';
import { useApp, SavingsGoal } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, PiggyBank, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Chart.js imports
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface NewMember {
  name: string;
  contribution?: number;
}

const Savings = () => {
  const { savingsGoals, addSavingsGoal, contributeToSaving, addTransaction, activeWallet, deleteSavingsGoal, } = useApp();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const [newSaving, setNewSaving] = useState({
    title: '',
    targetAmount: 0,
    deadline: '',
    members: [] as NewMember[],
  });

  const handleAddMember = () => {
    setNewSaving({
      ...newSaving,
      members: [...newSaving.members, { name: '', contribution: undefined }],
    });
  };

  const handleRemoveMember = (index: number) => {
    const updated = [...newSaving.members];
    updated.splice(index, 1);
    setNewSaving({ ...newSaving, members: updated });
  };

  const handleMemberChange = (index: number, field: 'name' | 'contribution', value: string) => {
    const updatedMembers = [...newSaving.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: field === 'contribution' ? Number(value) : value,
    };
    setNewSaving({ ...newSaving, members: updatedMembers });
  };

 const handleCreateSaving = () => {
  if (!newSaving.title.trim()) {
    toast.error('Please enter a saving name');
    return;
  }
  if (newSaving.targetAmount <= 0) {
    toast.error('Target amount must be greater than 0');
    return;
  }

  // Create the saving goal
  const savingData = {
    title: newSaving.title,
    targetAmount: newSaving.targetAmount,
    deadline: newSaving.deadline || undefined,
    members: newSaving.members.filter(m => m.name.trim() !== ''),
    currentAmount: 0,
  };
  
  addSavingsGoal(savingData);

  toast.success('Saving created successfully!');

  // Reset the form
  setIsDialogOpen(false);
  setNewSaving({ title: '', targetAmount: 0, deadline: '', members: [] });

  // Navigate back to the savings list
  navigate('/savings');
};


  const handleContribute = (goal: SavingsGoal) => {
    const input = prompt('Enter amount to contribute:', '0');
    const amount = parseFloat(input || '0');
    if (isNaN(amount) || amount <= 0) return;

    contributeToSaving(goal.id, amount, 'You'); // you can replace 'You' with a real user

    addTransaction({
      type: 'savings',
      amount,
      walletId: activeWallet,
      category: 'savings',
      title: `Contribution to ${goal.title}`,
      note: '',
      date: new Date().toISOString().split('T')[0],
    });

    toast.success('Contribution added!');
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
              My Savings
            </h1>
          </div>

          {/* Add Saving */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="bg-white/20 hover:bg-white/30 text-white">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
<DialogContent className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))] text-[hsl(var(--stats-foreground))]">
  <DialogHeader>
    <DialogTitle className="text-[hsl(var(--stats-foreground))]">
      Create New Saving
    </DialogTitle>
    {/* Close Button */}

  </DialogHeader>

  <div className="space-y-4 mt-4">
    {/* Saving Name */}
    <div>
      <Label
        htmlFor="saving-title"
        className="text-[hsl(var(--stats-foreground))]"
      >
        Saving Name
      </Label>
      <Input
        id="saving-title"
        placeholder="e.g., Emergency Fund"
        value={newSaving.title}
        onChange={(e) =>
          setNewSaving({ ...newSaving, title: e.target.value })
        }
        className="mt-2 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] bg-[hsl(var(--input))]"
      />
    </div>

    {/* Target Amount */}
    <div>
      <Label
        htmlFor="target-amount"
        className="text-[hsl(var(--stats-foreground))]"
      >
        Target Amount
      </Label>
      <Input
        id="target-amount"
        type="number"
        placeholder="e.g., 5000"
        value={newSaving.targetAmount}
        onChange={(e) =>
          setNewSaving({
            ...newSaving,
            targetAmount: Number(e.target.value),
          })
        }
        className="mt-2 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] bg-[hsl(var(--input))]"
      />
    </div>

    {/* Deadline */}
    <div>
      <Label
        htmlFor="deadline"
        className="text-[hsl(var(--stats-foreground))]"
      >
        Deadline (optional)
      </Label>
      <Input
        id="deadline"
        type="date"
        value={newSaving.deadline}
        onChange={(e) =>
          setNewSaving({ ...newSaving, deadline: e.target.value })
        }
        className="mt-2 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] bg-[hsl(var(--input))]"
      />
    </div>

    {/* Members */}
    <div>
      <Label className="text-[hsl(var(--stats-foreground))]">
        Members (optional)
      </Label>
      <div className="space-y-2 mt-2">
        {newSaving.members.map((member, index) => (
          <div key={index} className="flex gap-2 items-center">
            <User className="w-5 h-5 text-primary" />
            <Input
              placeholder="Member name"
              value={member.name}
              onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
              className="flex-1 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] bg-[hsl(var(--input))]"
            />
            <Input
              type="number"
              placeholder="Assigned $"
              value={member.contribution ?? ''}
              onChange={(e) => handleMemberChange(index, 'contribution', e.target.value)}
              className="w-24 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] bg-[hsl(var(--input))]"
            />

          </div>
        ))}
        <Button type="button" onClick={handleAddMember} className="w-full mt-2">
          Add Member
        </Button>
      </div>
    </div>

    <Button onClick={handleCreateSaving} className="w-full mt-4">
      Create Saving
    </Button>
  </div>
</DialogContent>


          </Dialog>
        </div>
      </div>

      {/* Savings list or selected goal */}
      <div className="px-6 mt-6">
        {selectedGoal ? (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">{selectedGoal.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">
              ${selectedGoal.currentAmount.toFixed(2)} / ${selectedGoal.targetAmount.toFixed(2)}
            </p>
            {selectedGoal.members && selectedGoal.members.length > 0 && (
              <div className="space-y-2 mb-4">
                {selectedGoal.members.map((m, idx) => {
                  const percent = ((m.contribution || 0) / selectedGoal.targetAmount) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm">
                        <span>{m.name}</span>
                        <span>${m.contribution?.toFixed(2) || 0}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Pie
              data={{
                labels: selectedGoal.members?.map((m) => m.name) || ['No Members'],
                datasets: [
                  {
                    data: selectedGoal.members?.map((m) => m.contribution || 0) || [1],
                    backgroundColor: selectedGoal.members?.map(() => '#4ade80') || ['#4ade80'],
                  },
                ],
              }}
            />

            <Button onClick={() => setSelectedGoal(null)} className="w-full mt-4">
              Back
            </Button>
          </Card>
        ) : savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => (
              <Card
                key={goal.id}
                className="p-4 cursor-pointer shadow-soft hover:shadow-md transition-all"
                onClick={() => navigate(`/savings/${goal.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg">{goal.title}</h2>
                  <PiggyBank className="text-primary w-5 h-5" />
                </div>

                <p className="text-muted-foreground text-sm mb-1">
                  ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                </p>
                {goal.deadline && (
                  <p className="text-xs text-muted-foreground mb-2">Deadline: {goal.deadline}</p>
                )}

                {goal.members && goal.members.length > 0 && (
                  <div className="mb-2 text-sm text-muted-foreground">
                    Members: {goal.members.map((m) => m.name).join(', ')}
                  </div>
                )}

                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center shadow-soft border-none mt-6">
            <PiggyBank className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No savings yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first saving goal to start tracking your progress!
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Savings;
