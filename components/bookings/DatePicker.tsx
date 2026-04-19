"use client";

import { useMemo } from "react";
import { format, startOfToday, isSameDay, addDays, eachDayOfInterval } from "date-fns";

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabledDates?: Date[];
}

export default function DatePicker({ selectedDate, onDateSelect, disabledDates = [] }: DatePickerProps) {
  const today = startOfToday();
  const maxDate = addDays(today, 29); // 30 days window

  // Generate exactly 30 days starting from today
  const days = useMemo(() => {
    return eachDayOfInterval({ start: today, end: maxDate });
  }, [today, maxDate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Date</h3>
      </div>
      
      <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar snap-x">
          {days.map((day, i) => {
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isToday = isSameDay(day, today);
            const isLeaveDay = disabledDates.some(d => isSameDay(d, day));
            
            return (
              <div 
                key={i}
                className={`relative flex-shrink-0 w-16 flex flex-col items-center gap-3 py-5 rounded-3xl transition-all duration-300 snap-center cursor-pointer border ${
                  isSelected 
                    ? 'bg-orange-500 border-orange-500 shadow-xl shadow-orange-100 ring-4 ring-orange-100' 
                    : isLeaveDay
                      ? 'bg-slate-50 border-slate-50 opacity-40 cursor-not-allowed'
                      : 'bg-white border-slate-50 hover:border-orange-200 hover:bg-orange-50/20'
                }`}
                onClick={() => !isLeaveDay && onDateSelect(day)}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isSelected ? 'text-white/80' : 'text-slate-400'
                }`}>
                  {format(day, "EEE")}
                </span>
                <span className={`text-xl font-black leading-none ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}>
                  {format(day, "d")}
                </span>
                {isToday && !isSelected && (
                  <div className="absolute top-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
                {isLeaveDay && (
                   <div className="text-[8px] font-bold text-red-500 uppercase">Closed</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
