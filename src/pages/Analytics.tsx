import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, PieChart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analytics: React.FC = () => {
  const {
    transactions,
    categories,
    activeWallet,
    analyticsHistory,
    saveAnalytics,
    theme,
  } = useApp();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    const walletTransactions = transactions.filter(
      (t) =>
        t.walletId === activeWallet &&
        new Date(t.date).getFullYear() === currentYear
    );

    const monthlyTotals = Array(12).fill(0);

    walletTransactions.forEach((t) => {
      if (t.type === "expense") {
        monthlyTotals[new Date(t.date).getMonth()] += t.amount;
      }
    });

    setMonthlyData(monthlyTotals);

    // Only save if data changed or not present
    const savedData = analyticsHistory[currentYear];
    const isDifferent =
      !savedData || savedData.some((v, i) => v !== monthlyTotals[i]);
    if (isDifferent) {
      saveAnalytics(currentYear, monthlyTotals);
    }
    // ✅ Removed analyticsHistory from dependencies to prevent loop
  }, [transactions, activeWallet, currentYear, saveAnalytics]);

  const maxExpense = Math.max(...monthlyData, 1);

  // Category breakdown
  const walletExpenses = transactions.filter(
    (t) => t.walletId === activeWallet && t.type === "expense"
  );

  const categoryData = categories
    .map((cat) => {
      const total = walletExpenses
        .filter((t) => t.category === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, total };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const totalExpenses = categoryData.reduce((sum, c) => sum + c.total, 0);

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
              Analytics {currentYear}
            </h1>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1 bg-white/80 text-primary font-medium hover:bg-white hover:text-primary/90 transition"
            onClick={() => navigate("/analytics-history")}
          >
            <Clock className="w-4 h-4" /> History
          </Button>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Monthly Trend */}
        <Card className="p-6 shadow-card border-none">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">12-Month Trend</h2>
          </div>
          <div className="space-y-3">
            {monthlyData.map((amount, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">
                    {monthNames[index]}
                  </span>
                  <span className="font-semibold">${amount.toFixed(2)}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className={`h-full transition-all duration-500 ${
                      theme === "light"
                        ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                        : "bg-gradient-to-r from-green-600 via-green-500 to-green-400"
                    }`}
                    style={{ width: `${(amount / maxExpense) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6 shadow-card border-none">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Spending by Category</h2>
          </div>
          <div className="space-y-4">
            {categoryData.length > 0 ? (
              categoryData.map((category) => {
                const percentage = (
                  (category.total / totalExpenses) *
                  100
                ).toFixed(1);
                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${category.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expense data yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start adding expenses to see analytics
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Analytics;
