import { useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

let notificationId = 0;
const DEFAULT_DURATION = 5000;

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">): string => {
      const id = `notification-${++notificationId}`;
      const newNotification: Notification = {
        id,
        duration: DEFAULT_DURATION,
        dismissible: true,
        ...notification,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-dismiss after duration
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },
    [removeNotification],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper functions for common notification types
  const success = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "success", title, message }),
    [addNotification],
  );

  const error = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "error", title, message, duration: 8000 }),
    [addNotification],
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "warning", title, message }),
    [addNotification],
  );

  const info = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "info", title, message }),
    [addNotification],
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}
