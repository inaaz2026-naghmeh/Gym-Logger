"use client";

import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { getWorkouts } from "@/lib/firestore";
import { LogOut, Monitor, Moon, Sun, Download, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();

  const handleExport = async () => {
    if (!user) return;
    const workouts = await getWorkouts(user.uid);
    
    let csv = "Date,Movement,Weight,Unit,Reps,Notes\n";
    workouts.forEach(w => {
      w.entries.forEach(e => {
        const notes = e.notes ? `"${e.notes.replace(/"/g, '""')}"` : "";
        csv += `${w.date},"${e.movementName}",${e.weight},${e.unit},${e.reps},${notes}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `gym-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="px-1">
        <h1 className="text-3xl font-black tracking-tight">Settings</h1>
        <p className="text-text-tertiary font-bold uppercase text-[10px] tracking-widest">
          Preferences & Profile
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-bg-secondary rounded-3xl border card-depth p-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-bg-accent flex items-center justify-center text-accent">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-2xl" />
            ) : (
              <ShieldCheck size={32} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{user?.displayName || "Athlete"}</h3>
            <p className="text-text-tertiary text-sm truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full bg-danger/10 text-danger py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <LogOut size={20} /> Log Out
        </button>
      </section>

      {/* Appearance Section */}
      <section className="bg-bg-secondary rounded-3xl border card-depth p-6 animate-fade-in">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-2 p-1 bg-bg-primary rounded-2xl">
          <ThemeButton 
            active={settings.theme === 'light'} 
            onClick={() => updateSettings({ theme: 'light' })}
            icon={<Sun size={18} />}
            label="Light"
          />
          <ThemeButton 
            active={settings.theme === 'dark'} 
            onClick={() => updateSettings({ theme: 'dark' })}
            icon={<Moon size={18} />}
            label="Dark"
          />
          <ThemeButton 
            active={settings.theme === 'system'} 
            onClick={() => updateSettings({ theme: 'system' })}
            icon={<Monitor size={18} />}
            label="System"
          />
        </div>
      </section>

      {/* Unit Section */}
      <section className="bg-bg-secondary rounded-3xl border card-depth p-6 animate-fade-in">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-4">Weight Unit</h3>
        <div className="grid grid-cols-2 gap-2 p-1 bg-bg-primary rounded-2xl">
          <button
            onClick={() => updateSettings({ unit: 'kg' })}
            className={cn(
              "py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
              settings.unit === 'kg' ? "bg-bg-secondary shadow-card-lg text-accent" : "text-text-tertiary"
            )}
          >
            Kilograms (kg)
          </button>
          <button
            onClick={() => updateSettings({ unit: 'lbs' })}
            className={cn(
              "py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
              settings.unit === 'lbs' ? "bg-bg-secondary shadow-card-lg text-accent" : "text-text-tertiary"
            )}
          >
            Pounds (lbs)
          </button>
        </div>
      </section>

      {/* Data Section */}
      <section className="bg-bg-secondary rounded-3xl border card-depth p-6 animate-fade-in">
        <h3 className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-4">Data Management</h3>
        <button
          onClick={handleExport}
          className="w-full bg-bg-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Download size={20} /> Export All Data as CSV
        </button>
      </section>

      <footer className="text-center pt-4 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-widest">
          Gym Logger • Built with Next.js & Firebase
        </p>
      </footer>
    </div>
  );
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-3 rounded-xl gap-1.5 transition-all active:scale-95",
        active ? "bg-bg-secondary shadow-card-lg text-accent" : "text-text-tertiary"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
