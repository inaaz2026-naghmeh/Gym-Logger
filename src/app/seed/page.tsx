"use client";

import { useAuth } from "@/context/AuthContext";
import { seedInitialData } from "@/lib/firestore";
import { DEFAULT_MOVEMENTS, INITIAL_TEMPLATES } from "@/lib/defaults";
import { useState } from "react";
import { Database, Check, Loader2 } from "lucide-react";

export default function SeedPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSeed = async () => {
    if (!user) return;
    setStatus("loading");
    try {
      await seedInitialData(user.uid, DEFAULT_MOVEMENTS, INITIAL_TEMPLATES);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="bg-bg-accent p-6 rounded-3xl text-accent">
        <Database size={48} />
      </div>
      <div>
        <h1 className="text-2xl font-black mb-2">Dev Utility: Seeding</h1>
        <p className="text-text-tertiary">Seed default movements and templates for your account.</p>
      </div>

      <button
        onClick={handleSeed}
        disabled={status === "loading" || status === "success"}
        className="bg-accent text-white px-8 py-4 rounded-2xl font-black shadow-btn active:scale-95 transition-all flex items-center gap-2"
      >
        {status === "loading" ? <Loader2 className="animate-spin" /> : status === "success" ? <Check /> : null}
        {status === "success" ? "Data Seeded!" : "Seed Initial Data"}
      </button>

      {status === "error" && <p className="text-danger font-bold">Failed to seed data.</p>}
    </div>
  );
}
