"use client";

import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format, addDays, startOfToday, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const today = startOfToday();

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Date</h3>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8 px-4">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors border border-slate-100"
          >
            <FiChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h4>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors border border-slate-100"
          >
            <FiChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
          {days.map((day, i) => {
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isPast = day < today && !isSameDay(day, today);
            
            return (
              <div 
                key={i}
                className={`flex-shrink-0 w-14 flex flex-col items-center gap-3 py-4 rounded-2xl transition-all duration-300 snap-center cursor-pointer ${
                  isSelected 
                    ? 'bg-orange-500 shadow-lg shadow-orange-200 ring-4 ring-orange-50' 
                    : isPast 
                      ? 'opacity-40 pointer-events-none' 
                      : 'hover:bg-slate-50 border border-slate-50'
                }`}
                onClick={() => !isPast && onDateSelect(day)}
              >
                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                  isSelected ? 'text-white/80' : 'text-slate-400'
                }`}>
                  {format(day, "EEE")}
                </span>
                <span className={`text-lg font-black leading-none ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}>
                  {format(day, "d")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
