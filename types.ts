export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'work' | 'personal' | 'holiday' | 'other';
}

export enum CalendarMode {
  VIEW = 'VIEW',
  DRAW = 'DRAW',
  LOADING = 'LOADING'
}

export interface ThemeState {
  imageUrl: string | null;
  prompt: string;
  isLoading: boolean;
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}