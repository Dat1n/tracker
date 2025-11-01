import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AnalyticsHistory: React.FC = () => {
  const { analyticsHistory } = useApp(); // full context
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

  const years = Object.keys(analyticsHistory)
    .map(Number)
    .sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number | null>(
    years[0] || null
  );

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  const filteredYears = selectedYear ? [selectedYear] : years;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 rounded-b-[2rem] shadow-card">
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

        {/* Year filter */}
        {years.length > 1 && (
          <div className="mt-4">
            <select
              className="p-2 rounded-md border border-gray-300"
              value={selectedYear ?? ""}
              onChange={handleYearChange}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="px-6 mt-6 space-y-6">
        {filteredYears.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No analytics history available
            </p>
          </div>
        )}

        {filteredYears.map((year) => {
          const monthlyData: number[] =
            analyticsHistory[year] || Array(12).fill(0);
          const maxExpense = Math.max(...monthlyData, 1);

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
                      <span className="font-semibold">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 bg-green-500 dark:bg-green-400"
                        style={{ width: `${(amount / maxExpense) * 100}%` }}
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
