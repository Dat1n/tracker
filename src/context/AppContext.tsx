import React, { createContext, useContext, useState, useEffect } from 'react';

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
  toggleTheme: () => void;
  deleteTransaction: (id: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'food', name: 'Food', icon: '🍔', color: 'hsl(30 85% 82%)' },
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
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    // Update wallet balance
    setWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.id === transaction.walletId) {
          const amount =
            transaction.type === 'expense'
              ? -transaction.amount
              : transaction.amount;
          return { ...wallet, balance: wallet.balance + amount };
        }
        return wallet;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      
      // Revert wallet balance
      setWallets((prev) =>
        prev.map((wallet) => {
          if (wallet.id === transaction.walletId) {
            const amount =
              transaction.type === 'expense'
                ? transaction.amount
                : -transaction.amount;
            return { ...wallet, balance: wallet.balance + amount };
          }
          return wallet;
        })
      );
    }
  };

  const addWallet = (wallet: Omit<Wallet, 'id' | 'balance'>) => {
    const newWallet = {
      ...wallet,
      id: Date.now().toString(),
      balance: 0,
    };
    setWallets((prev) => [...prev, newWallet]);
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
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
        toggleTheme,
        deleteTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
