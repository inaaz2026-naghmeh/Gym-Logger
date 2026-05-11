"use client";

import { useState, useEffect, useRef } from "react";
import { Movement } from "@/types";
import { getMovements, addEntriesToWorkout } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { formatDate } from "@/lib/utils";
import { Plus, Repeat, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutFormProps {
  lastEntry?: { movementName: string; weight: number; reps: number };
  onLog: () => void;
}

export default function WorkoutForm({ lastEntry, onLog }: WorkoutFormProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getMovements(user.uid).then(setMovements);
    }
  }, [user]);

  useEffect(() => {
    if (lastEntry) {
      setWeight(lastEntry.weight.toString());
      setReps(lastEntry.reps.toString());
    }
  }, [lastEntry]);

  const filteredMovements = movements
    .filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  const handleLog = async (movementName: string) => {
    if (!user || !movementName || !weight || !reps) return;
    setIsLogging(true);
    
    await addEntriesToWorkout(user.uid, formatDate(new Date()), [{
      movementName,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      unit: settings.unit,
      notes: notes || undefined
    }]);

    setNotes("");
    setShowNotes(false);
    setIsLogging(false);
    onLog();
    
    // Refocus movement input
    inputRef.current?.focus();
  };

  const handleRepeatLast = () => {
    if (lastEntry) {
      handleLog(lastEntry.movementName);
    }
  };

  return (
    <div className="bg-bg-secondary p-4 rounded-3xl card-depth border mb-6 animate-fade-in">
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="What exercise?"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full text-lg py-3.5 px-4 rounded-xl bg-bg-primary border-none focus:ring-2 focus:ring-accent outline-none transition-all"
        />
        
        {showDropdown && query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary rounded-2xl shadow-card-lg border z-20 overflow-hidden animate-modal-in">
            {filteredMovements.length > 0 ? (
              filteredMovements.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setQuery(m.name);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-bg-accent transition-colors border-b last:border-none"
                >
                  <span className="font-bold">{m.name}</span>
                  <span className="text-xs text-text-tertiary ml-2 uppercase tracking-wider">{m.category}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-text-tertiary text-sm">No exercises found.</div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary ml-2 mb-1 block">Weight ({settings.unit})</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full text-center text-xl py-3 rounded-xl bg-bg-primary border-none focus:ring-2 focus:ring-accent outline-none font-bold"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary ml-2 mb-1 block">Reps</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full text-center text-xl py-3 rounded-xl bg-bg-primary border-none focus:ring-2 focus:ring-accent outline-none font-bold"
          />
        </div>
      </div>

      <button
        onClick={() => setShowNotes(!showNotes)}
        className="flex items-center gap-1 text-xs font-bold text-text-tertiary uppercase tracking-widest ml-1 mb-4 active:scale-95 transition-transform"
      >
        {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showNotes ? "Hide Notes" : "Add Notes"}
      </button>

      {showNotes && (
        <textarea
          placeholder="Form notes, how it felt..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-20 p-3 rounded-xl bg-bg-primary border-none focus:ring-2 focus:ring-accent outline-none mb-4 text-sm resize-none animate-slide-up"
        />
      )}

      <div className="flex gap-3">
        <button
          onClick={() => handleLog(query)}
          disabled={!query || !weight || !reps || isLogging}
          className="flex-3 bg-accent text-white py-4 rounded-2xl font-bold shadow-btn hover:shadow-btn-hover active:scale-95 transition-all disabled:opacity-50"
        >
          Log Set
        </button>
        {lastEntry && (
          <button
            onClick={handleRepeatLast}
            disabled={isLogging}
            className="flex-1 bg-bg-tertiary text-text-primary py-4 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all"
            title={`Repeat last ${lastEntry.movementName}`}
          >
            <Repeat size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
