import { Menu } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export const Navbar = ({ onMenuClick, title = "Panel de control" }: NavbarProps) => {
  return (
    <header
      className="
        md:hidden 
        sticky top-0 z-20 
        bg-white dark:bg-slate-900 
        text-slate-800 dark:text-slate-200 
        shadow-sm border-b border-slate-200 dark:border-slate-700
      "
    >
      <div className="flex items-center gap-3 p-3">
        {/* Botón del menú */}
        <button
          onClick={onMenuClick}
          className="
            p-2 rounded-md 
            hover:bg-slate-200 dark:hover:bg-slate-700 
            transition
          "
        >
          <Menu size={22} />
        </button>

        {/* Título */}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
};


