export interface Habit {
  id: string;
  name: string;
  category: "daily" | "extra";
  order: number;
}

export interface DayRecord {
  date: string;
  completions: Record<string, boolean>;
}
