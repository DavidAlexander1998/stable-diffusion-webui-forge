import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import type { Notification as NotificationType } from "../hooks/useNotifications";
import "./Notification.css";

interface NotificationContainerProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function NotificationContainer({
  notifications,
  onDismiss,
}: NotificationContainerProps) {
  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type];

          return (
            <motion.div
              key={notification.id}
              className={`notification notification-${notification.type}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notification-icon">
                <Icon size={20} />
              </div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                {notification.message && (
                  <div className="notification-message">
                    {notification.message}
                  </div>
                )}
              </div>

              {notification.dismissible && (
                <button
                  className="notification-dismiss"
                  onClick={() => onDismiss(notification.id)}
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
