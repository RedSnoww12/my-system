export interface WeightEntry {
  date: string;
  w: number;
}

export interface Workout {
  date: string;
  type: string;
  duration?: number;
  [key: string]: unknown;
}

export type StepsByDate = Record<string, number>;
export type WaterByDate = Record<string, number>;
