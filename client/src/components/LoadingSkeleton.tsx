import { Card } from "@/components/ui/card";

interface LoadingSkeletonProps {
  type?: "stat" | "card" | "chart";
  count?: number;
}

export function LoadingSkeleton({ type = "card", count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "stat":
        return (
          <Card className="relative overflow-hidden p-6">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded bg-muted/50" />
              <div className="h-8 w-32 rounded bg-muted/50" />
              <div className="h-2 w-20 rounded bg-muted/50" />
            </div>
            <div className="absolute inset-0 -translate-x-full">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          </Card>
        );

      case "chart":
        return (
          <Card className="relative overflow-hidden p-6">
            <div className="space-y-4">
              <div className="h-4 w-32 rounded bg-muted/50" />
              <div className="h-64 w-full rounded bg-muted/50" />
            </div>
            <div className="absolute inset-0 -translate-x-full">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          </Card>
        );

      default:
        return (
          <Card className="relative overflow-hidden p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted/50" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 rounded bg-muted/50" />
                  <div className="h-3 w-24 rounded bg-muted/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-muted/50" />
                  <div className="h-5 w-20 rounded bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-muted/50" />
                  <div className="h-5 w-20 rounded bg-muted/50" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 -translate-x-full">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          </Card>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} data-testid={`skeleton-${type}-${i}`}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}
