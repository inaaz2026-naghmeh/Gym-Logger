"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut,
  getRedirectResult
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getMovements, seedInitialData } from "@/lib/firestore";
import { DEFAULT_MOVEMENTS, INITIAL_TEMPLATES } from "@/lib/defaults";

interface AuthContextType {
  user: User | { uid: string, displayName: string, email: string, photoURL: string } | null;
  loading: boolean;
  login: () => Promise<void>;
  guestLogin: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || Object.keys(auth).length === 0) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if we need to seed
        const movements = await getMovements(user.uid);
        if (movements.length === 0) {
          await seedInitialData(user.uid, DEFAULT_MOVEMENTS, INITIAL_TEMPLATES);
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key') {
        guestLogin();
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.error("Login error", error);
      }
    }
  };

  const guestLogin = async () => {
    setLoading(true);
    const guestUid = "guest-user";
    
    // Seed for guest if needed
    const movements = await getMovements(guestUid);
    if (movements.length === 0) {
      await seedInitialData(guestUid, DEFAULT_MOVEMENTS, INITIAL_TEMPLATES);
    }

    setUser({
      uid: guestUid,
      displayName: "Guest Athlete",
      email: "guest@example.com",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"
    } as any);
    setLoading(false);
  };

  const logout = async () => {
    if (user?.uid !== 'guest-user') {
      await signOut(auth);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
