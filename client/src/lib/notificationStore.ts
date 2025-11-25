// Simple notification store for block discoveries and achievements
type NotificationType = "block_found" | "milestone" | "risk_alert";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: string;
};

class NotificationStore {
  private notifications: Notification[] = [];
  private listeners = new Set<(notifications: Notification[]) => void>();

  addNotification(
    type: NotificationType,
    title: string,
    message: string,
    icon?: string
  ): Notification {
    const notification: Notification = {
      id: Math.random().toString(36).slice(2),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      icon,
    };

    this.notifications = [notification, ...this.notifications.slice(0, 49)]; // Keep last 50
    this.notify();

    // Auto-dismiss after 8 seconds for non-critical notifications
    if (type !== "risk_alert") {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 8000);
    }

    return notification;
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  markAsRead(id: string): void {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notify();
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach((callback) => callback(this.getNotifications()));
  }
}

export const notificationStore = new NotificationStore();
