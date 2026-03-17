import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  Home,
  Users,
  Smartphone,
  Network,
  BarChart3,
  UserRound,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import digitalcitizenIcon from "../../assets/icons/DigitalCitizen.svg";

interface SidebarContentProps {
  onNavigate?: () => void;
}

type MenuItem =
  | {
      label: string;
      icon: ReactNode;
      path: string;
      separator?: never;
    }
  | {
    separator: string;
    label?: never;
    icon?: never;
    path?: never;
  };

  export const SidebarContent = ({ onNavigate }: SidebarContentProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
  
    const [darkMode, setDarkMode] = useState(false);
  
    useEffect(() => {
      const saved = localStorage.getItem("theme");
      const isDark =
        saved === "dark" ||
        (!saved && document.documentElement.classList.contains("dark"));
  
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }, []);
  
    const toggleDarkMode = () => {
      const next = !darkMode;
      setDarkMode(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
    };
  
    if (!user) return null;
  
    const panelTitle = user.role === "ADMIN" ? "Admin Panel" : "Client Panel";
  
    const adminMenu: MenuItem[] = [
      { label: "Dashboard", icon: <Home size={18} />, path: "/admin/dashboard" },
      { label: "Clients", icon: <Users size={18} />, path: "/admin/clients" },
      { label: "Reports", icon: <BarChart3 size={18} />, path: "/admin/reports" },
    ];
  
    const clientMenu: MenuItem[] = [
      { separator: "Panel principal" },
      { label: "Dashboard", icon: <Home size={18} />, path: "/client/dashboard" },
  
      { separator: "Gestión" },
      { label: "Usuarios", icon: <Users size={18} />, path: "/client/users" },
      { label: "Dispositivos", icon: <Smartphone size={18} />, path: "/client/devices" },
      { label: "Líneas", icon: <Network size={18} />, path: "/client/lines" },
      { label: "Reportes", icon: <BarChart3 size={18} />, path: "/client/reports" },
  
      { separator: "Cuenta" },
      { label: "Mi Perfil", icon: <UserRound size={18} />, path: "/client/profile" },
    ];
  
    const menu = user.role === "ADMIN" ? adminMenu : clientMenu;
  
    const handleNav = (path: string) => {
      navigate(path);
      onNavigate?.();
    };
  
    const handleLogout = () => {
      navigate("/landing");
      setTimeout(logout, 0);
    };
  
    return (
      <div className="
        flex flex-col 
        min-h-screen       /* <── FIX PRINCIPAL */
        bg-white dark:bg-slate-900 
        text-slate-700 dark:text-slate-200
        border-r border-slate-200 dark:border-slate-700
      ">
  
      {/* HEADER */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() =>
            navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/client/dashboard")
          }
        >
          <img
            src={digitalcitizenIcon}
            alt="Digital Citizen"
            className="w-8 h-8 opacity-90 hover:opacity-100 hover:scale-105 transition duration-150"
          />
          <div>
            <p className="font-semibold">{panelTitle}</p>
            {user.clientId && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Client ID: {user.clientId}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
  
        {/* MENU */}
        <nav className="
          flex-1                /* <── hace que el menú ocupe el espacio sobrante */
          overflow-y-auto 
          px-3 py-2
        ">
          {menu.map((item, i) => {
            if ("separator" in item) {
              return (
                <div key={`sep-${i}`} className="my-4 -mx-1 px-1">
                  <div className="
                    w-full rounded-full 
                    bg-slate-600/30 dark:bg-slate-800/70 
                    px-6 py-1 text-[11px] font-semibold uppercase 
                    tracking-wide text-slate-600 dark:text-slate-200 
                    text-center shadow-inner
                  ">
                    {item.separator}
                  </div>
                </div>
              );
            }
  
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1
                  text-sm transition
                  ${
                    location.pathname === item.path
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : "hover:bg-slate-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
  
        {/* LOGOUT */}
        <div className="
          p-4 border-t border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
        ">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              text-red-600 dark:text-red-400 
              hover:bg-red-100 dark:hover:bg-red-900/30
              transition font-medium
            "
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
  
      </div>
    );
  };
  


































































































































































































































































































































































































