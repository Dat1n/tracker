import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HistoryTransactions = () => {
  const { transactions, wallets, activeWallet } = useApp();
  const navigate = useNavigate();
  const currentWallet = wallets.find((w) => w.id === activeWallet);

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const walletTransactions = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return t.walletId === activeWallet && date.getMonth() === selectedMonth;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card flex flex-col md:flex-row md:items-center gap-4">
        {/* Left: Back button + title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Fredoka" }}>
              Transaction History
            </h1>
            <p className="text-white/80 mt-1">{currentWallet?.name}</p>
          </div>
        </div>

        {/* Right: Modern Month Filter */}
        <div className="relative ml-auto">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-sm hover:bg-white/30 transition"
          >
            {monthNames[selectedMonth]}
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden z-10">
              {monthNames.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMonth(idx);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                    idx === selectedMonth ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-6 mt-6 space-y-4">
        {walletTransactions.length > 0 ? (
          walletTransactions.map((t) => {
            const isIncome = t.type === "income";
            const isExpense = t.type === "expense";
            const isSavings = t.type === "savings";
            const amountSign = isIncome ? "+" : isExpense ? "-" : "";

            return (
              <Card
                key={t.id}
                className="p-4 flex justify-between items-center shadow-soft border-none"
              >
                <div>
                  <p className="font-semibold">{t.title || t.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(t.date).toLocaleDateString()}
                  </p>
                  {t.note && (
                    <p className="text-xs text-muted-foreground mt-1">{t.note}</p>
                  )}
                </div>
                <p
                  className={`font-bold ${
                    isIncome ? "text-green-600" : isExpense ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {amountSign}${t.amount.toFixed(2)}
                </p>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center shadow-soft border-none">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking your money in and out!
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HistoryTransactions;
