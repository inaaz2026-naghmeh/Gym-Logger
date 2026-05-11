"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Workout } from "@/types";
import { getWorkouts, deleteEntryFromWorkout } from "@/lib/firestore";
import { getRelativeDate, cn } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";
import WorkoutList from "@/components/WorkoutList";
import StaggeredList from "@/components/StaggeredList";
import { ChevronDown, ChevronUp, Calendar, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    const data = await getWorkouts(user.uid);
    setWorkouts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  if (loading) return <div className="pt-8"><SkeletonList count={4} /></div>;

  // Group by week
  const groups = workouts.reduce((acc, workout) => {
    const date = new Date(workout.date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday-start week
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const weekKey = monday.toISOString().split('T')[0];
    
    if (!acc[weekKey]) acc[weekKey] = [];
    acc[weekKey].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);

  return (
    <div className="space-y-8 pb-20">
      <div className="px-1">
        <h1 className="text-3xl font-black tracking-tight">History</h1>
        <p className="text-text-tertiary font-bold uppercase text-[10px] tracking-widest">
          Your journey so far
        </p>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-20 opacity-30">
          <Calendar size={48} className="mx-auto mb-4" />
          <p className="font-bold">No history yet</p>
        </div>
      ) : (
        Object.entries(groups).map(([week, weekWorkouts]) => (
          <div key={week} className="space-y-4 animate-fade-in">
            <h2 className="text-accent text-[10px] font-black uppercase tracking-[0.2em] px-2">
              Week of {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>
            
            <StaggeredList>
              {weekWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  isExpanded={expandedId === workout.id}
                  onToggle={() => setExpandedId(expandedId === workout.id ? null : workout.id)}
                  onRefresh={fetchHistory}
                />
              ))}
            </StaggeredList>
          </div>
        ))
      )}
    </div>
  );
}

function WorkoutCard({ workout, isExpanded, onToggle, onRefresh }: { 
  workout: Workout; 
  isExpanded: boolean; 
  onToggle: () => void;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  
  const movementPreview = Array.from(new Set(workout.entries.map(e => e.movementName)))
    .slice(0, 3)
    .join(", ");

  const totalSets = workout.entries.length;

  return (
    <div className={cn(
      "bg-bg-secondary rounded-3xl border card-depth overflow-hidden transition-all duration-300",
      isExpanded ? "shadow-card-lg" : "shadow-card"
    )}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer active:bg-bg-accent"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-lg">{getRelativeDate(workout.date)}</span>
            <span className="bg-bg-tertiary text-text-tertiary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {totalSets} Sets
            </span>
          </div>
          <p className="text-text-tertiary text-xs truncate font-medium">
            {movementPreview}{workout.entries.length > 3 ? "..." : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className={cn(
            "p-2 rounded-full bg-bg-primary text-text-tertiary transition-transform",
            isExpanded && "rotate-180"
          )}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-6 pt-2 border-t bg-bg-primary/30 animate-slide-up">
          <WorkoutList 
            entries={workout.entries}
            onDeleteEntry={async (id) => {
              await deleteEntryFromWorkout(user!.uid, workout.id, id);
              onRefresh();
            }}
            onDeleteMovement={async (name) => {
              if (confirm(`Delete all sets for ${name}?`)) {
                for (const e of workout.entries.filter(e => e.movementName === name)) {
                  await deleteEntryFromWorkout(user!.uid, workout.id, e.id);
                }
                onRefresh();
              }
            }}
            onDuplicateEntry={() => {}} // History duplication disabled for now
            onUpdateEntry={() => {}}
          />
        </div>
      )}
    </div>
  );
}
