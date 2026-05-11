"use client";

import { WorkoutEntry } from "@/types";
import { Trash2, Copy, Edit2, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import StaggeredList from "./StaggeredList";

interface WorkoutListProps {
  entries: WorkoutEntry[];
  onDeleteEntry: (entryId: string) => void;
  onDuplicateEntry: (entry: WorkoutEntry) => void;
  onUpdateEntry: (entryId: string, updates: Partial<WorkoutEntry>) => void;
  onDeleteMovement: (movementName: string) => void;
}

export default function WorkoutList({ 
  entries, 
  onDeleteEntry, 
  onDuplicateEntry, 
  onUpdateEntry,
  onDeleteMovement 
}: WorkoutListProps) {
  
  // Group entries by movement
  const groups = entries.reduce((acc, entry) => {
    if (!acc[entry.movementName]) acc[entry.movementName] = [];
    acc[entry.movementName].push(entry);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  return (
    <StaggeredList className="space-y-6">
      {Object.entries(groups).map(([name, movementEntries]) => (
        <div key={name}>
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{name}</h3>
              <span className="bg-bg-tertiary text-text-tertiary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {movementEntries.length} Sets
              </span>
            </div>
            <button 
              onClick={() => onDeleteMovement(name)}
              className="text-text-tertiary hover:text-danger p-2 transition-colors active:scale-90"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {movementEntries.map((entry, index) => (
              <EntryRow 
                key={entry.id} 
                entry={entry} 
                index={index} 
                onDelete={() => onDeleteEntry(entry.id)}
                onDuplicate={() => onDuplicateEntry(entry)}
                onUpdate={(updates) => onUpdateEntry(entry.id, updates)}
              />
            ))}
          </div>
        </div>
      ))}
    </StaggeredList>
  );
}

function EntryRow({ entry, index, onDelete, onDuplicate, onUpdate }: { 
  entry: WorkoutEntry; 
  index: number; 
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdate: (updates: Partial<WorkoutEntry>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(entry.weight.toString());
  const [reps, setReps] = useState(entry.reps.toString());

  const handleSave = () => {
    onUpdate({ weight: parseFloat(weight), reps: parseInt(reps) });
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 bg-bg-secondary p-3 rounded-2xl border active:bg-bg-accent transition-colors">
      <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center text-xs font-black text-text-tertiary">
        {index + 1}
      </div>

      <div className="flex-1 flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1 animate-fade-in">
            <input 
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              className="w-16 bg-bg-primary text-center font-bold py-1 rounded-lg border-none focus:ring-1 focus:ring-accent outline-none"
              autoFocus
            />
            <span className="text-text-tertiary">×</span>
            <input 
              type="number" 
              value={reps} 
              onChange={(e) => setReps(e.target.value)}
              className="w-12 bg-bg-primary text-center font-bold py-1 rounded-lg border-none focus:ring-1 focus:ring-accent outline-none"
            />
            <button onClick={handleSave} className="p-2 text-success active:scale-90"><Check size={18} /></button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-1" onClick={() => setIsEditing(true)}>
            <span className="text-xl font-black">{entry.weight}</span>
            <span className="text-text-tertiary text-sm font-bold">{entry.unit}</span>
            <span className="mx-1 text-text-tertiary">×</span>
            <span className="text-xl font-black">{entry.reps}</span>
            <span className="text-text-tertiary text-sm font-bold">Reps</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onDuplicate} className="p-2 text-text-tertiary hover:text-accent transition-colors active:scale-90"><Copy size={18} /></button>
        <button onClick={onDelete} className="p-2 text-text-tertiary hover:text-danger transition-colors active:scale-90"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}
