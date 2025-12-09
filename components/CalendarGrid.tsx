import React from 'react';
import { DayCell, CalendarEvent } from '../types';
import { format } from 'date-fns';

interface CalendarGridProps {
  days: DayCell[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ days }) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden relative z-10">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-5 lg:grid-rows-5">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`
              min-h-[100px] border-b border-r border-stone-100 p-2 transition-colors relative
              ${!day.isCurrentMonth ? 'bg-stone-50/50 text-stone-400' : 'bg-white text-stone-800'}
              ${day.isToday ? 'bg-indigo-50/30' : ''}
            `}
          >
            {/* Date Number */}
            <span
              className={`
                text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                ${day.isToday ? 'bg-indigo-600 text-white' : ''}
              `}
            >
              {format(day.date, 'd')}
            </span>

            {/* Events List */}
            <div className="mt-1 space-y-1">
              {day.events.map((event) => (
                <div
                  key={event.id}
                  className={`
                    text-[10px] px-1.5 py-0.5 rounded border truncate handwritten font-bold
                    ${
                      event.type === 'work' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      event.type === 'personal' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      'bg-stone-100 text-stone-600 border-stone-200'
                    }
                  `}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};