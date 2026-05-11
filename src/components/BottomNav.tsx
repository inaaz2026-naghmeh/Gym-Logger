"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  ClipboardList, 
  Dumbbell, 
  BarChart2, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { name: "Workout", path: "/", icon: Activity },
  { name: "Templates", path: "/templates", icon: ClipboardList },
  { name: "Movements", path: "/movements", icon: Dumbbell },
  { name: "History", path: "/history", icon: BarChart2 },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="glass flex w-full max-w-lg items-center justify-around py-2 px-1 rounded-t-3xl shadow-card-lg border-x border-t">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          
          return (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={cn(
                "relative flex flex-col items-center justify-center w-full py-2 transition-all active:scale-90",
                isActive ? "text-accent scale-105" : "text-text-tertiary hover:text-accent/70"
              )}
            >
              <Icon size={22} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]")} />
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                {tab.name}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-accent rounded-full animate-fade-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
