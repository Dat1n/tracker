import React from 'react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { transactions, categories, activeWallet } = useApp();
  const navigate = useNavigate();

  // Filter transactions by active wallet
  const walletTransactions = transactions.filter((t) => t.walletId === activeWallet);

  // Calculate category breakdown
  const categoryData = categories
    .map((category) => {
      const total = walletTransactions
        .filter((t) => t.category === category.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...category, total };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const totalExpenses = categoryData.reduce((sum, c) => sum + c.total, 0);

  // Calculate monthly trend
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      expenses: walletTransactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            new Date(t.date).getMonth() === date.getMonth() &&
            new Date(t.date).getFullYear() === date.getFullYear()
        )
        .reduce((sum, t) => sum + t.amount, 0),
    };
  }).reverse();

  const maxExpense = Math.max(...last6Months.map((m) => m.expenses), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
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
            Analytics
          </h1>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Monthly Trend */}
        <Card className="p-6 shadow-card border-none">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">6-Month Trend</h2>
          </div>
          <div className="space-y-3">
            {last6Months.map((month, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{month.month}</span>
                  <span className="font-semibold">${month.expenses.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${(month.expenses / maxExpense) * 100}%` }}
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
            {categoryData.map((category) => {
              const percentage = ((category.total / totalExpenses) * 100).toFixed(1);
              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${category.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{percentage}%</p>
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
            })}
            {categoryData.length === 0 && (
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
