import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

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


// ✅ Member type
export interface SavingsMember {
  uid: string;          // User ID from Firebase
  name: string;         // Full name
  email: string;        // Email of the member
  contribution?: number; // How much this member contributed
}

// ✅ SavingsGoal type
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  members?: SavingsMember[];
  walletId: string;       // Add walletId
  createdAt: string;      // ISO string for creation date
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
  { id: "personal-funds", name: "Personal Funds", icon: "👤", color: "hsl(340 80% 85%)" },
  { id: "parent", name: "Parent", icon: "👪", color: "hsl(340 80% 85%)" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "hsl(340 80% 85%)" },
  { id: "bills", name: "Bills", icon: "📄", color: "hsl(270 60% 88%)" },
  { id: "transport", name: "Transport", icon: "🚗", color: "hsl(200 70% 85%)" },
  { id: "entertainment", name: "Entertainment", icon: "🎮", color: "hsl(280 70% 85%)" },
  { id: "health", name: "Health", icon: "💊", color: "hsl(160 60% 85%)" },
  { id: "income", name: "Income", icon: "💰", color: "hsl(140 55% 80%)" },
  { id: "savings", name: "Savings", icon: "🐱", color: "hsla(44, 85%, 60%, 0.62)" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWallet, setActiveWallet] = useState<string>("personal");
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [analyticsHistory, setAnalyticsHistory] = useState<Record<number, number[]>>({});

  // ✅ Step 1: Auth setup (auto sign-in anonymously if needed)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        const cred = await signInAnonymously(auth);
        setUserId(cred.user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Step 2: Fetch user-specific Firestore data
useEffect(() => {
  if (!userId) return;

  const fetchSavingsGoals = async () => {
    try {
      const goalsSnap = await getDocs(collection(db, "users", userId, "savingsGoals"));
      const allGoals = goalsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as SavingsGoal[];

      // Filter by activeWallet
      const filteredGoals = allGoals.filter((g) => g.walletId === activeWallet);

      setSavingsGoals(filteredGoals);
    } catch (err) {
      console.error("Failed to fetch savings goals", err);
    }
  };

  fetchSavingsGoals();
}, [userId, activeWallet]);


  // ✅ Step 3: CRUD operations (user-specific)
  // ✅ Add Transaction
const addTransaction = async (transaction: Omit<Transaction, "id">) => {
  if (!userId) {
    toast.error("User not authenticated");
    return;
  }

  if (transaction.amount <= 0) {
    toast.error("Amount must be greater than 0");
    return;
  }

  try {
    const txRef = collection(db, "users", userId, "transactions");
    const docRef = await addDoc(txRef, transaction);

    const newTx: Transaction = { id: docRef.id, ...transaction };
    setTransactions((prev) => [newTx, ...prev]);

    // ✅ Update wallet balance locally
    setWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.id === transaction.walletId) {
          const delta =
            transaction.type === "expense"
              ? -transaction.amount
              : transaction.amount;
          return { ...wallet, balance: wallet.balance + delta };
        }
        return wallet;
      })
    );

    toast.success("Transaction added!");
  } catch (err) {
    console.error("❌ addTransaction failed:", err);
    toast.error("Failed to add transaction");
  }
};

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    try {
      await deleteDoc(doc(db, "users", userId, "transactions", id));
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

 // ✅ Add Wallet
const addWallet = async (wallet: Omit<Wallet, "id" | "balance">) => {
  if (!userId) {
    toast.error("User not authenticated");
    return;
  }

  try {
    const walletRef = collection(db, "users", userId, "wallets");
    const docRef = await addDoc(walletRef, { ...wallet, balance: 0 });

    const newWallet: Wallet = { ...wallet, id: docRef.id, balance: 0 };
    setWallets((prev) => [...prev, newWallet]);

    toast.success("Wallet created!");
  } catch (err) {
    console.error("❌ addWallet failed:", err);
    toast.error("Failed to create wallet");
  }
};

const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">): Promise<SavingsGoal> => {
  if (!userId) throw new Error("Not authenticated");
  try {
    const newGoalData = {
      ...goal,
      currentAmount: 0,
      members: goal.members || [],
      walletId: activeWallet,
      createdAt: new Date().toISOString(),
      deadline: goal.deadline || null, // null-safe
    };
    const docRef = await addDoc(collection(db, "users", userId, "savingsGoals"), newGoalData);

    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: docRef.id,
    };

    setSavingsGoals((prev) => [...prev, newGoal]);
    return newGoal;
  } catch (err) {
    console.error(err);
    toast.error("Failed to create savings goal");
    return goal as SavingsGoal;
  }
};


 // ✅ Contribute to Saving
const contributeToSaving = async (
  goalId: string,
  amount: number,
  userName: string
) => {
  if (!userId) {
    toast.error("User not authenticated");
    return;
  }
  if (amount <= 0) {
    toast.error("Contribution must be greater than 0");
    return;
  }

  try {
    const goalRef = doc(db, "users", userId, "savingsGoals", goalId);
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) {
      toast.error("Saving goal not found");
      return;
    }

// Assume you have the current user info
const currentUser = auth.currentUser;
if (!currentUser) {
  toast.error("User not authenticated");
  return;
}

const userUid = currentUser.uid;
const userName = currentUser.displayName || "Anonymous";
const userEmail = currentUser.email || "";

// Update members’ contributions
const members = [...(goal.members || [])];

// Check if the user is already in the members array
const idx = members.findIndex((m) => m.uid === userUid);
if (idx >= 0) {
  members[idx].contribution = (members[idx].contribution || 0) + amount;
} else {
  // Add as a new member
  members.push({
    uid: userUid,
    name: userName,
    email: userEmail,
    contribution: amount,
  });
}

// Calculate total contributions
const totalContributed = members.reduce((sum, m) => sum + (m.contribution || 0), 0);

// Prepare the updated goal
const updatedGoal: SavingsGoal = {
  ...goal,
  members,
  currentAmount: Math.min(totalContributed, goal.targetAmount),
};

// Save updated goal in Firestore
await updateDoc(goalRef, {
  members: updatedGoal.members,
  currentAmount: updatedGoal.currentAmount,
});

toast.success(`Added $${amount} to ${goal.title}!`);



    // Record contribution as transaction
    await addTransaction({
      type: "savings",
      amount,
      category: "savings",
      title: `Saved to ${goal.title}`,
      note: `Contributor: ${userName}`,
      date: new Date().toISOString(),
      walletId: activeWallet,
    });

    toast.success(`Added $${amount} to ${goal.title}!`);
  } catch (err) {
    console.error("❌ contributeToSaving failed:", err);
    toast.error("Failed to contribute to savings");
  }
};

  const deleteSavingsGoal = async (id: string) => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to delete this saving goal?")) return;
    try {
      await deleteDoc(doc(db, "users", userId, "savingsGoals", id));
      setSavingsGoals((prev) => prev.filter((goal) => goal.id !== id));
      setTransactions((prev) => prev.filter((t) => t.type !== "savings" || !t.title?.includes(id)));
      toast.success("Saving goal deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete savings goal");
    }
  };

  const saveAnalytics = async (year: number, monthlyExpenses: number[]) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, "users", userId, "analyticsHistory", year.toString()), {
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
