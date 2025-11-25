import { useEffect, useState } from "react";
import { Bell, X, AlertTriangle, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationStore, type Notification } from "@/lib/notificationStore";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe(setNotifications);
    setNotifications(notificationStore.getNotifications());
    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "block_found":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "milestone":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "risk_alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowPanel(!showPanel)}
        data-testid="button-notifications"
        className="rounded-lg relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {showPanel && (
        <div className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg z-50">
          <div className="sticky top-0 border-b border-border/50 bg-card/95 p-4">
            <h2 className="font-semibold">Notifications ({unreadCount} unread)</h2>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-accent/50 transition-colors ${
                    !notif.read ? "bg-primary/5" : ""
                  }`}
                  data-testid={`notification-${notif.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(notif.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-2">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => notificationStore.removeNotification(notif.id)}
                      className="h-6 w-6"
                      data-testid={`button-remove-notification-${notif.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
