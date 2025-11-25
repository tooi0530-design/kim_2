
export type Mood = 'happy' | 'calm' | 'neutral' | 'tired' | 'sad' | 'stressed';

export interface DayEntry {
  dayNumber: number;
  date?: string; // ISO string
  completed: boolean;
  mood?: Mood;
  content: string;
  activities?: string[];
}

export interface Planner {
  id: string;
  title: string;
  startDate: string; // ISO string
  goal: string;
  entries: Record<number, DayEntry>; // Key is day number (1-100)
}

export const MOOD_EMOJIS: Record<Mood, string> = {
  happy: '🥰',
  calm: '😌',
  neutral: '😐',
  tired: '🥱',
  sad: '😢',
  stressed: '🤯',
};

export const MOOD_LABELS: Record<Mood, string> = {
  happy: '행복함',
  calm: '평온함',
  neutral: '보통',
  tired: '피곤함',
  sad: '슬픔',
  stressed: '스트레스',
};
