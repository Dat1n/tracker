import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'savings';
  amount: number;
  category: string;
  title?: string;
  note?: string;
  date: string;
  walletId: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'personal' | 'shared';
  members?: string[];
  balance: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  members?: { name: string; contribution?: number }[];
}

interface AppContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  activeWallet: string;
  savingsGoals: SavingsGoal[];
  categories: Category[];
  theme: 'light' | 'dark';
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addWallet: (wallet: Omit<Wallet, 'id' | 'balance'>) => void;
  setActiveWallet: (walletId: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  contributeToSaving: (goalId: string, amount: number, user: string) => void;
  toggleTheme: () => void;
  deleteTransaction: (id: string) => void;
  deleteSavingsGoal: (id: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'food', name: 'Food', icon: '🍔', color: 'hsl(30 85% 82%)' },
  { id: 'saving', name: 'Saving', icon: '💰', color: 'hsl(340 80% 85%)' },
  { id: 'personal-funds', name: 'Personal Funds', icon: '👤', color: 'hsl(340 80% 85%)' },
  { id: 'parent', name: 'Parent', icon: '👪', color: 'hsl(340 80% 85%)' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'hsl(340 80% 85%)' },
  { id: 'bills', name: 'Bills', icon: '📄', color: 'hsl(270 60% 88%)' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'hsl(200 70% 85%)' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: 'hsl(280 70% 85%)' },
  { id: 'health', name: 'Health', icon: '💊', color: 'hsl(160 60% 85%)' },
  { id: 'income', name: 'Income', icon: '💰', color: 'hsl(140 55% 80%)' },
  { id: 'savings', name: 'Savings', icon: '🐷', color: 'hsl(340 80% 85%)' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'personal', name: 'My Wallet', type: 'personal', balance: 0 },
  ]);
  const [activeWallet, setActiveWallet] = useState('personal');
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedWallets = localStorage.getItem('wallets');
    const savedGoals = localStorage.getItem('savingsGoals');
    const savedTheme = localStorage.getItem('theme');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedWallets) setWallets(JSON.parse(savedWallets));
    if (savedGoals) setSavingsGoals(JSON.parse(savedGoals));
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('wallets', JSON.stringify(wallets)), [wallets]);
  useEffect(() => localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals)), [savingsGoals]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);

    setWallets(prev =>
      prev.map(wallet => {
        if (wallet.id === transaction.walletId) {
          const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
          return { ...wallet, balance: wallet.balance + amount };
        }
        return wallet;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    setWallets(prev =>
      prev.map(wallet => {
        if (wallet.id === transaction.walletId) {
          const amount = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
          return { ...wallet, balance: wallet.balance + amount };
        }
        return wallet;
      })
    );
  };

  const deleteSavingsGoal = (id: string) => {
  if (!window.confirm('Are you sure you want to delete this saving goal?')) return;

  setSavingsGoals(prev => prev.filter(goal => goal.id !== id));

  // Optionally, remove related savings transactions
  setTransactions(prev => prev.filter(t => t.type !== 'savings' || t.title?.indexOf(id) === -1));

  toast.success('Saving goal deleted!');
};



  const addWallet = (wallet: Omit<Wallet, 'id' | 'balance'>) => {
    const newWallet = { ...wallet, id: Date.now().toString(), balance: 0 };
    setWallets(prev => [...prev, newWallet]);
  };

 const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>): SavingsGoal => {
  const newGoal: SavingsGoal = {
    ...goal,
    id: Date.now().toString(),
    currentAmount: 0,
    members: goal.members || [],
  };
  setSavingsGoals(prev => [...prev, newGoal]);
  return newGoal; // return the created goal so you can navigate
};


 const contributeToSaving = (goalId: string, amount: number, user: string) => {
  setSavingsGoals(prev =>
    prev.map(goal => {
      if (goal.id !== goalId) return goal;

      const members = goal.members ? [...goal.members] : [];
      const memberIndex = members.findIndex(m => m.name === user);

      if (memberIndex >= 0) {
        members[memberIndex].contribution = (members[memberIndex].contribution || 0) + amount;
      } else {
        members.push({ name: user, contribution: amount });
      }

      const totalContribution = members.reduce((sum, m) => sum + (m.contribution || 0), 0);

      return {
        ...goal,
        members,
        currentAmount: Math.min(totalContribution, goal.targetAmount),
      };
    })
  );

  // Record the transaction
  const goal = savingsGoals.find(g => g.id === goalId);
  const newTransaction: Transaction = {
    id: Date.now().toString(),
    type: 'savings',
    amount,
    category: 'savings',
    title: `Saved to ${goal?.title || 'Saving'}`,
    note: `Contributor: ${user}`,
    date: new Date().toISOString(),
    walletId: activeWallet,
  };
  setTransactions(prev => [newTransaction, ...prev]);

  toast.success(`Added $${amount} to ${goal?.title || 'Saving'} by ${user}!`);
};


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        wallets,
        activeWallet,
        savingsGoals,
        categories: defaultCategories,
        theme,
        addTransaction,
        addWallet,
        setActiveWallet,
        addSavingsGoal,
        contributeToSaving,
        toggleTheme,
        deleteTransaction,
        deleteSavingsGoal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

