import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  writeBatch,
  arrayUnion
} from "firebase/firestore";
import { db } from "./firebase";
import { Workout, WorkoutEntry, Movement, Template, UserSettings } from "@/types";

// Mock implementation for Guest Mode
const isGuest = (userId: string) => userId === "guest-user";

const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || "[]");
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// Movements
export const getMovements = async (userId: string): Promise<Movement[]> => {
  if (isGuest(userId)) return getLocal("movements");
  
  const q = query(collection(db, "users", userId, "movements"), orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
};

export const saveMovement = async (userId: string, movement: Omit<Movement, 'id'>) => {
  if (isGuest(userId)) {
    const movements = getLocal("movements");
    const newMovement = { id: Math.random().toString(36).substr(2, 9), ...movement };
    setLocal("movements", [...movements, newMovement]);
    return newMovement;
  }
  
  const col = collection(db, "users", userId, "movements");
  const newDoc = doc(col);
  await setDoc(newDoc, movement);
  return { id: newDoc.id, ...movement };
};

export const deleteMovement = async (userId: string, movementId: string) => {
  if (isGuest(userId)) {
    const movements = getLocal("movements").filter((m: any) => m.id !== movementId);
    setLocal("movements", movements);
    return;
  }
  await deleteDoc(doc(db, "users", userId, "movements", movementId));
};

// Workouts
export const getWorkouts = async (userId: string): Promise<Workout[]> => {
  if (isGuest(userId)) return getLocal("workouts").filter((w: any) => w.entries && w.entries.length > 0);
  
  const q = query(collection(db, "users", userId, "workouts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Workout))
    .filter(w => w.entries && w.entries.length > 0);
};

export const getWorkoutByDate = async (userId: string, date: string): Promise<Workout | null> => {
  if (isGuest(userId)) {
    const workouts = getLocal("workouts");
    return workouts.find((w: any) => w.date === date) || null;
  }
  
  const q = query(collection(db, "users", userId, "workouts"), where("date", "==", date));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Workout;
};

export const addEntriesToWorkout = async (userId: string, date: string, newEntries: Omit<WorkoutEntry, 'id' | 'createdAt'>[]) => {
  const entriesWithMetadata = newEntries.map(entry => ({
    ...entry,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: Date.now()
  }));

  if (isGuest(userId)) {
    const workouts = getLocal("workouts");
    let workout = workouts.find((w: any) => w.date === date);
    
    if (!workout) {
      workout = { id: Math.random().toString(36).substr(2, 9), date, entries: entriesWithMetadata, createdAt: Date.now(), completed: false };
      workouts.push(workout);
    } else {
      workout.entries.push(...entriesWithMetadata);
    }
    
    setLocal("workouts", workouts);
    return;
  }

  const workout = await getWorkoutByDate(userId, date);
  const workoutRef = workout 
    ? doc(db, "users", userId, "workouts", workout.id)
    : doc(collection(db, "users", userId, "workouts"));

  if (!workout) {
    await setDoc(workoutRef, {
      date,
      entries: entriesWithMetadata,
      createdAt: Date.now(),
      completed: false
    });
  } else {
    await updateDoc(workoutRef, {
      entries: arrayUnion(...entriesWithMetadata)
    });
  }
};

export const deleteEntryFromWorkout = async (userId: string, workoutId: string, entryId: string) => {
  if (isGuest(userId)) {
    const workouts = getLocal("workouts");
    const workout = workouts.find((w: any) => w.id === workoutId);
    if (!workout) return;
    
    workout.entries = workout.entries.filter((e: any) => e.id !== entryId);
    if (workout.entries.length === 0) {
      const filteredWorkouts = workouts.filter((w: any) => w.id !== workoutId);
      setLocal("workouts", filteredWorkouts);
    } else {
      setLocal("workouts", workouts);
    }
    return;
  }

  const workoutRef = doc(db, "users", userId, "workouts", workoutId);
  const workoutSnap = await getDoc(workoutRef);
  if (!workoutSnap.exists()) return;
  
  const workout = workoutSnap.data() as Workout;
  const updatedEntries = workout.entries.filter(e => e.id !== entryId);
  
  if (updatedEntries.length === 0) {
    await deleteDoc(workoutRef);
  } else {
    await updateDoc(workoutRef, { entries: updatedEntries });
  }
};

export const updateWorkoutStatus = async (userId: string, workoutId: string, completed: boolean) => {
  if (isGuest(userId)) {
    const workouts = getLocal("workouts");
    const workout = workouts.find((w: any) => w.id === workoutId);
    if (workout) {
      workout.completed = completed;
      setLocal("workouts", workouts);
    }
    return;
  }
  await updateDoc(doc(db, "users", userId, "workouts", workoutId), { completed });
};

// Templates
export const getTemplates = async (userId: string): Promise<Template[]> => {
  if (isGuest(userId)) return getLocal("templates");
  
  const q = query(collection(db, "users", userId, "templates"), orderBy("order"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
};

export const saveTemplate = async (userId: string, template: Omit<Template, 'id'>) => {
  if (isGuest(userId)) {
    const templates = getLocal("templates");
    const newTemplate = { id: Math.random().toString(36).substr(2, 9), ...template };
    setLocal("templates", [...templates, newTemplate]);
    return newTemplate;
  }
  
  const newDoc = doc(collection(db, "users", userId, "templates"));
  await setDoc(newDoc, template);
  return { id: newDoc.id, ...template };
};

export const deleteTemplate = async (userId: string, templateId: string) => {
  if (isGuest(userId)) {
    const templates = getLocal("templates").filter((t: any) => t.id !== templateId);
    setLocal("templates", templates);
    return;
  }
  await deleteDoc(doc(db, "users", userId, "templates", templateId));
};

// Settings
export const getSettings = async (userId: string): Promise<UserSettings | null> => {
  if (isGuest(userId)) return JSON.parse(localStorage.getItem("settings") || "null");
  
  const snap = await getDoc(doc(db, "users", userId, "settings", "current"));
  return snap.exists() ? snap.data() as UserSettings : null;
};

export const saveSettings = async (userId: string, settings: UserSettings) => {
  if (isGuest(userId)) {
    localStorage.setItem("settings", JSON.stringify(settings));
    return;
  }
  await setDoc(doc(db, "users", userId, "settings", "current"), settings);
};

// Seeding
export const seedInitialData = async (userId: string, movements: Omit<Movement, 'id'>[], templates: Omit<Template, 'id'>[]) => {
  if (isGuest(userId)) {
    const movementsWithIds = movements.map(m => ({ id: Math.random().toString(36).substr(2, 9), ...m }));
    const templatesWithIds = templates.map(t => ({ id: Math.random().toString(36).substr(2, 9), ...t }));
    setLocal("movements", movementsWithIds);
    setLocal("templates", templatesWithIds);
    return;
  }

  const batch = writeBatch(db);
  movements.forEach(m => {
    const d = doc(collection(db, "users", userId, "movements"));
    batch.set(d, m);
  });
  templates.forEach(t => {
    const d = doc(collection(db, "users", userId, "templates"));
    batch.set(d, t);
  });
  await batch.commit();
};
