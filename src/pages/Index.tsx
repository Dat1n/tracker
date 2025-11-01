import React from "react";
import { useApp } from "@/context/AppContext";
import StatsCard from "@/components/StatsCard";
import TransactionCard from "@/components/TransactionCard";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, TrendingDown, Cat, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const {
    transactions,
    wallets,
    activeWallet,
    savingsGoals,
    theme,
    toggleTheme,
  } = useApp();

  const currentWallet = wallets.find((w) => w.id === activeWallet);

  // Last 5 transactions
  const walletTransactions = transactions
    .filter((t) => t.walletId === activeWallet)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // All-time stats
  const allTimeTransactions = transactions.filter(
    (t) => t.walletId === activeWallet
  );
  const allTimeIncome = allTimeTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const allTimeExpenses = allTimeTransactions
    .filter((t) => t.type === "expense" || t.type === "savings")
    .reduce((sum, t) => sum + t.amount, 0);
  const allTimeBalance = allTimeIncome - allTimeExpenses;

  // Determine current month/year from the latest transaction
  const latestTx = allTimeTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  const currentMonth = latestTx
    ? new Date(latestTx.date).getMonth()
    : new Date().getMonth();
  const currentYear = latestTx
    ? new Date(latestTx.date).getFullYear()
    : new Date().getFullYear();

  // Current month stats based on latest transaction month
  const currentMonthTransactions = allTimeTransactions.filter((t) => {
    const txDate = new Date(t.date);
    return (
      t.walletId === activeWallet &&
      txDate.getMonth() === currentMonth &&
      txDate.getFullYear() === currentYear
    );
  });

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = currentMonthTransactions
    .filter((t) => t.type === "savings")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthBalance =
    monthlyIncome - (monthlyExpenses + monthlySavings);

  const totalSavings = savingsGoals.reduce(
    (sum, g) => sum + g.currentAmount,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "Fredoka" }}
            >
              Track or Be Poor 💸
            </h1>
            <p className="text-white/80 mt-1">
              Your financial journey starts here
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/20"
          >
            {theme === "light" ? (
              <Moon className="w-6 h-6" />
            ) : (
              <Sun className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Current Wallet Balance */}
        <Card className="p-6 bg-white/95 backdrop-blur border-none shadow-glow">
          <p className="text-sm text-muted-foreground mb-2">
            Current Balance (All-Time)
          </p>
          <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-black">
            ${allTimeBalance.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentWallet?.name || "1 day or day 1 - you decide."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Current Month Net: ${currentMonthBalance.toFixed(2)}
          </p>
        </Card>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Monthly Income"
            value={`$${monthlyIncome.toFixed(2)}`}
            icon={TrendingUp}
            gradient="success"
            subText={`All-Time Income: $${allTimeIncome.toFixed(2)}`}
            className="bg-[hsl(var(--card))] text-[hsl(var(--stats-foreground))] shadow-card"
          />
          <StatsCard
            title="Monthly Expenses"
            value={`$${monthlyExpenses.toFixed(2)}`}
            icon={TrendingDown}
            gradient="warm"
            subText={`All-Time Expenses: $${allTimeExpenses.toFixed(2)}`}
            className="bg-[hsl(var(--card))] text-[hsl(var(--stats-foreground))] shadow-card"
          />
          <StatsCard
            title="Total Savings"
            value={`$${totalSavings.toFixed(2)}`}
            icon={Cat}
            gradient="primary"
            className="bg-[hsl(var(--card))] text-[hsl(var(--stats-foreground))] shadow-card"
          />
        </div>

        {/* Savings Goals */}
        {savingsGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Savings Goals</h2>
            <div className="space-y-3">
              {savingsGoals.map((goal) => (
                <Card key={goal.id} className="p-4 shadow-soft border-none">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${goal.currentAmount.toFixed(2)} / $
                      {goal.targetAmount.toFixed(2)}
                    </p>
                  </div>
                  <Progress
                    value={(goal.currentAmount / goal.targetAmount) * 100}
                    className="h-3 [&>div]:bg-green-500"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <div className="flex gap-2">
              <Link to="/add">
                <Button
                  size="sm"
                  className="rounded-full border border-black bg-white text-black hover:bg-gray-100 hover:shadow-sm transition"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </Link>
              <Link to="/history">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border border-black bg-white text-black hover:bg-gray-100 hover:shadow-sm transition"
                >
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {walletTransactions.length > 0 ? (
              walletTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            ) : (
              <Card className="p-8 text-center shadow-soft border-none">
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start tracking your expenses and savings!
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
