import React, { useState } from "react";
import { useApp, SavingsGoal, SavingsMember } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Cat, User, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NewMember {
  name: string;
  contribution?: number;
  email?: string;
}

const Savings: React.FC = () => {
  const { savingsGoals, addTransaction, activeWallet, addSavingsGoal } = useApp();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSaving, setNewSaving] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    members: [] as NewMember[],
  });

  // Add member
  const handleAddMember = () => {
    setNewSaving({
      ...newSaving,
      members: [...newSaving.members, { name: "", contribution: 0, email: "" }],
    });
  };

  // Remove member
  const handleRemoveMember = (index: number) => {
    const updated = [...newSaving.members];
    updated.splice(index, 1);
    setNewSaving({ ...newSaving, members: updated });
  };

  // Update member fields
  const handleMemberChange = (
    index: number,
    field: "name" | "contribution" | "email",
    value: string
  ) => {
    const updated = [...newSaving.members];
    updated[index] = {
      ...updated[index],
      [field]: field === "contribution" ? Number(value) : value,
    };
    setNewSaving({ ...newSaving, members: updated });
  };

  // Create saving goal
  const handleCreateSaving = async () => {
    const targetAmountNum = Number(newSaving.targetAmount);
    if (!newSaving.title.trim()) {
      toast.error("Please enter a saving name");
      return;
    }
    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    // Prepare members based on email
    const members: SavingsMember[] = newSaving.members
      .filter((m) => m.email?.trim())
      .map((m) => ({
        uid: m.email === currentUser.email ? currentUser.uid : "",
        name: m.name || (m.email === currentUser.email ? currentUser.displayName || "You" : "Unknown"),
        email: m.email!,
        contribution: m.contribution || 0,
      }));

    // Always include current user
    if (!members.some((m) => m.uid === currentUser.uid)) {
      members.push({
        uid: currentUser.uid,
        name: currentUser.displayName || "You",
        email: currentUser.email!,
        contribution: 0,
      });
    }

    setLoading(true);
    try {
      const newGoal = await addSavingsGoal({
        title: newSaving.title.trim(),
        targetAmount: targetAmountNum,
        currentAmount: 0,
        deadline: newSaving.deadline || null,
        members,
        walletId: activeWallet,
        createdAt: new Date().toISOString(),
      });

      toast.success("Saving created successfully!");
      setIsDialogOpen(false);
      setNewSaving({ title: "", targetAmount: "", deadline: "", members: [] });
      navigate(`/savings/${newGoal.id}`);
    } catch (err) {
      console.error("Failed to create saving goal:", err);
      toast.error("Failed to create saving goal");
    } finally {
      setLoading(false);
    }
  };

  // Delete a savings goal
  const handleDeleteSaving = async (goalId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteDoc(doc(db, "savingsGoals", goalId));
      toast.success("Saving deleted successfully!");
    } catch (err) {
      console.error("Failed to delete saving goal:", err);
      toast.error("Failed to delete saving goal");
    }
  };

  // Contribute to a goal
  const handleContribute = async (goal: SavingsGoal) => {
    const input = prompt("Enter amount to contribute:", "0");
    const amount = parseFloat(input || "0");
    if (isNaN(amount) || amount <= 0) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setLoading(true);
    try {
      const goalRef = doc(db, "savingsGoals", goal.id);
      const goalSnap = await getDoc(goalRef);
      if (!goalSnap.exists()) throw new Error("Goal not found");

      const goalData = goalSnap.data() as SavingsGoal;
      const updatedMembers = (goalData.members || []).map((m) =>
        m.uid === currentUser.uid
          ? { ...m, contribution: (m.contribution || 0) + amount }
          : m
      );

      const totalContributed = updatedMembers.reduce((sum, m) => sum + (m.contribution || 0), 0);

await updateDoc(goalRef, {
  members: updatedMembers,
  currentAmount: Math.min(totalContributed, goalData.targetAmount),
});

      await addTransaction({
        type: "savings",
        amount,
        walletId: activeWallet,
        category: "savings",
        title: `Contribution to ${goal.title}`,
        note: `Contributor: ${currentUser.displayName || "You"}`,
        date: new Date().toISOString(),
      });

      toast.success("Contribution added!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add contribution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Fredoka" }}>My Savings</h1>
          </div>

          {/* Add Saving */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="bg-white/20 hover:bg-white/30 text-white">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(var(--card))] text-[hsl(var(--stats-foreground))]">
              <DialogHeader>
                <DialogTitle>Create New Saving</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label>Saving Name</Label>
                  <Input
                    placeholder="e.g., Emergency Fund"
                    value={newSaving.title}
                    onChange={(e) => setNewSaving({ ...newSaving, title: e.target.value })}
                    className="mt-2 bg-[hsl(var(--input))]"
                  />
                </div>

                <div>
                  <Label>Target Amount</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    min="1"
                    value={newSaving.targetAmount}
                    onChange={(e) => setNewSaving({ ...newSaving, targetAmount: e.target.value })}
                    className="mt-2 bg-[hsl(var(--input))]"
                  />
                </div>

                <div>
                  <Label>Deadline (optional)</Label>
                  <Input
                    type="date"
                    value={newSaving.deadline}
                    onChange={(e) => setNewSaving({ ...newSaving, deadline: e.target.value })}
                    className="mt-2 bg-[hsl(var(--input))]"
                  />
                </div>

                <div>
                  <Label>Members (optional)</Label>
                  <div className="space-y-2 mt-2">
                    {newSaving.members.map((member, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <User className="w-5 h-5 text-primary" />
                        <Input
                          type="email"
                          placeholder="Member email"
                          value={member.email || ""}
                          onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                          className="flex-1 bg-[hsl(var(--input))]"
                        />
                        <Input
                          type="number"
                          placeholder="Assigned RM"
                          min="0"
                          value={member.contribution ?? ""}
                          onChange={(e) => handleMemberChange(index, "contribution", e.target.value)}
                          className="w-24 bg-[hsl(var(--input))]"
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveMember(index)}>✕</Button>
                      </div>
                    ))}
                    <Button type="button" onClick={handleAddMember} className="w-full mt-3">+ Add Member</Button>
                  </div>
                </div>

                <Button onClick={handleCreateSaving} className="w-full mt-4" disabled={loading}>
                  {loading ? "Processing..." : "Create Saving"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Savings list */}
      <div className="px-6 mt-6">
        {savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => (
              <Card key={goal.id} className="p-4 shadow-soft hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg cursor-pointer" onClick={() => navigate(`/savings/${goal.id}`)}>
                    {goal.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Cat className="text-primary w-5 h-5" />
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteSaving(goal.id, goal.title)}>
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-1">
                  RM {goal.currentAmount.toFixed(2)} / RM {goal.targetAmount.toFixed(2)}
                </p>
                {goal.deadline && <p className="text-xs text-muted-foreground mb-2">Deadline: {goal.deadline}</p>}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }} />
                </div>
                <Button onClick={() => handleContribute(goal)} className="w-full mt-3" disabled={loading}>Contribute</Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center shadow-soft border-none mt-6">
            <Cat className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No savings yet</p>
            <p className="text-sm text-muted-foreground mt-2">Create your first saving goal to start tracking your progress!</p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Savings;
