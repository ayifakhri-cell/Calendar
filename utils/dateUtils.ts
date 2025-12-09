import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  format
} from 'date-fns';
import { CalendarEvent, DayCell } from '../types';

export const generateCalendarGrid = (currentDate: Date, events: CalendarEvent[]): DayCell[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return dateRange.map((day) => {
    const dayEvents = events.filter((event) => isSameDay(event.date, day));
    return {
      date: day,
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: isSameDay(day, new Date()),
      events: dayEvents,
    };
  });
};

export const getMonthName = (date: Date): string => format(date, 'MMMM yyyy');

export const getNextMonth = (date: Date): Date => addMonths(date, 1);
export const getPrevMonth = (date: Date): Date => subMonths(date, 1);