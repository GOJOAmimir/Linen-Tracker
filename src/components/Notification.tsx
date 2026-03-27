import { useState, useRef, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";

export type NotificationType = {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  icon?: string;
  onClick?: () => void;
};

interface NotificationProps {
  notifications: NotificationType[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll?: () => void;
}

export default function Notification({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";

    return "Baru saja";
  };

  const getNotificationIcon = (notification: NotificationType) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const handleNotificationClick = (notification: NotificationType) => {
    // Mark as read
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Execute custom action if provided
    if (notification.onClick) {
      notification.onClick();
      setIsOpen(false); // Close dropdown after navigation
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
        aria-label="Notifications"
      >
        <span className="sr-only">View notifications</span>
        {unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6" aria-hidden="true" />
        ) : (
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          className="
          fixed inset-x-2 top-16
          sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2
          w-auto sm:w-96
          max-h-[calc(100vh-5rem)]
          rounded-lg bg-white dark:bg-[#282828]
          shadow-xl border border-gray-200 dark:border-gray-700
          z-50 overflow-hidden
        "
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-[#282828] border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
              >
                Tandai semua
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[60vh] sm:max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <BellIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada notifikasi
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                    px-4 py-3 cursor-pointer transition-colors
                    ${
                      !notification.isRead
                        ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }
                  `}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <span className="text-xl sm:text-2xl">
                          {getNotificationIcon(notification)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                !notification.isRead
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {getTimeAgo(notification.timestamp)}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && onClearAll && (
            <div className="sticky bottom-0 bg-white dark:bg-[#282828] border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                className="w-full text-center text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition py-1"
              >
                Hapus semua notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
