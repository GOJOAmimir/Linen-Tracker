import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BsChevronDoubleLeft, BsChevronDoubleRight } from "react-icons/bs";
import { useTheme } from "../context/ThemeContext";
import {
  Disclosure,
  DisclosureButton,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Notification from "./Notification";
import type { NotificationType } from "./Notification";

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Dummy notification data
const INITIAL_NOTIFICATIONS: NotificationType[] = [
  {
    id: "1",
    type: "error",
    title: "Linen Kritis - Melebihi Max Cycle",
    message: "EPC002 (Pillow Case) telah mencapai 151 dari 200 max cycle",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    isRead: false,
    icon: "🔴",
  },
  {
    id: "2",
    type: "warning",
    title: "Linen Mendekati Batas",
    message:
      "E245245AD21341255 (Table Cloth) telah mencapai 85 dari 120 max cycle",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    icon: "⚠️",
  },
  {
    id: "3",
    type: "info",
    title: "Batch Belum Diproses",
    message: "Batch pukul 12:00 masih menunggu untuk diproses",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    isRead: false,
    icon: "📦",
  },
  {
    id: "4",
    type: "info",
    title: "Linen Belum Kembali",
    message: "3 linen belum dikembalikan dari rumah sakit sejak 2 hari lalu",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    icon: "🔄",
  },
  {
    id: "5",
    type: "success",
    title: "Batch Selesai",
    message: "Batch #45 telah selesai diproses dengan 120 item",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
    icon: "✅",
  },
];

export default function Navbar({ toggleSidebar, sidebarOpen }: NavbarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Notification state
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Initialize notifications with navigation handlers
  useEffect(() => {
    const notificationsWithNav = INITIAL_NOTIFICATIONS.map((notif) => {
      // Add onClick handler for linen-related notifications
      if (notif.id === "1") {
        return {
          ...notif,
          onClick: () => {
            navigate("/master-linen?search=EPC002");
          },
        };
      } else if (notif.id === "2") {
        return {
          ...notif,
          onClick: () => {
            navigate("/master-linen?search=E245245AD21341255");
          },
        };
      }
      return notif;
    });
    setNotifications(notificationsWithNav);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <Disclosure
      as="nav"
      className="
    relative
    bg-emerald-400
    text-gray-800
    border-b border-[#3D3A3A]

    dark:bg-[#242222]
    dark:text-white
    dark:border-emerald-400

    after:pointer-events-none
    after:absolute
    after:inset-x-0
    after:bottom-0
    after:h-px
    after:bg-[#3D3A3A]
    dark:after:bg-white/10
  "
    >
      <div className="mx-auto px-2 sm:px-6 lg:px-8 border-b-2 border-[#24D6AD]">
        <div className="relative flex h-16 items-center justify-between">
          {/* LEFT: start */}
          <div className="flex-1 flex items-center justify-start gap-3">
            <div className="sm:hidden">
              <DisclosureButton
                as="button"
                onClick={() => toggleSidebar()}
                className="
                           group
                           inline-flex
                           items-center
                           gap-2
                           rounded-md
                           p-2
                           text-gray-700
                           dark:text-gray-300
                           hover:bg-gray-100
                           dark:hover:bg-white/10
                           hover:text-gray-900
                           dark:hover:text-white
                           transition
                         "
              >
                <span className="sr-only">Toggle sidebar</span>
                {!sidebarOpen ? (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                )}
                {sidebarOpen && (
                  <span className="text-sm font-medium">Tutup Menu</span>
                )}
              </DisclosureButton>
            </div>

            {/* Desktop sidebar toggle (sm and up) */}
            <button
              onClick={toggleSidebar}
              title={sidebarOpen ? "Tutup menu" : "Buka menu"}
              className="
                         hidden sm:inline-flex
                         items-center justify-center
                         p-2
                         rounded-full
                         text-gray-700
                         dark:text-gray-300
                         hover:bg-gray-100
                         dark:hover:bg-white/10
                         hover:text-gray-900
                         dark:hover:text-white
                         transition
                       "
            >
              {sidebarOpen ? (
                <BsChevronDoubleLeft className="text-lg" />
              ) : (
                <BsChevronDoubleRight className="text-lg" />
              )}
            </button>

            <div className="flex shrink-0 items-center gap-2 pl-1">
              <span className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                <span className="hidden sm:inline">
                  Linen Tracker – SIMTECH
                </span>
                <span className="inline sm:hidden text-sm">Linen Tracker</span>
              </span>
            </div>
          </div>

          {/* RIGHT: end */}
          <div className="flex-1 flex items-center justify-end gap-3 pr-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="
                            rounded-full
                            p-2
                            text-gray-700
                            dark:text-gray-300
                            hover:text-gray-900
                            dark:hover:text-white
                            hover:bg-gray-100
                            dark:hover:bg-white/10
                            transition
                          "
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>

            {/* Notification Component */}
            <Notification
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={handleClearAll}
            />

            {/* Profile dropdown (Headless UI Menu) */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                <span className="sr-only">Open user menu</span>
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="h-8 w-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                />
              </MenuButton>

              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-[#282828] text-gray-900 dark:text-white shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                <MenuItem>
                  {({ focus }) => (
                    <a
                      href="#"
                      className={classNames(
                        focus ? "bg-gray-100 dark:bg-gray-700" : "",
                        "block px-4 py-2 text-sm transition",
                      )}
                    >
                      Your profile
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <a
                      href="#"
                      className={classNames(
                        focus ? "bg-gray-100 dark:bg-gray-700" : "",
                        "block px-4 py-2 text-sm transition",
                      )}
                    >
                      Settings
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <a
                      href="#"
                      onClick={handleLogout}
                      className={classNames(
                        focus ? "bg-gray-100 dark:bg-gray-700" : "",
                        "block px-4 py-2 text-sm transition",
                      )}
                    >
                      Sign out
                    </a>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
