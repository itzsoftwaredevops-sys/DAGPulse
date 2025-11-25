import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    isPositive: boolean;
  };
  unit?: string;
  decimals?: number;
}

export function StatBox({ label, value, icon: Icon, change, unit, decimals = 0 }: StatBoxProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timeout);
  }, [value]);

  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      return val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return val;
  };

  return (
    <Card className="group relative overflow-hidden p-6 transition-all hover:scale-105" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="absolute right-4 top-4 rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={`font-['Space_Grotesk'] text-3xl font-bold text-foreground transition-opacity ${
              isAnimating ? "animate-pulse-glow" : ""
            }`}
            data-testid={`value-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {formatValue(value)}
            {unit && <span className="ml-1 text-xl text-muted-foreground">{unit}</span>}
          </p>
        </div>

        {change && (
          <div className="flex items-center gap-1 text-xs">
            <span
              className={`font-medium ${
                change.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {change.isPositive ? "+" : ""}
              {change.value.toFixed(2)}%
            </span>
            <span className="text-muted-foreground">from last hour</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  );
}
