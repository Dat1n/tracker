import React, { useState } from "react";
import { useApp, SavingsGoal } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface NewMember {
  name: string;
  contribution?: number;
}

const Savings = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    contributeToSaving,
    addTransaction,
    deleteSavingsGoal, // ✅ New delete function
    activeWallet,
  } = useApp();

  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSaving, setNewSaving] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    members: [] as NewMember[],
  });

  const handleAddMember = () => {
    setNewSaving({
      ...newSaving,
      members: [...newSaving.members, { name: "", contribution: undefined }],
    });
  };

  const handleRemoveMember = (index: number) => {
    const updated = [...newSaving.members];
    updated.splice(index, 1);
    setNewSaving({ ...newSaving, members: updated });
  };

  const handleMemberChange = (
    index: number,
    field: "name" | "contribution",
    value: string
  ) => {
    const updatedMembers = [...newSaving.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: field === "contribution" ? Number(value) : value,
    };
    setNewSaving({ ...newSaving, members: updatedMembers });
  };

  const handleCreateSaving = () => {
    const targetAmountNum = Number(newSaving.targetAmount);

    if (!newSaving.title.trim()) {
      toast.error("Please enter a saving name");
      return;
    }
    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    const savingData = {
      title: newSaving.title,
      targetAmount: targetAmountNum,
      currentAmount: 0,
      deadline: newSaving.deadline || undefined,
      members: newSaving.members.filter((m) => m.name.trim() !== ""),
    };

    const newGoal = addSavingsGoal(savingData);
    toast.success("Saving created successfully!");
    setIsDialogOpen(false);
    setNewSaving({ title: "", targetAmount: "", deadline: "", members: [] });
    navigate(`/savings/${newGoal.id}`);
  };

  const handleDeleteSaving = (goalId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteSavingsGoal(goalId);
      toast.success("Saving deleted successfully!");
    }
  };

  const handleContribute = (goal: SavingsGoal) => {
    const input = prompt("Enter amount to contribute:", "0");
    const amount = parseFloat(input || "0");
    if (isNaN(amount) || amount <= 0) return;

    contributeToSaving(goal.id, amount, "You");
    addTransaction({
      type: "savings",
      amount,
      walletId: activeWallet,
      category: "savings",
      title: `Contribution to ${goal.title}`,
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    toast.success("Contribution added!");
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
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Fredoka" }}
            >
              My Savings
            </h1>
          </div>

          {/* Add Saving */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
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
                    onChange={(e) =>
                      setNewSaving({ ...newSaving, title: e.target.value })
                    }
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
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || Number(value) >= 0) {
                        setNewSaving({ ...newSaving, targetAmount: value });
                      }
                    }}
                    className="mt-2 bg-[hsl(var(--input))]"
                  />
                </div>

                <div>
                  <Label>Deadline (optional)</Label>
                  <Input
                    type="date"
                    value={newSaving.deadline}
                    onChange={(e) =>
                      setNewSaving({ ...newSaving, deadline: e.target.value })
                    }
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
                          placeholder="Member name"
                          value={member.name}
                          onChange={(e) =>
                            handleMemberChange(index, "name", e.target.value)
                          }
                          className="flex-1 bg-[hsl(var(--input))]"
                        />
                        <Input
                          type="number"
                          placeholder="Assigned RM"
                          min="0"
                          value={member.contribution ?? ""}
                          onChange={(e) =>
                            handleMemberChange(
                              index,
                              "contribution",
                              e.target.value
                            )
                          }
                          className="w-24 bg-[hsl(var(--input))]"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveMember(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={handleAddMember}
                      className="w-full mt-3"
                    >
                      + Add Member
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

      {/* Savings list */}
      <div className="px-6 mt-6">
        {savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => (
              <Card
                key={goal.id}
                className="p-4 shadow-soft hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2
                    className="font-bold text-lg cursor-pointer"
                    onClick={() => navigate(`/savings/${goal.id}`)}
                  >
                    {goal.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Cat className="text-primary w-5 h-5" />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSaving(goal.id, goal.title)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-1">
                  RM {goal.currentAmount.toFixed(2)} / RM{" "}
                  {goal.targetAmount.toFixed(2)}
                </p>
                {goal.deadline && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Deadline: {goal.deadline}
                  </p>
                )}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        (goal.currentAmount / goal.targetAmount) * 100
                      }%`,
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center shadow-soft border-none mt-6">
            <Cat className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">
              No savings yet
            </p>
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
