import { Icon, Wordmark } from "@/assets/logo";
import { useTheme } from "@/contexts/theme/Context";
import { cn } from "@/lib/utils";
import {
  Bell,
  LayoutDashboard,
  Network,
  Settings,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export function Sidebar() {
  const { theme, setTheme } = useTheme();

  const navItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Network",
      to: "/network",
      icon: Network,
    },
    {
      label: "Alarms",
      to: "/alarms",
      icon: Bell,
    },
    {
      label: "Settings",
      to: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="flex flex-col w-64 border-r border-border gb-card">
      {/* Header */}
      <div className="flex h-25 items-center gap-3 border-b border-border p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary p-2">
          <Icon className="text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <Wordmark className="h-full w-auto text-primary" />
        </div>
      </div>

      {/* Page Navigator */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex justify-center gap-2 py-2">
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "rounded p-2 transition-colors",
            theme === "light"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          title="Light mode"
        >
          <Sun className="h-4 w-4" />
        </button>

        <button
          onClick={() => setTheme("system")}
          className={cn(
            "rounded p-2 transition-colors",
            theme === "system"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          title="System Preference"
        >
          <Monitor className="h-4 w-4" />
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "rounded p-2 transition-colors",
            theme === "dark"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          title="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
