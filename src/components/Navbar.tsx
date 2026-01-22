import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BsChevronDoubleLeft, BsChevronDoubleRight } from "react-icons/bs";
import {
  Disclosure,
  DisclosureButton,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar({ toggleSidebar, sidebarOpen }: NavbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

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

  return (
    <Disclosure
      as="nav"
      className="relative bg-[#242222] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="mx-auto px-2 sm:px-6 lg:px-8 border-b-2 border-[#24D6AD]">
        <div className="relative flex h-16 items-center justify-between">
          {/* LEFT: start */}
          <div className="flex-1 flex items-center justify-start gap-3">
            <div className="sm:hidden">
              <DisclosureButton
                as="button"
                onClick={() => toggleSidebar()}
                className="group inline-flex items-center gap-2 rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
              >
                <span className="sr-only">Toggle sidebar</span>
                {!sidebarOpen ? (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                )}
                {sidebarOpen && (
                  <span className="text-sm font-medium text-white">
                    Tutup Menu
                  </span>
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
                         text-gray-300
                         hover:bg-white/10
                         hover:text-white
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
              <span className="text-white font-semibold flex items-center gap-2">
                <span className="hidden sm:inline">
                  Linen Tracker – RSUD Cileungsi
                </span>
                <span className="inline sm:hidden text-sm">Linen Tracker</span>
              </span>
            </div>
          </div>

          {/* RIGHT: end */}
          <div className="flex-1 flex items-center justify-end gap-3 pr-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotif((s) => !s)}
                className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                aria-expanded={showNotif}
                aria-label="View notifications"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
                  3
                </span>
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-64 rounded-md bg-gray-800 shadow-lg ring-1 ring-white/10 z-20">
                  <div className="p-3 text-sm text-white font-semibold">
                    Notifikasi
                  </div>
                  <ul className="px-3 pb-3 text-sm text-gray-300 space-y-1">
                    <li>🔄 Linen belum kembali (3)</li>
                    <li>📦 Batch 12:00 belum diproses</li>
                    <li>⚠️ 5 Linen melebihi max cycle</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Profile dropdown (Headless UI Menu) */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span className="sr-only">Open user menu</span>
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="h-8 w-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                />
              </MenuButton>

              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 outline -outline-offset-1 outline-white/10 shadow">
                <MenuItem>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-white/5 text-white" : "text-gray-300",
                        "block px-4 py-2 text-sm",
                      )}
                    >
                      Your profile
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-white/5 text-white" : "text-gray-300",
                        "block px-4 py-2 text-sm",
                      )}
                    >
                      Settings
                    </a>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <a
                      href="#"
                      onClick={handleLogout}
                      className={classNames(
                        active ? "bg-white/5 text-white" : "text-gray-300",
                        "block px-4 py-2 text-sm",
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
