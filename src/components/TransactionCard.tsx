import React from "react";
import { Card } from "@/components/ui/card";
import { Transaction, useApp } from "@/context/AppContext";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const { categories, deleteTransaction } = useApp();
  const category = categories.find((c) => c.id === transaction.category);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isExpense = transaction.type === "expense";

  return (
    <Card className="p-4 shadow-soft hover:shadow-card transition-all duration-300 border-none group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: category?.color }}
          >
            {category?.icon}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {transaction.title || category?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(transaction.date)}
            </p>
            {transaction.note && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {transaction.note}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p
            className={`text-xl font-bold ${
              isExpense ? "text-destructive" : "text-success"
            }`}
          >
            {isExpense ? "-" : "+"}${transaction.amount.toFixed(2)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTransaction(transaction.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;
