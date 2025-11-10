"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  resNumber?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = ({
    type,
    message,
    resNumber,
    title,
    duration = 5000,
  }: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { id, type, message, title, duration, resNumber };

    setNotifications((prev) => [...prev, newNotification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } =
    useContext(NotificationContext)!;

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 w-96">
      {notifications.map((notification, index) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          index={index}
        />
      ))}
    </div>
  );
};

const NotificationToast: React.FC<{
  notification: Notification;
  onClose: () => void;
  index: number;
}> = ({ notification, onClose, index }) => {
  const { type, title, message, resNumber, duration = 5000 } = notification;
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 50);

    // Progress bar animation
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / 100);
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      colors: "bg-white border-green-200 text-green-800",
      iconColor: "text-green-500",
      progressColor: "bg-green-400",
      shadowColor: "shadow-green-100",
    },
    error: {
      icon: AlertCircle,
      colors: "bg-white  border-red-200 text-red-800",
      iconColor: "text-red-500",
      progressColor: "bg-red-400",
      shadowColor: "shadow-red-100",
    },
    info: {
      icon: Info,
      colors: " bg-white  border-blue-200 text-blue-800",
      iconColor: "text-blue-500",
      progressColor: "bg-blue-400",
      shadowColor: "shadow-blue-100",
    },
    warning: {
      icon: AlertTriangle,
      colors: " bg-yellow-500  border-amber-200 text-amber-800",
      iconColor: "text-amber-500",
      progressColor: "bg-amber-400",
      shadowColor: "shadow-amber-100",
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        ${config.colors} ${config.shadowColor}
        border backdrop-blur-sm rounded-xl relative 
        shadow-lg shadow-black/5
        transition-all duration-500 ease-out
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
        hover:shadow-xl hover:scale-[1.02]
        overflow-hidden
      `}
      style={{
        transform: `translateY(${index * -4}px)`,
        zIndex: 1000 - index,
      }}
      role="alert"
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full">
          <div
            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
            <IconComponent size={20} />
          </div>

          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-semibold text-sm mb-1 leading-tight">
                {title}
              </div>
            )}
            <div className="text-sm leading-relaxed opacity-90">{message}</div>
            {resNumber && (
              <div className="text-xs font-mono mt-2 px-2 py-1 bg-black/5 rounded-md inline-block">
                {resNumber}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 p-1.5 rounded-lg hover:bg-black/10 transition-colors duration-200 group"
            aria-label="Close notification"
          >
            <X size={16} className="opacity-60 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Demo component to test the notifications
