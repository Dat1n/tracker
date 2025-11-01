import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HistoryTransactions = () => {
  const { transactions, wallets, activeWallet, theme, deleteTransaction } =
    useApp();
  const navigate = useNavigate();
  const currentWallet = wallets.find((w) => w.id === activeWallet);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [dropdownMonthOpen, setDropdownMonthOpen] = useState(false);
  const [dropdownYearOpen, setDropdownYearOpen] = useState(false);

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

  const transactionYears = Array.from(
    new Set(transactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);

  const walletTransactions = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.walletId === activeWallet &&
        date.getMonth() === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
  };

  // Analytics-style dropdown classes
  const dropdownButtonClass = `flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition backdrop-blur-md ${
    theme === "light"
      ? "bg-white/80 text-primary hover:bg-white/90"
      : "bg-black/80 text-white hover:bg-black/90"
  }`;

  const dropdownItemClass = (selected: boolean) =>
    `w-full text-left px-4 py-2 transition ${
      selected
        ? theme === "light"
          ? "bg-white font-semibold"
          : "bg-gray-700 font-semibold"
        : ""
    } hover:${theme === "light" ? "bg-white/90" : "bg-gray-600"}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Fredoka" }}
            >
              Transaction History
            </h1>
            <p className="text-white/80 mt-1">{currentWallet?.name}</p>
          </div>
        </div>

        {/* Month & Year Filters */}
        <div className="flex gap-2 ml-auto">
          {/* Month Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownMonthOpen(!dropdownMonthOpen)}
              className={dropdownButtonClass}
            >
              {monthNames[selectedMonth]}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  dropdownMonthOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {dropdownMonthOpen && (
              <div
                className={`absolute right-0 mt-2 w-36 rounded-xl shadow-lg overflow-hidden z-10 ${
                  theme === "light"
                    ? "bg-white/80 text-primary"
                    : "bg-black/80 text-white"
                }`}
              >
                {monthNames.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedMonth(idx);
                      setDropdownMonthOpen(false);
                    }}
                    className={dropdownItemClass(idx === selectedMonth)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownYearOpen(!dropdownYearOpen)}
              className={dropdownButtonClass}
            >
              {selectedYear}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  dropdownYearOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {dropdownYearOpen && (
              <div
                className={`absolute right-0 mt-2 w-32 rounded-xl shadow-lg overflow-hidden z-10 ${
                  theme === "light"
                    ? "bg-white/80 text-primary"
                    : "bg-black/80 text-white"
                }`}
              >
                {transactionYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setDropdownYearOpen(false);
                    }}
                    className={dropdownItemClass(year === selectedYear)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-6 mt-6 space-y-4">
        {walletTransactions.length > 0 ? (
          walletTransactions.map((t) => {
            const isIncome = t.type === "income";
            const isExpense = t.type === "expense";
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p
                    className={`font-bold ${
                      isIncome
                        ? "text-green-600"
                        : isExpense
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {amountSign}${t.amount.toFixed(2)}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-100"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
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
