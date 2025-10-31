import React from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: "primary" | "success" | "warm";
  className?: string; // optional override
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  gradient = "primary",
  className = "",
}) => {
  const gradientClasses = {
    primary: "bg-gradient-primary",
    success: "bg-gradient-success",
    warm: "bg-gradient-warm",
  };

  return (
    <Card
      className={`p-6 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] border-none bg-[hsl(var(--card))] text-[hsl(var(--stats-foreground))] ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[hsl(var(--stats-foreground))] mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-[hsl(var(--stats-foreground))]">
            {value}
          </p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive
                  ? "text-[hsl(var(--success-foreground))]"
                  : "text-[hsl(var(--destructive-foreground))]"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${gradientClasses[gradient]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
