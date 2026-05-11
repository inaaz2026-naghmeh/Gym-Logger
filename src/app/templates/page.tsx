"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Template, Workout } from "@/types";
import { getTemplates, addEntriesToWorkout, getWorkoutByDate, deleteTemplate } from "@/lib/firestore";
import { formatDate, cn } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";
import StaggeredList from "@/components/StaggeredList";
import TemplateEditor from "@/components/TemplateEditor";
import { Play, Edit2, Trash2, Plus, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>();

  const fetchTemplates = async () => {
    if (!user) return;
    const data = await getTemplates(user.uid);
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const handleLoad = async (template: Template) => {
    if (!user) return;
    setLoadingId(template.id);
    
    // Write all entries in one go
    await addEntriesToWorkout(user.uid, formatDate(new Date()), template.entries.map(e => ({
      ...e,
      unit: e.unit || "kg"
    })));

    setLoadingId(null);
    setShowSuccess(template.id);
    
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this template?")) return;
    await deleteTemplate(user.uid, id);
    fetchTemplates();
  };

  if (loading) return <div className="pt-8"><SkeletonList count={3} /></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Templates</h1>
          <p className="text-text-tertiary font-bold uppercase text-[10px] tracking-widest">
            Pre-built routines
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingTemplate(undefined);
            setIsEditorOpen(true);
          }}
          className="bg-bg-secondary p-3 rounded-2xl border active:scale-95 transition-transform text-accent shadow-card"
        >
          <Plus size={24} />
        </button>
      </div>

      {isEditorOpen && (
        <TemplateEditor 
          onClose={() => setIsEditorOpen(false)}
          onSave={() => {
            setIsEditorOpen(false);
            fetchTemplates();
          }}
          initialTemplate={editingTemplate}
        />
      )}

      <StaggeredList className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-bg-secondary rounded-3xl border card-depth p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black">{template.name}</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-text-tertiary hover:text-danger active:scale-90"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {template.entries.slice(0, 4).map((e, i) => (
                <span key={i} className="bg-bg-primary text-text-tertiary text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                  {e.movementName}
                </span>
              ))}
              {template.entries.length > 4 && (
                <span className="bg-bg-primary text-text-tertiary text-[10px] font-bold px-2 py-1 rounded-lg">
                  +{template.entries.length - 4} more
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleLoad(template)}
                disabled={!!loadingId || !!showSuccess}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-btn transition-all active:scale-95",
                  showSuccess === template.id ? "bg-success text-white" : "bg-accent text-white"
                )}
              >
                {loadingId === template.id ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : showSuccess === template.id ? (
                  <><Check size={20} /> Loaded!</>
                ) : (
                  <><Play size={20} fill="currentColor" /> Load Template</>
                )}
              </button>
              <button 
                onClick={() => {
                  setEditingTemplate(template);
                  setIsEditorOpen(true);
                }}
                className="flex-none bg-bg-tertiary p-4 rounded-2xl text-text-primary active:scale-95 transition-transform"
              >
                <Edit2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </StaggeredList>
    </div>
  );
}
