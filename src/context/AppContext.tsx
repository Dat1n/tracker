import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: "expense" | "income" | "savings";
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
  type: "personal" | "shared";
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

export interface AppContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  activeWallet: string;
  savingsGoals: SavingsGoal[];
  categories: Category[];
  theme: "light" | "dark";
  analyticsHistory: Record<number, number[]>;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  addWallet: (wallet: Omit<Wallet, "id" | "balance">) => Promise<void>;
  setActiveWallet: (walletId: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => Promise<SavingsGoal>;
  contributeToSaving: (
    goalId: string,
    amount: number,
    user: string
  ) => Promise<void>;
  toggleTheme: () => void;
  deleteTransaction: (id: string) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  saveAnalytics: (year: number, monthlyExpenses: number[]) => Promise<void>;
}

const defaultCategories: Category[] = [
  { id: "food", name: "Food", icon: "🍔", color: "hsl(30 85% 82%)" },
  { id: "saving", name: "Saving", icon: "💰", color: "hsl(340 80% 85%)" },
  {
    id: "personal-funds",
    name: "Personal Funds",
    icon: "👤",
    color: "hsl(340 80% 85%)",
  },
  { id: "parent", name: "Parent", icon: "👪", color: "hsl(340 80% 85%)" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "hsl(340 80% 85%)" },
  { id: "bills", name: "Bills", icon: "📄", color: "hsl(270 60% 88%)" },
  { id: "transport", name: "Transport", icon: "🚗", color: "hsl(200 70% 85%)" },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "🎮",
    color: "hsl(280 70% 85%)",
  },
  { id: "health", name: "Health", icon: "💊", color: "hsl(160 60% 85%)" },
  { id: "income", name: "Income", icon: "💰", color: "hsl(140 55% 80%)" },
  {
    id: "savings",
    name: "Savings",
    icon: "🐱",
    color: "hsla(44, 85%, 60%, 0.62)",
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWallet, setActiveWallet] = useState<string>("personal");
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [analyticsHistory, setAnalyticsHistory] = useState<
    Record<number, number[]>
  >({});

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const txSnap = await getDocs(collection(db, "transactions"));
        setTransactions(
          txSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[]
        );

        const walletsSnap = await getDocs(collection(db, "wallets"));
        setWallets(
          walletsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Wallet[]
        );

        const goalsSnap = await getDocs(collection(db, "savingsGoals"));
        setSavingsGoals(
          goalsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SavingsGoal[]
        );

        const analyticsSnap = await getDocs(collection(db, "analyticsHistory"));
        const analytics: Record<number, number[]> = {};
        analyticsSnap.docs.forEach((doc) => {
          analytics[Number(doc.id)] = doc.data().monthlyExpenses;
        });
        setAnalyticsHistory(analytics);
      } catch (err) {
        console.error("Failed to fetch data from Firestore", err);
      }
    };

    fetchData();

    // Detect system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = (isDark: boolean) => {
      setTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    };
    updateTheme(mediaQuery.matches);
    mediaQuery.addEventListener("change", (e) => updateTheme(e.matches));
    return () =>
      mediaQuery.removeEventListener("change", (e) => updateTheme(e.matches));
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (transaction.amount <= 0) {
      toast.error("Amount must be positive");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "transactions"), transaction);
      const newTx: Transaction = { ...transaction, id: docRef.id };
      setTransactions((prev) => [newTx, ...prev]);

      setWallets((prev) =>
        prev.map((wallet) =>
          wallet.id === transaction.walletId
            ? {
                ...wallet,
                balance:
                  wallet.balance +
                  (transaction.type === "expense"
                    ? -transaction.amount
                    : transaction.amount),
              }
            : wallet
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to save transaction");
    }
  };

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setWallets((prev) =>
        prev.map((wallet) =>
          wallet.id === transaction.walletId
            ? {
                ...wallet,
                balance:
                  wallet.balance +
                  (transaction.type === "expense"
                    ? transaction.amount
                    : -transaction.amount),
              }
            : wallet
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transaction");
    }
  };

  const addWallet = async (wallet: Omit<Wallet, "id" | "balance">) => {
    try {
      const docRef = await addDoc(collection(db, "wallets"), {
        ...wallet,
        balance: 0,
      });
      setWallets((prev) => [...prev, { ...wallet, id: docRef.id, balance: 0 }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create wallet");
    }
  };

  const addSavingsGoal = async (
    goal: Omit<SavingsGoal, "id">
  ): Promise<SavingsGoal> => {
    try {
      const docRef = await addDoc(collection(db, "savingsGoals"), {
        ...goal,
        currentAmount: 0,
        members: goal.members || [],
      });
      const newGoal = {
        ...goal,
        id: docRef.id,
        currentAmount: 0,
        members: goal.members || [],
      };
      setSavingsGoals((prev) => [...prev, newGoal]);
      return newGoal;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create savings goal");
      return goal as SavingsGoal;
    }
  };

  const contributeToSaving = async (
    goalId: string,
    amount: number,
    user: string
  ) => {
    if (amount <= 0) {
      toast.error("Contribution must be greater than zero");
      return;
    }

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const members = [...(goal.members || [])];
    const idx = members.findIndex((m) => m.name === user);

    if (idx >= 0) {
      members[idx].contribution = (members[idx].contribution || 0) + amount;
    } else {
      members.push({ name: user, contribution: amount });
    }

    const total = members.reduce((sum, m) => sum + (m.contribution || 0), 0);
    const updatedGoal = {
      ...goal,
      members,
      currentAmount: Math.min(total, goal.targetAmount),
    };

    try {
      // Update goal in Firestore
      await updateDoc(doc(db, "savingsGoals", goalId), updatedGoal);

      // Update local state
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === goalId ? updatedGoal : g))
      );

      // Add transaction separately after state update
      await addTransaction({
        type: "savings",
        amount,
        category: "savings",
        title: `Saved to ${goal.title}`,
        note: `Contributor: ${user}`,
        date: new Date().toISOString(),
        walletId: activeWallet,
      });

      toast.success(`Added $${amount} to ${goal.title} by ${user}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to contribute to savings");
    }
  };
  const deleteSavingsGoal = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this saving goal?"))
      return;
    try {
      await deleteDoc(doc(db, "savingsGoals", id));
      setSavingsGoals((prev) => prev.filter((goal) => goal.id !== id));
      setTransactions((prev) =>
        prev.filter((t) => t.type !== "savings" || !t.title?.includes(id))
      );
      toast.success("Saving goal deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete savings goal");
    }
  };

  const saveAnalytics = async (year: number, monthlyExpenses: number[]) => {
    try {
      await setDoc(doc(db, "analyticsHistory", year.toString()), {
        monthlyExpenses,
      });
      setAnalyticsHistory((prev) => ({ ...prev, [year]: monthlyExpenses }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to save analytics");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
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
        analyticsHistory,
        addTransaction,
        addWallet,
        setActiveWallet,
        addSavingsGoal,
        contributeToSaving,
        toggleTheme,
        deleteTransaction,
        deleteSavingsGoal,
        saveAnalytics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
