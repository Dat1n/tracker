import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AnalyticsHistory: React.FC = () => {
  const { transactions, activeWallet, theme } = useApp();
  const navigate = useNavigate();

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

  const walletTransactions = transactions.filter(
    (t) => t.walletId === activeWallet
  );

  const years = Array.from(
    new Set(walletTransactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number | "all">(
    years[0] || "all"
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleYearSelect = (year: number | "all") => {
    setSelectedYear(year);
    setDropdownOpen(false);
  };

  const filteredYears =
    selectedYear === "all" ? years : [selectedYear as number];

  const getMonthlyTotals = (year: number) => {
    const monthlyTotals = Array(12).fill(0);
    walletTransactions.forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        const amount = t.type === "income" ? t.amount : -t.amount;
        monthlyTotals[month] += amount;
      }
    });
    return monthlyTotals;
  };

  // Classes matching HistoryTransactions dropdown
  const dropdownButtonClass = `flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition backdrop-blur-md font-medium ${
    theme === "light"
      ? "bg-white/20 text-black hover:bg-white/30"
      : "bg-black/30 text-white hover:bg-black/50"
  }`;

  const dropdownItemClass = (selected: boolean) =>
    `w-full text-left px-4 py-2 text-sm transition ${
      selected
        ? theme === "light"
          ? "bg-gray-200 font-semibold"
          : "bg-gray-700 font-semibold"
        : ""
    } hover:${theme === "light" ? "bg-gray-100" : "bg-gray-600"}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Fredoka" }}
            >
              Analytics History
            </h1>
          </div>

          {/* Year Dropdown */}
          {years.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={dropdownButtonClass}
              >
                {selectedYear === "all" ? "All Years" : selectedYear}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {dropdownOpen && (
                <div
                  className={`absolute mt-2 right-0 w-40 rounded-xl shadow-lg overflow-hidden z-10 ${
                    theme === "light"
                      ? "bg-white/80 text-black"
                      : "bg-black/80 text-white"
                  }`}
                >
                  <button
                    onClick={() => handleYearSelect("all")}
                    className={dropdownItemClass(selectedYear === "all")}
                  >
                    All Years
                  </button>
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={dropdownItemClass(selectedYear === year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Cards */}
      <div className="px-6 mt-6 space-y-6">
        {filteredYears.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No analytics history available
            </p>
          </div>
        )}

        {filteredYears.map((year) => {
          const monthlyData = getMonthlyTotals(year);
          const maxExpense = Math.max(
            ...monthlyData.map((v) => Math.abs(v)),
            1
          );

          return (
            <Card key={year} className="p-6 shadow-card border-none">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {year} - 12 Month Trend
                </h2>
              </div>
              <div className="space-y-3">
                {monthlyData.map((amount, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {monthNames[index]}
                      </span>
                      <span
                        className={`font-semibold ${
                          theme === "light" ? "text-black" : "text-white"
                        }`}
                      >
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          amount >= 0
                            ? "bg-green-500 dark:bg-green-400"
                            : "bg-red-500 dark:bg-red-400"
                        }`}
                        style={{
                          width: `${(Math.abs(amount) / maxExpense) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default AnalyticsHistory;
