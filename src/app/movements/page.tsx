"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Movement, Category } from "@/types";
import { getMovements, saveMovement, deleteMovement } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";
import StaggeredList from "@/components/StaggeredList";
import { Search, Plus, Trash2, Edit2, Check, X } from "lucide-react";

const CATEGORIES: Category[] = ['Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other'];

export default function MovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>('Other');

  const fetchMovements = async () => {
    if (!user) return;
    const data = await getMovements(user.uid);
    setMovements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMovements();
  }, [user]);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = async () => {
    if (!user || !newName) return;
    await saveMovement(user.uid, {
      name: newName,
      category: newCategory,
      isCustom: true
    });
    setNewName("");
    setIsAdding(false);
    fetchMovements();
  };

  const handleUpdate = async (m: Movement) => {
    if (!user || !newName) return;
    await saveMovement(user.uid, {
      ...m,
      name: newName,
      category: newCategory
    });
    setEditingId(null);
    setNewName("");
    fetchMovements();
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this movement?")) return;
    await deleteMovement(user.uid, id);
    fetchMovements();
  };

  if (loading) return <div className="pt-8"><SkeletonList count={5} /></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="px-1">
        <h1 className="text-3xl font-black tracking-tight">Library</h1>
        <p className="text-text-tertiary font-bold uppercase text-[10px] tracking-widest">
          Exercise database
        </p>
      </div>

      <div className="space-y-4 sticky top-0 bg-bg-primary z-10 pt-2 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-bg-secondary border shadow-card outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 thin-scrollbar no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
              selectedCategory === 'All' ? "bg-accent text-white shadow-btn" : "bg-bg-secondary text-text-tertiary border"
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                selectedCategory === cat ? "bg-accent text-white shadow-btn" : "bg-bg-secondary text-text-tertiary border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full bg-bg-secondary p-4 rounded-2xl border border-dashed border-accent/30 text-accent font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus size={20} /> Add Custom Exercise
        </button>

        {isAdding && (
          <div className="bg-bg-secondary p-4 rounded-2xl border shadow-card-lg animate-modal-in space-y-4">
            <input
              type="text"
              placeholder="Exercise name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 rounded-xl bg-bg-primary outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Category)}
              className="w-full p-3 rounded-xl bg-bg-primary outline-none focus:ring-2 focus:ring-accent"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 font-bold text-text-tertiary">Cancel</button>
              <button onClick={handleAdd} className="flex-2 bg-accent text-white py-3 rounded-xl font-bold shadow-btn">Save Exercise</button>
            </div>
          </div>
        )}

        <StaggeredList className="grid gap-2 mt-4">
          {filteredMovements.map((m) => (
            <div key={m.id} className="bg-bg-secondary p-4 rounded-2xl border flex items-center justify-between group hover:border-accent/30 transition-colors">
              {editingId === m.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-2 p-2 rounded-lg bg-bg-primary outline-none focus:ring-1 focus:ring-accent text-sm"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="flex-1 p-2 rounded-lg bg-bg-primary outline-none focus:ring-1 focus:ring-accent text-[10px]"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <button onClick={() => handleUpdate(m)} className="p-2 text-success"><Check size={18} /></button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-text-tertiary"><X size={18} /></button>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-lg">{m.name}</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest text-text-tertiary">{m.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setEditingId(m.id);
                        setNewName(m.name);
                        setNewCategory(m.category);
                      }}
                      className="p-2 text-text-tertiary hover:text-accent active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 size={18} />
                    </button>
                    {m.isCustom && (
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-text-tertiary hover:text-danger active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </StaggeredList>
      </div>
    </div>
  );
}
