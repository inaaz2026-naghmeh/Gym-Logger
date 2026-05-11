"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserSettings } from "@/types";
import { getSettings, saveSettings } from "@/lib/firestore";
import { useAuth } from "./AuthContext";

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const defaultSettings: UserSettings = {
  unit: "kg",
  theme: "system"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    if (user) {
      getSettings(user.uid).then(s => {
        if (s) setSettings(s);
      });
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user) {
      await saveSettings(user.uid, updated);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
