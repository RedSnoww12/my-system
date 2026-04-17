import { create } from 'zustand';
import { loadJSON, saveJSON, STORAGE_KEYS } from '@/lib/storage';
import type { BarcodesDict, LogByDate, MealEntry, RecipesDict } from '@/types';

interface NutritionState {
  log: LogByDate;
  recipes: RecipesDict;
  barcodes: BarcodesDict;
  favs: string[];
  recent: string[];
  savedMeals: MealEntry[][];

  addMealEntry: (date: string, entry: MealEntry) => void;
  removeMealEntry: (date: string, index: number) => void;
  setDayLog: (date: string, entries: MealEntry[]) => void;
  setRecipes: (recipes: RecipesDict) => void;
  setBarcodes: (barcodes: BarcodesDict) => void;
  setFavs: (favs: string[]) => void;
  setRecent: (recent: string[]) => void;
  setSavedMeals: (meals: MealEntry[][]) => void;
  rehydrate: () => void;
}

function readAll() {
  return {
    log: loadJSON<LogByDate>(STORAGE_KEYS.log, {}),
    recipes: loadJSON<RecipesDict>(STORAGE_KEYS.recipes, {}),
    barcodes: loadJSON<BarcodesDict>(STORAGE_KEYS.barcodes, {}),
    favs: loadJSON<string[]>(STORAGE_KEYS.favs, []),
    recent: loadJSON<string[]>(STORAGE_KEYS.recent, []),
    savedMeals: loadJSON<MealEntry[][]>(STORAGE_KEYS.savedMeals, []),
  };
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  ...readAll(),

  addMealEntry: (date, entry) => {
    const log = { ...get().log };
    const day = log[date] ? [...log[date], entry] : [entry];
    log[date] = day;
    saveJSON(STORAGE_KEYS.log, log);
    set({ log });
  },
  removeMealEntry: (date, index) => {
    const log = { ...get().log };
    const day = (log[date] ?? []).filter((_, i) => i !== index);
    if (day.length === 0) {
      delete log[date];
    } else {
      log[date] = day;
    }
    saveJSON(STORAGE_KEYS.log, log);
    set({ log });
  },
  setDayLog: (date, entries) => {
    const log = { ...get().log, [date]: entries };
    saveJSON(STORAGE_KEYS.log, log);
    set({ log });
  },
  setRecipes: (recipes) => {
    saveJSON(STORAGE_KEYS.recipes, recipes);
    set({ recipes });
  },
  setBarcodes: (barcodes) => {
    saveJSON(STORAGE_KEYS.barcodes, barcodes);
    set({ barcodes });
  },
  setFavs: (favs) => {
    saveJSON(STORAGE_KEYS.favs, favs);
    set({ favs });
  },
  setRecent: (recent) => {
    saveJSON(STORAGE_KEYS.recent, recent);
    set({ recent });
  },
  setSavedMeals: (meals) => {
    saveJSON(STORAGE_KEYS.savedMeals, meals);
    set({ savedMeals: meals });
  },
  rehydrate: () => set(readAll()),
}));
