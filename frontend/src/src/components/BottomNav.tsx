import { Home, Bot, User } from "lucide-react";
import { Link, useLocation } from "react-router";

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/coach", icon: Bot, label: "Mon Coach IA" },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E7EB] shadow-lg rounded-b-3xl">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                isActive ? "text-[#10B981]" : "text-[#2C3E50]"
              } hover:text-[#10B981]`}
              aria-label={item.label}
            >
              <Icon 
                className="w-6 h-6" 
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className={`text-xs ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}