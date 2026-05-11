"use client";

import React, { useState, useEffect } from "react";
import { Movement, Template, TemplateEntry } from "@/types";
import { getMovements, saveTemplate } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { X, Search, Plus, Trash2, GripVertical } from "lucide-react";

interface TemplateEditorProps {
  onClose: () => void;
  onSave: () => void;
  initialTemplate?: Template;
}

export default function TemplateEditor({ onClose, onSave, initialTemplate }: TemplateEditorProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initialTemplate?.name || "");
  const [entries, setEntries] = useState<TemplateEntry[]>(initialTemplate?.entries || []);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) getMovements(user.uid).then(setMovements);
  }, [user]);

  const filtered = movements.filter(m => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  const addMovement = (m: Movement) => {
    setEntries([...entries, { movementName: m.name, reps: 10, weight: 0, unit: 'kg' }]);
    setQuery("");
    setShowDropdown(false);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !name || entries.length === 0) return;
    await saveTemplate(user.uid, {
      name,
      entries,
      order: Date.now(),
      createdAt: Date.now()
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-bg-primary z-50 flex flex-col animate-modal-in">
      <header className="flex items-center justify-between p-6 border-b">
        <button onClick={onClose} className="p-2 -ml-2 text-text-tertiary active:scale-90"><X /></button>
        <h2 className="text-xl font-black">{initialTemplate ? "Edit Template" : "New Template"}</h2>
        <button 
          onClick={handleSave}
          disabled={!name || entries.length === 0}
          className="text-accent font-black uppercase tracking-widest text-sm disabled:opacity-30"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-2 mb-2 block">Routine Name</label>
          <input 
            type="text" 
            placeholder="e.g. Push Day" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 placeholder:text-text-tertiary/20"
          />
        </div>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input 
              type="text" 
              placeholder="Add an exercise..."
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-bg-secondary py-4 pl-12 pr-4 rounded-2xl border-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
          
          {showDropdown && query && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary rounded-2xl shadow-card-lg border z-20 overflow-hidden">
              {filtered.map(m => (
                <button 
                  key={m.id}
                  onClick={() => addMovement(m)}
                  className="w-full text-left px-4 py-3 border-b last:border-none flex items-center justify-between hover:bg-bg-accent"
                >
                  <span className="font-bold">{m.name}</span>
                  <Plus size={16} className="text-accent" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 bg-bg-secondary p-4 rounded-2xl border animate-slide-up">
              <GripVertical className="text-text-tertiary cursor-grab" size={20} />
              <div className="flex-1">
                <p className="font-bold text-sm">{entry.movementName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="number" 
                    value={entry.reps}
                    onChange={e => {
                      const newEntries = [...entries];
                      newEntries[i].reps = parseInt(e.target.value) || 0;
                      setEntries(newEntries);
                    }}
                    className="w-12 bg-bg-primary text-center text-xs py-1 rounded-lg border-none focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-[10px] font-bold text-text-tertiary uppercase">Reps</span>
                </div>
              </div>
              <button onClick={() => removeEntry(i)} className="p-2 text-text-tertiary hover:text-danger"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
